<template>
   <section :id="id" ref="theElement" class="ez-page-section">
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
import { inject, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import { pageSectionsKey } from './page-sections'

const props = defineProps<{
   id: string
   title: string
   subtitle?: string
}>()

const theElement = ref<HTMLElement | null>(null)
const theContext = inject(pageSectionsKey, null)

/** Cards inside this section with a `toc-id` become TOC sub-entries. */
function sync() {
   if (!theContext || !theElement.value) return
   const children = Array.from(theElement.value.querySelectorAll<HTMLElement>('[data-toc-title]'))
      .map((element) => ({ id: element.id, title: element.dataset.tocTitle ?? '' }))
      .filter((child) => child.id && child.title)
   theContext.register({ id: props.id, title: props.title, children })
}

onMounted(sync)
onUpdated(sync)
onBeforeUnmount(() => theContext?.unregister(props.id))
</script>

<style scoped>
.ez-page-section {
   scroll-margin-top: calc(var(--sizing-toolbar-height) + 16px);
}

.ez-page-section__header {
   margin-bottom: 12px;
}

.ez-page-section__title {
   margin: 0;
   font-size: var(--text-lg);
   font-weight: 700;
}

.ez-page-section__subtitle {
   margin: 2px 0 0;
   color: var(--color-foreground-muted);
   font-size: var(--text-sm);
}

.ez-page-section__body {
   display: flex;
   flex-direction: column;
   gap: var(--card-gap);
}
</style>
