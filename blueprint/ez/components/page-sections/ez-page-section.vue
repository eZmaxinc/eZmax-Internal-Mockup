<template>
   <section :id="id" ref="section" class="ez-page-section">
      <header class="ez-page-section__header">
         <h2 class="ez-page-section__title">{{ title }}</h2>
         <p v-if="subtitle" class="ez-page-section__subtitle">{{ subtitle }}</p>
      </header>
      <div class="ez-page-section__body">
         <slot />
      </div>
   </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated, useTemplateRef } from 'vue'
import { usePageSections } from './page-sections'

const theContext = usePageSections('ez-page-section')

const props = defineProps<{
   id: string
   title: string
   subtitle?: string
}>()

const theSectionRef = useTemplateRef<HTMLElement>('section')

/** Cards inside this section with a `toc-id` become TOC sub-entries. */
function sync() {
   if (!theSectionRef.value) return
   const children = Array.from(theSectionRef.value.querySelectorAll<HTMLElement>('[data-toc-title]'))
      .map((element) => ({ id: element.id, title: element.dataset.tocTitle ?? '' }))
      .filter((child) => child.id && child.title)
   theContext.register({ id: props.id, title: props.title, children })
}

onMounted(sync)
onUpdated(sync)
onBeforeUnmount(() => theContext.unregister(props.id))
</script>

<style scoped>
.ez-page-section {
   /* Variables first: what the section's look depends on, read below */
   --ez-page-section-gap: var(--card-gap, var(--space-gap-md));
   --ez-page-section-muted: var(--color-foreground-muted);

   scroll-margin-top: calc(var(--sizing-toolbar-height) + var(--space-gap-md));
}

.ez-page-section__header {
   margin-bottom: var(--space-inset-sm);
}

.ez-page-section__title {
   margin: 0;
   font-size: var(--text-lg);
   font-weight: 700;
}

.ez-page-section__subtitle {
   margin: 2px 0 0;
   color: var(--ez-page-section-muted);
   font-size: var(--text-sm);
}

.ez-page-section__body {
   display: flex;
   flex-direction: column;
   gap: var(--ez-page-section-gap);
}
</style>
