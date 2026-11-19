<template>
   <component
      :is="as"
      class="ez-layout-col"
      :class="{ 'ez-layout-col--first-below-md': firstBelowMd, 'ez-layout-col--debug': theDebugEnabled }"
      :style="theSpanVariables.style"
      :data-layout-span="theSpanVariables.thresholds"
      :data-layout-flex="isFlexSpan ? '' : undefined"
      :data-responsive="theBreakpointSource"
      :data-container="container ? '' : undefined"
   >
      <template v-if="theDebugEnabled">
         <span class="ez-layout-col__debug-label">{{ [name, JSON.stringify(theSpan), theBreakpointSource].filter(Boolean).join(' ') }}</span>
         <span v-if="isSlotContentEmpty($slots.default?.())" class="ez-layout-col__debug-empty">
            {{ $gettext('Colonne vide') }} {{ name }}
         </span>
      </template>

      <slot />
   </component>
</template>

<script setup lang="ts">
import { Comment, computed, Fragment, inject, provide, Text, type VNode } from 'vue'
import { flexSpanToVariables, LAYOUT_KEY, legacyColsToSpan, resolveLayoutBreakpointSources, spanToVariables, type TLayoutSpan, type TLegacyLayoutCols } from './layout'
import './layout.css'

const theParentLayout = inject(LAYOUT_KEY, null)

const props = withDefaults(defineProps<{
   /** Columns out of the parent's (12): a count, or counts per threshold ({ xs: 12, md: 8 }); none = the whole row */
   span?: TLayoutSpan
   /** Before production's span: { base: 12, md: 8 }, base being xs. Kept for the existing prototypes; prefer span */
   cols?: TLegacyLayoutCols
   /** The column goes first below md (1024px): the right column of a form, in production */
   firstBelowMd?: boolean
   /** true: the descendants measure their thresholds on this column, not on the window */
   container?: boolean
   /** Its label in debug mode */
   name?: string
   /** Renders as another element (section, li…) */
   as?: string
}>(), {
   span: undefined,
   cols: undefined,
   container: undefined,
   name: undefined,
   as: 'div',
})

const theSpan = computed(() => props.span ?? (props.cols === undefined ? undefined : legacyColsToSpan(props.cols)))

const theBreakpointSources = computed(() => resolveLayoutBreakpointSources(props.container, theParentLayout?.childBreakpointSource.value ?? 'viewport'))
const theBreakpointSource = computed(() => theBreakpointSources.value.breakpointSource)
const theChildBreakpointSource = computed(() => theBreakpointSources.value.childBreakpointSource)

const theDebugEnabled = computed(() => theParentLayout?.debugEnabled.value ?? false)

// In a wrap or stack parent, the span gives a width; without one, the column keeps its natural size
const isFlexSpan = computed(() => {
   const parentDirection = theParentLayout?.direction.value
   return theSpan.value !== undefined && (parentDirection === 'wrap' || parentDirection === 'stack')
})

const theSpanVariables = computed(() => (isFlexSpan.value ? flexSpanToVariables(theSpan.value) : spanToVariables(theSpan.value)))

/** The content renders nothing: no slot, a false v-if, or blank text */
function isSlotContentEmpty(nodes: VNode[] = []): boolean {
   return nodes.every((node) => node.type === Comment || (node.type === Text && !String(node.children).trim()) || (node.type === Fragment && isSlotContentEmpty(node.children as VNode[])))
}

if (theParentLayout) {
   provide(LAYOUT_KEY, {
      breakpointSource: theBreakpointSource,
      childBreakpointSource: theChildBreakpointSource,
      debugEnabled: theParentLayout.debugEnabled,
      direction: theParentLayout.direction,
   })
}
</script>

<style scoped>
@reference "../../../tokens/ez-tokens.css";

/*
 * The placement is in layout.css. Here, what ez-proto adds to production: the cards of a column stack with the
 * gap of the cards (--card-gap), and a column can go first below md.
 */
.ez-layout-col {
   --ez-layout-col-gap: var(--card-gap, var(--space-gap-md));
   --ez-layout-col-debug-border: var(--color-accent);

   display: flex;
   flex-direction: column;
   gap: var(--ez-layout-col-gap);
}

@media (width < theme(--breakpoint-md)) {
   .ez-layout-col--first-below-md {
      order: -1;
   }
}

.ez-layout-col--debug {
   padding: 0.25rem;
   border: 1px dashed var(--ez-layout-col-debug-border);
   border-radius: var(--radius-sm);
}

.ez-layout-col__debug-label {
   width: fit-content;
   padding: 0 0.375rem;
   border-radius: var(--radius-sm);
   background: var(--color-surface-accent);
   color: var(--color-foreground-accent);
   font-family: var(--font-mono);
   font-size: var(--text-xs);
}

.ez-layout-col__debug-empty {
   padding: var(--space-gap-sm);
   border-radius: var(--radius-sm);
   background: var(--color-surface-negative);
   color: var(--color-foreground-negative);
   font-size: var(--text-xs);
}
</style>
