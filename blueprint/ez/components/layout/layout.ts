/*
 * The layout of production (ezmax-library-quasar: utils/layout-composition.ts, components/layout/context.ts).
 * A 12-column grid whose columns, spans and gaps can change at named or numeric thresholds, measured on the
 * viewport or on a container; and a composition: a tree of sections and columns, one slot per leaf.
 *
 * The values reach the elements as custom properties (--layout-*); layout.css reads them, and the rules of each
 * threshold are generated once per page, below. The names follow production so the folder copies over as is.
 */
import type { ComputedRef, InjectionKey, Slots } from 'vue'

/** The same thresholds as --breakpoint-* in ez-tokens.css and Quasar in production (sm 600, md 1024, lg 1440, xl 1920) */
export const LAYOUT_BREAKPOINT_WIDTHS = { xs: 0, sm: 600, md: 1024, lg: 1440, xl: 1920 } as const
export type TBreakpoint = keyof typeof LAYOUT_BREAKPOINT_WIDTHS
export const LAYOUT_BREAKPOINTS = Object.keys(LAYOUT_BREAKPOINT_WIDTHS) as TBreakpoint[]
export type TLayoutBreakpointSource = 'viewport' | 'container'
type TLayoutCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/** A fixed count, or counts per threshold, named (`md`) or in pixels (`900`): `{ xs: 12, md: 6 }` */
export type TLayoutSpan = TLayoutCount | Partial<Record<TBreakpoint | number, TLayoutCount>>
export type TLayoutColumns = TLayoutSpan

/** grid: 12 columns · subgrid: the columns of the parent · wrap: side by side, wrapping · stack: one below the other */
export type TLayoutDirection = 'grid' | 'stack' | 'subgrid' | 'wrap'

/** A number is a multiple of 0.25rem (4 → 1rem), as Tailwind; a string is any CSS length ('var(--space-gap-md)') */
export type TLayoutGapScalar = number | string

export interface ILayoutGapAxes {
   row?: TLayoutGapScalar
   column?: TLayoutGapScalar
}

export type TLayoutGap = TLayoutGapScalar | ILayoutGapAxes

export function isLayoutGapAxes(gap: TLayoutGap): gap is ILayoutGapAxes {
   return typeof gap === 'object' && gap !== null
}

export type TLayoutColProps = Record<string, unknown>

export type TTranslate = (value: string) => string

// ─── Context (compound: ez-layout provides, its columns inject) ───────────

export interface ILayoutContext {
   breakpointSource: ComputedRef<TLayoutBreakpointSource>
   childBreakpointSource: ComputedRef<TLayoutBreakpointSource>
   debugEnabled: ComputedRef<boolean>
   direction: ComputedRef<TLayoutDirection>
}

export const LAYOUT_KEY: InjectionKey<ILayoutContext> = Symbol('ez-layout')
export const LAYOUT_COMPOSITION_SLOTS_KEY: InjectionKey<Slots> = Symbol('ez-layout-composition-slots')

// ─── Options ───────────────────────────────────────────

export interface ILayoutGridOptions {
   columns?: TLayoutColumns
   gap?: TLayoutGap
}

export interface ILayoutCompositionOptions {
   /** Measure the thresholds on the composition rather than on the window */
   container?: boolean
   /** The grid that places the sections */
   sections?: ILayoutGridOptions
   /** The grid inside the sections (inherited by the groups) */
   cols?: ILayoutGridOptions
}

export interface IResolvedLayoutGrid {
   columns: TLayoutColumns
   gap: TLayoutGap
}

export interface IResolvedLayoutOptions {
   container: boolean
   sections: IResolvedLayoutGrid
   cols: IResolvedLayoutGrid
}

export const LAYOUT_DEFAULT_OPTIONS: IResolvedLayoutOptions = {
   container: false,
   sections: { columns: 12, gap: 6 },
   cols: { columns: 12, gap: 4 },
}

// ─── Structure ───────────────────────────────────────────

export interface ILayoutContainerOptions {
   container?: boolean
}

/** Where the thresholds of a node are measured, and where those of its descendants are. */
export function resolveLayoutBreakpointSources(container: boolean | undefined, inheritedBreakpointSource: TLayoutBreakpointSource, isRoot = false): { breakpointSource: TLayoutBreakpointSource, childBreakpointSource: TLayoutBreakpointSource } {
   if (isRoot && container) {
      return { breakpointSource: 'container', childBreakpointSource: 'container' }
   }

   const breakpointSource = container === false ? 'viewport' : inheritedBreakpointSource
   const childBreakpointSource = container ? 'container' : breakpointSource
   return { breakpointSource, childBreakpointSource }
}

interface ILayoutColBase extends ILayoutContainerOptions {
   id: string
   span?: TLayoutSpan
   class?: string
}

/** A column of a composition: a leaf (a slot) or a group of columns */
export type ILayoutCol =
   | (ILayoutColBase & {
      /** A valid JS identifier (camelCase): it names the slot */
      slot: string
      label?: string
      props?: TLayoutColProps
      cols?: never
      direction?: never
      columns?: never
      gap?: never
   })
   | (ILayoutColBase &
      ILayoutGridOptions & {
      cols: readonly ILayoutCol[]
      direction?: TLayoutDirection
      slot?: never
      label?: never
      props?: never
   })

export type TLayoutLeafCol = Extract<ILayoutCol, { slot: string }>

export type TLayoutGroupCol = Extract<ILayoutCol, { cols: readonly ILayoutCol[] }>

export interface ILayoutSection extends ILayoutGridOptions, ILayoutContainerOptions {
   key: string
   title?: string
   span?: TLayoutSpan
   direction?: TLayoutDirection
   cols: readonly ILayoutCol[]
}

export type TLayoutComposition = readonly ILayoutSection[]

export type TLayoutCompositionFactory<T extends TLayoutComposition> = (t: TTranslate) => T

export type TLayoutCompositionDefinition<T extends TLayoutComposition> = TLayoutCompositionFactory<T> & { readonly options: IResolvedLayoutOptions }

export function resolveGrid(parent: IResolvedLayoutGrid, override?: ILayoutGridOptions): IResolvedLayoutGrid {
   return {
      columns: override?.columns ?? parent.columns,
      gap: override?.gap ?? parent.gap,
   }
}

export function resolveChildGrid(parent: IResolvedLayoutGrid, override: ILayoutGridOptions & { direction?: TLayoutDirection }, defaults: IResolvedLayoutGrid = parent): IResolvedLayoutGrid {
   return override.direction === 'subgrid' ? { columns: parent.columns, gap: override.gap ?? parent.gap } : resolveGrid(defaults, override)
}

export function resolveLayoutOptions(options: ILayoutCompositionOptions = {}): IResolvedLayoutOptions {
   return {
      container: options.container ?? LAYOUT_DEFAULT_OPTIONS.container,
      sections: resolveGrid(LAYOUT_DEFAULT_OPTIONS.sections, options.sections),
      cols: resolveGrid(LAYOUT_DEFAULT_OPTIONS.cols, options.cols),
   }
}

/**
 * Declares a composition for ez-layout-composition: a function of the translation (the titles), with its options.
 * `const` keeps the slot names, so the slots of the composition are typed.
 */
export function defineLayoutComposition<const T extends TLayoutComposition>(factory: TLayoutCompositionFactory<T>, options: ILayoutCompositionOptions = {}): TLayoutCompositionDefinition<T> {
   const definition = (t: TTranslate): T => factory(t)
   return Object.assign(definition, { options: resolveLayoutOptions(options) })
}

// ─── Slot inference ───────────────────────────────────────────

/** The deepest nesting of groups (bounds the recursion of the types) */
type TMaxDepth = 8

type TSlotNamesFromCol<C, D extends unknown[] = []> = D['length'] extends TMaxDepth ? never : C extends { slot: infer SlotName extends string } ? SlotName : C extends { cols: infer Children extends readonly ILayoutCol[] } ? TSlotNamesFromCol<Children[number], [...D, unknown]> : never

export type TLayoutSlotName<T extends TLayoutComposition> = TSlotNamesFromCol<T[number]['cols'][number]>

type TLeafFromCol<C, D extends unknown[] = []> = D['length'] extends TMaxDepth ? never : C extends { slot: string } ? C : C extends { cols: infer Children extends readonly ILayoutCol[] } ? TLeafFromCol<Children[number], [...D, unknown]> : never

type TLayoutLeaf<T extends TLayoutComposition> = TLeafFromCol<T[number]['cols'][number]>

export type TLayoutSlotProps<T extends TLayoutComposition, K extends string> = Omit<TLayoutLeafCol, 'slot' | 'label' | 'props'> & {
   slot: K
   label?: string
   props: Extract<TLayoutLeaf<T>, { slot: K }> extends { props: infer P } ? P : Record<never, never>
}

export type TLayoutFieldSlotProps<T extends TLayoutComposition> = TLayoutSlotName<T> extends infer K ? (K extends string ? TLayoutSlotProps<T, K> : never) : never

// ─── Rendering helpers ───────────────────────────────────────────

export function isLayoutGroup(col: ILayoutCol): col is TLayoutGroupCol {
   return Array.isArray(col.cols)
}

export function gapToCss(gap: TLayoutGapScalar): string {
   return typeof gap === 'number' ? `${gap * 0.25}rem` : gap
}

/** A numeric key wins over a named one of the same width. */
function responsiveEntries(value: TLayoutSpan | undefined): [number, number][] {
   if (typeof value === 'number') return [[0, value]]
   const entries = new Map<number, number>()
   for (const key of LAYOUT_BREAKPOINTS) {
      const count = value?.[key]
      if (count !== undefined) entries.set(LAYOUT_BREAKPOINT_WIDTHS[key], count)
   }
   for (const [key, count] of Object.entries(value ?? {})) {
      if (LAYOUT_BREAKPOINTS.includes(key as TBreakpoint) || count === undefined) continue
      const width = Number(key)
      if (!key.trim() || !Number.isFinite(width) || width < 0) {
         throw new RangeError(`Seuil de layout invalide: ${key}`)
      }
      entries.set(width, count)
   }
   return [...entries].sort(([a], [b]) => a - b)
}

function valueAt(entries: readonly [number, number][], width: number, fallback: number): number {
   let current = fallback
   for (const [threshold, count] of entries) {
      if (threshold > width) break
      current = count
   }
   return current
}

export function resolveColumns(columns: TLayoutColumns): Record<TBreakpoint, number> {
   const entries = responsiveEntries(columns)
   return Object.fromEntries(LAYOUT_BREAKPOINTS.map((key) => [key, valueAt(entries, LAYOUT_BREAKPOINT_WIDTHS[key], 1)])) as Record<TBreakpoint, number>
}

export function resolveSpan(span: TLayoutSpan | undefined, columns: TLayoutColumns): Record<TBreakpoint, number> {
   const columnCounts = resolveColumns(columns)
   const entries = responsiveEntries(span)
   return Object.fromEntries(LAYOUT_BREAKPOINTS.map((key) => [key, Math.min(valueAt(entries, LAYOUT_BREAKPOINT_WIDTHS[key], columnCounts[key]), columnCounts[key])])) as Record<TBreakpoint, number>
}

function thresholdToken(width: number): string {
   return String(width).replace('.', '_')
}

function thresholdRule(width: number): string {
   const token = thresholdToken(width)
   const declarations = (breakpointSource: TLayoutBreakpointSource) =>
      `[data-responsive='${breakpointSource}'][data-layout-cols~='${token}'] { --layout-column-count: var(--layout-cols-${token}); } [data-responsive='${breakpointSource}'][data-layout-span~='${token}'] { --layout-span: var(--layout-span-${token}); }`
   return `@layer components { @media (min-width: ${width}px) { ${declarations('viewport')} } @container layout-composition (min-width: ${width}px) { ${declarations('container')} } }`
}

const theRegisteredThresholds: number[] = []
let theThresholdSheet: CSSStyleSheet | undefined

/** One rule per threshold, shared by the whole page, sorted by width so the cascade follows the thresholds. */
function registerLayoutThreshold(width: number): void {
   if (theRegisteredThresholds.includes(width)) return
   if (typeof document === 'undefined' || !document.adoptedStyleSheets) return

   if (!theThresholdSheet) {
      theThresholdSheet = new CSSStyleSheet()
      document.adoptedStyleSheets.push(theThresholdSheet)
   }

   const nextIndex = theRegisteredThresholds.findIndex((registered) => registered > width)
   const index = nextIndex === -1 ? theRegisteredThresholds.length : nextIndex
   theThresholdSheet.insertRule(thresholdRule(width), index)
   theRegisteredThresholds.splice(index, 0, width)
}

export interface ILayoutVariables {
   /** The declarations set on the element: `--layout-cols-0: 2; --layout-cols-900: 3` */
   style: string
   /** The thresholds, for `data-layout-cols` or `data-layout-span`. Empty without threshold: the attribute stays. */
   thresholds: string
}

function responsiveVariables(value: TLayoutSpan | undefined, name: 'layout-cols' | 'layout-span', format: (count: number) => string, missingBase: string): ILayoutVariables {
   const entries = responsiveEntries(value)
   const declarations = entries[0]?.[0] === 0 ? [] : [`--${name}-0: ${missingBase}`]
   const thresholds: string[] = []

   for (const [width, count] of entries) {
      if (!Number.isInteger(count) || count < 1 || count > 12) {
         throw new RangeError(`Nombre de colonnes invalide: ${count}. Utiliser un entier de 1 à 12.`)
      }

      const token = thresholdToken(width)
      declarations.push(`--${name}-${token}: ${format(count)}`)

      if (width > 0) {
         registerLayoutThreshold(width)
         thresholds.push(token)
      }
   }

   return { style: declarations.join('; '), thresholds: thresholds.join(' ') }
}

export function columnsToVariables(columns: TLayoutColumns): ILayoutVariables {
   return responsiveVariables(columns, 'layout-cols', String, '1')
}

/** Without a value at the base, the element takes the whole row. */
export function spanToVariables(span: TLayoutSpan | undefined): ILayoutVariables {
   return responsiveVariables(span, 'layout-span', (count) => `span ${count} / span ${count}`, '1 / -1')
}

/** In a wrap or stack parent, the span gives a width: see layout.css. */
export function flexSpanToVariables(span: TLayoutSpan | undefined): ILayoutVariables {
   return responsiveVariables(span, 'layout-span', String, 'var(--layout-column-count)')
}

/** Always publishes the length: layout.css and the flex width read it. */
export function gapStyle(gap: TLayoutGap): string {
   if (isLayoutGapAxes(gap)) {
      const row = gap.row !== undefined ? gapToCss(gap.row) : undefined
      const column = gap.column !== undefined ? gapToCss(gap.column) : undefined
      const layoutGap = column ?? row
      const parts = [`gap: ${row ?? 'normal'} ${column ?? 'normal'}`]

      if (layoutGap !== undefined) parts.push(`--layout-gap: ${layoutGap}`)

      return parts.join('; ')
   }
   return `--layout-gap: ${gapToCss(gap)}`
}

// ─── Before production's API (ez-proto ≤ tokens 2.1) ───────────

/** The `cols` of the former ez-layout-col: `{ base, md, lg }`, `base` being production's `xs` */
export type TLegacyLayoutCols = number | { base?: number, md?: number, lg?: number }

export function legacyColsToSpan(cols: TLegacyLayoutCols): TLayoutSpan {
   if (typeof cols === 'number') return cols as TLayoutCount
   const span: Partial<Record<TBreakpoint, TLayoutCount>> = {}
   if (cols.base !== undefined) span.xs = cols.base as TLayoutCount
   if (cols.md !== undefined) span.md = cols.md as TLayoutCount
   if (cols.lg !== undefined) span.lg = cols.lg as TLayoutCount
   return span
}
