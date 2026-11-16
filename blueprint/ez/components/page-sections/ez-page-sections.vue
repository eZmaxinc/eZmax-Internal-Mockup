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
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'
import EzPageToc from './ez-page-toc.vue'
import { pageSectionsKey, type TocEntry } from './page-sections'

withDefaults(defineProps<{
   /** Sticky TOC on the right (≥ 1024px) */
   toc?: boolean
   tocTitle?: string
}>(), {
   toc: true,
   tocTitle: 'Sur cette page',
})

const theEntries = ref<TocEntry[]>([])
const theActiveId = ref<string | null>(null)

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

   const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
   if (atBottom && ids.length) current = ids[ids.length - 1]

   theActiveId.value = current
}

let theFrame = 0
function onScroll() {
   cancelAnimationFrame(theFrame)
   theFrame = requestAnimationFrame(updateActive)
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

provide(pageSectionsKey, {
   entries: theEntries,
   activeId: theActiveId,
   register,
   unregister,
   scrollTo,
})
</script>

<style scoped>
.ez-page-sections {
   display: grid;
   grid-template-columns: minmax(0, 1fr);
   gap: 24px;
}

.ez-page-sections__content {
   display: flex;
   flex-direction: column;
   gap: 32px;
   min-width: 0;
}

.ez-page-sections__toc {
   display: none;
}

@media (width >= 64rem) { /* md: TOC on the right */
   .ez-page-sections--with-toc {
      grid-template-columns: minmax(0, 1fr) 220px;
   }

   .ez-page-sections__toc {
      display: block;
   }
}
</style>
