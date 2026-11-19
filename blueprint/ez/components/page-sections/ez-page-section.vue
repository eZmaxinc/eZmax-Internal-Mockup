<template>
   <!-- A level of the TOC: its label, centered and small above its content, and its icon in the TOC -->
   <component :is="as" :id="id" ref="section" class="ez-page-section">
      <ez-heading v-if="!hideLabel" variant="group" as="h2" class="ez-page-section__label">{{ label }}</ez-heading>
      <div class="ez-page-section__body">
         <slot />
      </div>
   </component>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, useTemplateRef } from 'vue'
import type { IconName } from '../../icons'
import EzHeading from '../heading/ez-heading.vue'
import { pageSectionKey, usePageSections } from './page-sections'

const props = withDefaults(defineProps<{
   /** Unique in the page: the anchor of the section */
   id: string
   /** Its name, above its content and in the TOC */
   label: string
   /** Its icon in the TOC */
   icon?: IconName
   /** In the TOC only, not above the content */
   hideLabel?: boolean
   /** Renders as another element */
   as?: string
}>(), {
   icon: undefined,
   as: 'section',
})

const theContext = usePageSections('ez-page-section')
provide(pageSectionKey, { id: props.id })

const theSectionRef = useTemplateRef<HTMLElement>('section')
let unregister: (() => void) | null = null

onMounted(() => {
   if (!theSectionRef.value) return
   unregister = theContext.register({ id: props.id, label: props.label, icon: props.icon, el: theSectionRef.value })
})

onBeforeUnmount(() => unregister?.())
</script>

<style scoped>
.ez-page-section {
   /* Variables first: what the section's look depends on, read below */
   --ez-page-section-gap: var(--card-gap, 1.25rem);
   --ez-page-section-label: var(--color-foreground-subtle);

   min-width: 0;
}

/* As production: small, uppercase, centered above the cards */
.ez-page-section__label {
   --ez-heading-color: var(--ez-page-section-label);

   margin-bottom: var(--space-inset-sm);
   font-weight: 600;
   letter-spacing: 0.04em;
   text-align: center;
   text-transform: uppercase;
}

.ez-page-section__body {
   display: flex;
   flex-direction: column;
   gap: var(--ez-page-section-gap);
   min-width: 0;
}
</style>
