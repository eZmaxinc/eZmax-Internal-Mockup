<template>
   <component
      :is="as"
      class="ez-layout"
      :class="{ 'ez-layout--debug': theDebugEnabled }"
      :data-responsive="theBreakpointSource"
      :data-container="container ? '' : undefined"
      :data-direction="direction"
      :data-layout-cols="theColumnVariables?.thresholds"
      :data-layout-span="theSpanVariables?.thresholds"
      :style="theBoxStyle"
      :title="theDebugEnabled ? theDebugTooltip : undefined"
   >
      <slot />
   </component>
</template>

<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { columnsToVariables, gapStyle, LAYOUT_KEY, resolveLayoutBreakpointSources, spanToVariables, type TLayoutColumns, type TLayoutDirection, type TLayoutGap, type TLayoutSpan } from './layout'
import './layout.css'

const theParentLayout = inject(LAYOUT_KEY, null)

const props = withDefaults(defineProps<{
   /** Columns of the grid: a count, or counts per threshold ({ xs: 1, md: 2 }) */
   columns?: TLayoutColumns
   /** A number is a multiple of 0.25rem (4 → 1rem), a string any length; { row, column } for two gaps */
   gap?: TLayoutGap
   /** grid (default): 12 columns · subgrid: the columns of the parent · wrap: side by side, wrapping · stack: one below the other */
   direction?: TLayoutDirection
   /** Place in a parent ez-layout, when this one is nested without an ez-layout-col */
   span?: TLayoutSpan
   /** true: the descendants measure their thresholds on this element, not on the window; false: on the window again */
   container?: boolean
   /** Outlines the grid and labels each column, for this layout and the ones inside */
   debug?: boolean
   /** Renders as another element (section, ul…) */
   as?: string
}>(), {
   columns: 12,
   gap: 'var(--card-gap, var(--space-gap-md))',
   direction: 'grid',
   span: undefined,
   container: undefined,
   debug: undefined,
   as: 'div',
})

// Where the thresholds of this element are measured; container=true concerns its descendants
const theBreakpointSources = computed(() => resolveLayoutBreakpointSources(props.container, theParentLayout?.childBreakpointSource.value ?? 'viewport'))
const theBreakpointSource = computed(() => theBreakpointSources.value.breakpointSource)
const theChildBreakpointSource = computed(() => theBreakpointSources.value.childBreakpointSource)

const theDebugEnabled = computed(() => props.debug ?? theParentLayout?.debugEnabled.value ?? false)
const theDirection = computed(() => props.direction)

// In a subgrid, the columns come from the parent
const theColumnVariables = computed(() => (props.direction === 'subgrid' ? undefined : columnsToVariables(props.columns)))

// Without a span, the element keeps the placement its parent gives it
const theSpanVariables = computed(() => (props.span === undefined ? undefined : spanToVariables(props.span)))

// In a subgrid without its own gap, « normal » takes the gap of the parent
const theBoxStyle = computed(() => {
   const gap = props.direction === 'subgrid' && props.gap === undefined ? 'gap: normal' : gapStyle(props.gap)
   return [gap, theColumnVariables.value?.style, theSpanVariables.value?.style].filter(Boolean).join('; ')
})

// A native tooltip to inspect the grid without adding a cell
const theDebugTooltip = computed(() => {
   const columns = props.direction === 'subgrid' ? 'héritées du parent' : JSON.stringify(props.columns)
   return [`direction: ${props.direction}`, `span: ${props.span === undefined ? 'auto' : JSON.stringify(props.span)}`, `colonnes: ${columns}`, `gap: ${JSON.stringify(props.gap)}`, `seuils: ${theBreakpointSource.value}`, `descendants: ${theChildBreakpointSource.value}`].join(' · ')
})

provide(LAYOUT_KEY, {
   breakpointSource: theBreakpointSource,
   childBreakpointSource: theChildBreakpointSource,
   debugEnabled: theDebugEnabled,
   direction: theDirection,
})
</script>

<style scoped>
/* The grid itself is in layout.css (unscoped, in @layer components); here only the debug outline */
.ez-layout {
   --ez-layout-debug-outline: var(--color-info);
}

.ez-layout--debug {
   border-radius: var(--radius-sm);
   outline: 1px dashed var(--ez-layout-debug-outline);
}
</style>
