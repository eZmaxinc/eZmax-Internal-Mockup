<template>
   <!-- A sub-entry of its section in the TOC: a card, a group of fields; its label between two lines, or hidden -->
   <component :is="as" :id="id" ref="anchor" class="ez-page-section-anchor">
      <div v-if="!hideLabel" class="ez-page-section-anchor__label">
         <span class="ez-page-section-anchor__line" />
         <span>{{ label ?? id }}</span>
         <span class="ez-page-section-anchor__line" />
      </div>
      <slot />
   </component>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { usePageSections, useSectionAnchor } from './page-sections'

const props = withDefaults(defineProps<{
   /** Unique in the page: the anchor of the sub-entry */
   id: string
   /** Its name in the TOC, and above its content */
   label?: string | null
   /** In the TOC only, not above the content (a card that has its own title) */
   hideLabel?: boolean
   /** Renders as another element */
   as?: string
}>(), {
   label: undefined,
   as: 'div',
})

usePageSections('ez-page-section-anchor')

const theAnchorRef = useTemplateRef<HTMLElement>('anchor')
useSectionAnchor(() => ({ id: props.id, label: props.label }), theAnchorRef)
</script>

<style scoped>
.ez-page-section-anchor {
   /* Variables first: what the anchor's look depends on, read below */
   --ez-page-section-anchor-color: var(--color-foreground-subtle);
   --ez-page-section-anchor-line: var(--color-border-muted);

   min-width: 0;
   scroll-margin-top: var(--space-inset-xl);
}

.ez-page-section-anchor__label {
   display: flex;
   align-items: center;
   gap: var(--space-gap-sm);
   margin-bottom: var(--space-inset-sm);
   color: var(--ez-page-section-anchor-color);
   font-size: var(--text-xs);
   font-weight: 600;
   letter-spacing: 0.04em;
   text-transform: uppercase;
}

.ez-page-section-anchor__line {
   flex-grow: 1;
   height: 1px;
   background: var(--ez-page-section-anchor-line);
}
</style>
