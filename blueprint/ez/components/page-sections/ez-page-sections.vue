<template>
   <div class="ez-page-sections" :class="{ 'ez-page-sections--with-toc': toc }">
      <div class="ez-page-sections__content">
         <slot />
      </div>
      <aside v-if="toc" class="ez-page-sections__toc">
         <ez-page-toc :title="tocTitle" />
      </aside>
   </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, readonly, ref } from 'vue'
import EzPageToc from './ez-page-toc.vue'
import { pageSectionsKey, type TocEntry } from './page-sections'

withDefaults(defineProps<{
   /** Sticky TOC on the right (≥ 1024px) */
   toc?: boolean
   /** Title of the TOC (default: « Sur cette page ») */
   tocTitle?: string
}>(), {
   toc: true,
})

const theEntries = ref<TocEntry[]>([])
const theActiveId = ref<string | null>(null)
let theFrame = 0

function scrollOffset(): number {
   const toolbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sizing-toolbar-height')) || 0
   return toolbar + 24
}

function register(entry: TocEntry) {
   const others = theEntries.value.filter((existing) => existing.id !== entry.id)
   theEntries.value = [...others, entry].sort((a, b) => {
      const elementA = document.getElementById(a.id)
      const elementB = document.getElementById(b.id)
      if (!elementA || !elementB) return 0
      return elementA.compareDocumentPosition(elementB) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
   })
   updateActive()
}

function unregister(id: string) {
   theEntries.value = theEntries.value.filter((entry) => entry.id !== id)
}

function scrollTo(id: string) {
   const element = document.getElementById(id)
   if (!element) return
   const top = element.getBoundingClientRect().top + window.scrollY - scrollOffset() + 8
   window.scrollTo({ top, behavior: 'smooth' })
   theActiveId.value = id
}

/** Scroll-spy: the last target whose top passed the offset line wins. */
function updateActive() {
   const ids = theEntries.value.flatMap((entry) => [entry.id, ...entry.children.map((child) => child.id)])
   const line = scrollOffset() + 1
   let current: string | null = ids[0] ?? null

   for (const id of ids) {
      const element = document.getElementById(id)
      if (element && element.getBoundingClientRect().top <= line) current = id
   }

   const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
   if (isAtBottom && ids.length) current = ids[ids.length - 1]

   theActiveId.value = current
}

function onScroll() {
   cancelAnimationFrame(theFrame)
   theFrame = requestAnimationFrame(updateActive)
}

// The children read the state, and change it only through the methods
provide(pageSectionsKey, {
   entries: readonly(theEntries),
   activeId: readonly(theActiveId),
   register,
   unregister,
   scrollTo,
})

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
@reference "../../../tokens/ez-tokens.css";

.ez-page-sections {
   /* Variables first: what the layout depends on, read below */
   --ez-page-sections-gap: var(--space-gap-lg);
   --ez-page-sections-section-gap: 32px;
   --ez-page-sections-toc-width: 220px;

   display: grid;
   grid-template-columns: minmax(0, 1fr);
   gap: var(--ez-page-sections-gap);
}

.ez-page-sections__content {
   display: flex;
   flex-direction: column;
   gap: var(--ez-page-sections-section-gap);
   min-width: 0;
}

.ez-page-sections__toc {
   display: none;
}

@media (width >= theme(--breakpoint-md)) { /* TOC on the right */
   .ez-page-sections--with-toc {
      grid-template-columns: minmax(0, 1fr) var(--ez-page-sections-toc-width);
   }

   .ez-page-sections__toc {
      display: block;
   }
}
</style>
