/*
 * The data of ez-info, the same shape as production (ezmax-library-quasar: components/info/types.ts, info-tone.ts,
 * info-entries.ts, composition/info-col.ts, composition/info-composition.ts), in one file.
 * Only the `flat` variant of production is here: its legacy rendering (buttons, inline edit, copy, tables) is not.
 *
 * A list of categories; each a list of items, laid out on the 12 columns of ez-layout. An item is drawn by an element:
 * boxed (a grey tile: a value, a count, or pills), pill (one rounded chip per item), list (one row per entry).
 */
import type { InjectionKey, Slots } from 'vue'
import { icons, type IconName } from '../../icons'
import { defineLayoutComposition, isLayoutGroup, type ILayoutCol, type TBreakpoint, type TLayoutGroupCol, type TLayoutLeafCol, type TLayoutSpan } from '../layout/layout'

// ─── Types ───────────────────────────────────────────

/** positive: on, done · neutral: a plain fact · muted: off. negative is drawn as muted on purpose, never red */
export type TInfoTone = 'positive' | 'negative' | 'muted' | 'neutral'

/** A number and its unit, in a small box on the right of the tile: « 13 jours » */
export interface IInfoMetric {
   amount: number | string
   unit?: string
}

/** One entry of a pill or a list: a boolean value says on (positive, check) or off (muted, cross); none is neutral */
export interface IInfoValue {
   label: string
   value?: string | number | boolean
   tone?: TInfoTone
   icon?: IconName
   icons?: IconName[]
}

export type TInfoEntry = string | number | boolean | IInfoValue

/** Columns out of 12: a count, or counts per threshold ({ xs: 12, md: 4 }); a Quasar class ('col-12 col-md-4') is read too */
export type TInfoCol = TLayoutSpan | string

export interface IInfoCategoryItems {
   /** The name of its slot in ez-info (#<key>); generated from the category when absent */
   key?: string
   label?: string
   /** A text, a count (IInfoMetric), entries (pills in a tile, rows in a list), or one entry (a pill) */
   value?: TInfoEntry | IInfoMetric | TInfoEntry[] | null
   /** boxed (default): a grey tile · pill: a rounded chip, side by side with the next pills · list: one row per entry */
   variant?: 'boxed' | 'pill' | 'list'
   /** Default: { xs: 6, sm: 4, lg: 3 } for a tile, the whole row for a list */
   col?: TInfoCol
   /** A line under the value */
   hint?: string
   /** A style on the value (a font, a size): the tile then grows with it */
   valueStyle?: Record<string, string>
   /** Explains the item: an info icon after the label */
   tooltip?: string
   /** A line across the whole row, instead of an item */
   separator?: boolean
   /** The whole row (production's former inline item) */
   inline?: boolean
   itemClass?: string
   /** The tile becomes a link: the value in the accent color, a fill on hover */
   onClick?: () => void
}

export interface IInfoCategory {
   /** The key of the category; generated when absent */
   name?: string
   title?: string
   icon?: IconName
   /** Frames the items: a tinted border when positive, the grey one otherwise (ez-info-item-group) */
   tone?: TInfoTone
   /** Its columns, as a sub-category of another one */
   col?: TInfoCol
   classes?: string
   /** false, null and undefined are skipped: `isAllowed && { … }` reads well */
   items?: (IInfoCategoryItems | false | null | undefined)[]
   /** Sub-categories, each framed by an ez-info-item-group */
   groups?: IInfoCategory[]
}

export function isInfoMetric(value: unknown): value is IInfoMetric {
   return typeof value === 'object' && value !== null && !Array.isArray(value) && 'amount' in value
}

export function isInfoValue(value: unknown): value is IInfoValue {
   return typeof value === 'object' && value !== null && !Array.isArray(value) && 'label' in value
}

/** Compound: the field slots of the root ez-info-category-cols, inherited by the nested groups */
export const INFO_FIELD_SLOTS_KEY: InjectionKey<Slots> = Symbol('ez-info-field-slots')

// ─── Tones ───────────────────────────────────────────

const INFO_TONE_RANKS: Record<TInfoTone, number> = { positive: 0, neutral: 1, negative: 2, muted: 2 }

/** The tone given (`IInfoValue.tone`) first; otherwise true → positive, false → muted, empty → neutral, any text → positive */
export function resolveInfoTone(entry: TInfoEntry | undefined | null): TInfoTone {
   if (entry === undefined || entry === null || entry === '') return 'neutral'
   if (typeof entry === 'boolean') return entry ? 'positive' : 'muted'

   if (typeof entry === 'object' && 'label' in entry) {
      return entry.tone ?? (entry.value === undefined ? 'neutral' : resolveInfoTone(entry.value))
   }

   return 'positive'
}

/** The positive entries first, then the neutral, then the muted; the order is kept within a tone */
export function sortByInfoTone<T extends TInfoEntry>(entries: readonly T[]): T[] {
   return [...entries].sort((a, b) => INFO_TONE_RANKS[resolveInfoTone(a)] - INFO_TONE_RANKS[resolveInfoTone(b)])
}

/** The modifier class of a tone: negative is drawn as muted */
export function infoToneClass(tone: TInfoTone): 'positive' | 'neutral' | 'muted' {
   return tone === 'negative' ? 'muted' : tone
}

// ─── Entries ───────────────────────────────────────────

/** What a pill or a list row shows: its text, tone and icons, resolved */
export interface IInfoEntryView {
   key: string
   text: string
   tone: TInfoTone
   icons: IconName[]
}

function getEntryIcons(entry: TInfoEntry): IconName[] {
   if (isInfoValue(entry) && entry.icons?.length) return entry.icons
   if (isInfoValue(entry) && entry.icon) return [entry.icon]

   const boolean = typeof entry === 'boolean' ? entry : isInfoValue(entry) && typeof entry.value === 'boolean' ? entry.value : undefined

   if (boolean !== undefined) return [boolean ? icons.success : icons.close]

   return []
}

export function toInfoEntryView(entry: TInfoEntry, index: number): IInfoEntryView {
   const text = isInfoValue(entry) ? entry.label : typeof entry === 'boolean' ? '' : String(entry ?? '')

   return { key: `${index}-${text}`, text, tone: resolveInfoTone(entry), icons: getEntryIcons(entry) }
}

/** No sorting here: ez-info sorts the pills and the lists */
export function toInfoEntryViews(entries: readonly TInfoEntry[]): IInfoEntryView[] {
   return entries.map((entry, index) => toInfoEntryView(entry, index))
}

// ─── Columns ───────────────────────────────────────────

type TColumnCount = Extract<TLayoutSpan, number>

function isColumnCount(value: number): value is TColumnCount {
   return Number.isInteger(value) && value >= 1 && value <= 12
}

export function hasInfoCol(col: TInfoCol | undefined): col is TInfoCol {
   return col !== undefined && col !== null && col !== ''
}

/** A count or thresholds as they are; Quasar classes ('col-12 col-md-4') as thresholds */
export function parseInfoCol(col: TInfoCol): TLayoutSpan {
   if (typeof col === 'number' || typeof col === 'object') return col

   const span: Partial<Record<TBreakpoint, TColumnCount>> = {}

   for (const [, breakpoint, columns] of col.matchAll(/\bcol-(?:(xs|sm|md|lg|xl)-)?(\d{1,2})\b/g)) {
      const columnCount = Number(columns)

      if (!isColumnCount(columnCount)) {
         throw new RangeError(`Nombre de colonnes invalide: ${columnCount}. Utiliser un entier de 1 à 12.`)
      }

      span[(breakpoint as TBreakpoint | undefined) ?? 'xs'] = columnCount
   }

   return Object.keys(span).length > 0 ? span : 6
}

// ─── Composition: the categories as a tree of ez-layout columns ───────────

export interface IInfoField extends TLayoutLeafCol {
   props: { item: IInfoCategoryItems }
}

/** A sub-category in the tree: drawn in an ez-info-item-group */
export type IInfoCompositionGroupCol = TLayoutGroupCol & {
   class?: string
   infoGroup: { title?: string, icon?: IconName, tone: TInfoTone }
}

export function isInfoCompositionGroup(col: ILayoutCol): col is IInfoCompositionGroupCol {
   return isLayoutGroup(col) && 'infoGroup' in col && Boolean(col.infoGroup)
}

/** The slot name of an item; `path` tells apart the sub-categories without a name (`info-0`, then `0-info-0`) */
function getItemKey(category: IInfoCategory, item: IInfoCategoryItems, index: number, path = ''): string {
   return item.key ?? `${category.name ?? `${path}info`}-${index}`
}

function getCategoryKey(category: IInfoCategory, index: number, path = ''): string {
   return category.name ?? `${path}cat-${index}`
}

function sanitize<T>(list: readonly (T | false | null | undefined)[]): T[] {
   return list.filter(Boolean) as T[]
}

/** Every item of a category and of its sub-categories */
export function flattenCategoryItems(category: IInfoCategory): IInfoCategoryItems[] {
   const nested = (category.groups ?? []).flatMap(flattenCategoryItems)

   return [...sanitize(category.items ?? []), ...nested]
}

function getItemSpan(item: IInfoCategoryItems): TLayoutSpan {
   if (item.separator) return 12
   if (hasInfoCol(item.col)) return parseInfoCol(item.col)
   if (item.inline || item.variant === 'list') return 12

   return { xs: 6, sm: 4, lg: 3 }
}

function getCategorySpan(category: IInfoCategory): TLayoutSpan {
   return hasInfoCol(category.col) ? parseInfoCol(category.col) : 12
}

function itemsToCols(category: IInfoCategory, path: string): ILayoutCol[] {
   const cols: ILayoutCol[] = []
   let thePillGroup: IInfoField[] | undefined

   for (const [index, item] of sanitize(category.items ?? []).entries()) {
      const itemKey = getItemKey(category, item, index, path)

      // Pills that follow each other share a row, side by side
      if (item.variant === 'pill' && !item.separator) {
         if (!thePillGroup) {
            thePillGroup = []
            cols.push({ id: `${itemKey}-pills`, span: 12, direction: 'wrap', gap: 2, cols: thePillGroup })
         }

         thePillGroup.push({ id: itemKey, slot: itemKey, label: item.label, props: { item } })
         continue
      }

      thePillGroup = undefined
      cols.push({ id: itemKey, slot: itemKey, label: item.label, span: getItemSpan(item), class: item.itemClass, props: { item } })
   }

   return cols
}

/** The columns of a category: its items, then its sub-categories */
export function getCategoryLayoutCols(category: IInfoCategory, path = ''): ILayoutCol[] {
   const cols = itemsToCols(category, path)

   for (const [index, sub] of (category.groups ?? []).entries()) {
      const subCols = getCategoryLayoutCols(sub, `${path}${index}-`)

      if (!subCols.length) continue

      const group: IInfoCompositionGroupCol = {
         id: getCategoryKey(sub, index, path),
         span: getCategorySpan(sub),
         class: sub.classes,
         infoGroup: { title: sub.title, icon: sub.icon, tone: sub.tone ?? 'neutral' },
         gap: 2,
         cols: subCols,
      }

      cols.push(group)
   }

   return cols
}

/** The categories as an ez-layout-composition: one section per category */
export function infoToComposition(data: IInfoCategory[]) {
   return defineLayoutComposition(
      () =>
         data.map((category, index) => ({
            key: getCategoryKey(category, index),
            title: category.title,
            cols: getCategoryLayoutCols(category),
         })),
      {
         sections: { gap: 3 },
         cols: { gap: 2 },
      },
   )
}
