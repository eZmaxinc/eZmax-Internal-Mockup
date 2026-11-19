<template>
   <div ref="root" class="ez-page-sections" :class="{ 'ez-page-sections--with-toc': toc }">
      <div class="ez-page-sections__content">
         <!-- Below md: a sticky bar says where you are, its button opens the TOC as a menu -->
         <div v-if="toc && theActiveSection" class="ez-page-sections__nav">
            <span class="ez-page-sections__nav-label">
               <span class="ez-page-sections__nav-section">{{ theNavLabel[0] }}</span>
               <template v-if="theNavLabel[1]"> - {{ theNavLabel[1] }}</template>
            </span>
            <div ref="menu" class="ez-page-sections__menu-anchor">
               <ez-btn
                  variant="flat"
                  size="sm"
                  icon="chevronRight"
                  class="ez-page-sections__toggle"
                  :class="{ 'ez-page-sections__toggle--open': isTocOpen }"
                  :aria-label="$gettext('Sur cette page')"
                  :aria-expanded="isTocOpen"
                  @click="onToggleToc"
               />
               <div v-if="isTocOpen" class="ez-page-sections__menu" @click="onMenuClick">
                  <slot name="toc" v-bind="theContext">
                     <ez-page-sections-toc />
                  </slot>
               </div>
            </div>
         </div>

         <div class="ez-page-sections__stack">
            <slot />
         </div>
      </div>

      <aside v-if="toc" class="ez-page-sections__aside">
         <slot name="toc" v-bind="theContext">
            <ez-page-sections-toc />
         </slot>
      </aside>
   </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, readonly, ref, shallowReadonly, useTemplateRef, watch } from 'vue'
import EzBtn from '../btn/ez-btn.vue'
import EzPageSectionsToc from './ez-page-sections-toc.vue'
import { createRegistry, findScroller, pageSectionsKey, viewportOf, type AnchorMeta, type PageSectionsContext, type ScrollTarget, type SectionMeta } from './page-sections'

const props = withDefaults(defineProps<{
   /** What scrolls the page; default: the nearest ancestor that scrolls, else the window */
   scrollTarget?: () => ScrollTarget | null
   /** Where a section becomes the active one, in px from the top of the visible area; default: under the app toolbar */
   activeOffset?: number
   /** The table of contents: on the right from md, in a menu below */
   toc?: boolean
}>(), {
   scrollTarget: undefined,
   activeOffset: undefined,
   toc: true,
})

defineSlots<{
   default(): unknown
   /** Replaces the TOC (on the right and in the menu); receives the context */
   toc(context: PageSectionsContext): unknown
}>()

const theRootRef = useTemplateRef<HTMLElement>('root')
const theMenuRef = useTemplateRef<HTMLElement>('menu')

const { list: theSections, register } = createRegistry<SectionMeta>()
const { list: theAnchors, register: registerAnchor } = createRegistry<AnchorMeta>()
const theActiveId = ref<string | null>(null)
const theActiveAnchorId = ref<string | null>(null)
const isCompact = ref(false)
const isTocOpen = ref(false)
let theFrame = 0
let theCompactQuery: MediaQueryList | null = null
let theArrivedTimer = 0
/** How long the anchor reached by a click keeps data-toc-arrived */
const ARRIVED_MS = 2500

const theActiveSection = computed(() => theSections.value.find((section) => section.id === theActiveId.value) ?? theSections.value[0])

const theActiveAnchor = computed(() => {
   const sectionId = theActiveSection.value?.id
   if (!sectionId || !theActiveAnchorId.value) return undefined
   return theAnchors.value.find((anchor) => anchor.id === theActiveAnchorId.value && anchor.sectionId === sectionId)
})

/** « Section » or « Section - Anchor », for the bar below md */
const theNavLabel = computed(() => {
   const section = theActiveSection.value?.label
   if (!section) return []
   const anchor = theActiveAnchor.value?.label
   return !anchor || anchor === section ? [section] : [section, anchor]
})

function scroller(): ScrollTarget {
   return props.scrollTarget?.() ?? findScroller(theRootRef.value)
}

/** The line a section must pass to become active: under the app toolbar, with some room */
function offset(): number {
   if (props.activeOffset !== undefined) return props.activeOffset
   const toolbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sizing-toolbar-height')) || 0
   return toolbar + 24
}

async function scrollTo(id: string) {
   const element = document.getElementById(id)
   if (!element) return
   const target = scroller()
   const { top, scrolled } = viewportOf(target)
   target.scrollTo({ top: element.getBoundingClientRect().top - top + scrolled - offset() + 8, behavior: 'smooth' })
   const anchor = theAnchors.value.find((item) => item.id === id)
   theActiveId.value = anchor ? anchor.sectionId : id
   theActiveAnchorId.value = anchor ? anchor.id : null
   // A section leads to its first anchor (the first card): that is where the eye lands
   markArrived(anchor?.el ?? theAnchors.value.find((item) => item.sectionId === id)?.el ?? element)
}

/** A hook for the page: the element a click of the TOC leads to carries data-toc-arrived for a moment */
function markArrived(element: HTMLElement) {
   window.clearTimeout(theArrivedTimer)
   document.querySelectorAll('[data-toc-arrived]').forEach((other) => other.removeAttribute('data-toc-arrived'))
   element.setAttribute('data-toc-arrived', '')
   theArrivedTimer = window.setTimeout(() => element.removeAttribute('data-toc-arrived'), ARRIVED_MS)
}

/** Scroll-spy: the last section whose top passed the line wins; then the last of its anchors that passed it */
function updateActive() {
   const target = scroller()
   const { top, isAtBottom } = viewportOf(target)
   const line = top + offset() + 1
   const passed = <T extends { el: HTMLElement }>(items: readonly T[]) => items.filter((item) => item.el.getBoundingClientRect().top <= line)

   const section = isAtBottom ? theSections.value.at(-1) : (passed(theSections.value).at(-1) ?? theSections.value[0])
   theActiveId.value = section?.id ?? null

   // None of its anchors passed the line yet (the top of the section): its first one
   const anchors = theAnchors.value.filter((anchor) => anchor.sectionId === section?.id)
   theActiveAnchorId.value = (isAtBottom ? anchors.at(-1) : (passed(anchors).at(-1) ?? anchors[0]))?.id ?? null
}

function onScroll() {
   cancelAnimationFrame(theFrame)
   theFrame = requestAnimationFrame(updateActive)
}

function onToggleToc() {
   isTocOpen.value = !isTocOpen.value
}

/** A click in the menu closes it, as an auto-close menu; the TOC stops it when it only opens a section */
function onMenuClick() {
   isTocOpen.value = false
}

function onDocumentClick(event: MouseEvent) {
   if (isTocOpen.value && !theMenuRef.value?.contains(event.target as Node)) isTocOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
   if (event.key === 'Escape') isTocOpen.value = false
}

function onCompactChange() {
   isCompact.value = theCompactQuery?.matches ?? false
   if (!isCompact.value) isTocOpen.value = false
}

const theContext: PageSectionsContext = {
   sections: shallowReadonly(theSections),
   anchors: shallowReadonly(theAnchors),
   activeId: readonly(theActiveId),
   activeAnchorId: readonly(theActiveAnchorId),
   isCompact: readonly(isCompact),
   register: (meta) => {
      const unregister = register(meta)
      onScroll()
      return unregister
   },
   registerAnchor: (meta) => {
      const unregister = registerAnchor(meta)
      onScroll()
      return unregister
   },
   scrollTo,
}

provide(pageSectionsKey, theContext)

// A hook for the page: the active anchor (a card, a block) carries data-toc-active; no style here, the page decides
watch([theActiveAnchorId, theAnchors], () => {
   for (const anchor of theAnchors.value) anchor.el.toggleAttribute('data-toc-active', anchor.id === theActiveAnchorId.value)
})

defineExpose({ scrollTo })

onMounted(() => {
   // The breakpoint comes from the tokens, through a variable of the component
   const breakpoint = getComputedStyle(theRootRef.value!).getPropertyValue('--ez-page-sections-breakpoint').trim()
   if (breakpoint) {
      theCompactQuery = window.matchMedia(`(width < ${breakpoint})`)
      theCompactQuery.addEventListener('change', onCompactChange)
      onCompactChange()
   }
   // Captured on the document: the scroll of the window and of any container reaches it
   document.addEventListener('scroll', onScroll, { passive: true, capture: true })
   window.addEventListener('resize', onScroll, { passive: true })
   document.addEventListener('click', onDocumentClick)
   document.addEventListener('keydown', onKeydown)
   updateActive()
})

onBeforeUnmount(() => {
   theCompactQuery?.removeEventListener('change', onCompactChange)
   document.removeEventListener('scroll', onScroll, { capture: true })
   window.removeEventListener('resize', onScroll)
   document.removeEventListener('click', onDocumentClick)
   document.removeEventListener('keydown', onKeydown)
   cancelAnimationFrame(theFrame)
   window.clearTimeout(theArrivedTimer)
})
</script>

<style scoped>
@reference "../../../tokens/ez-tokens.css";

.ez-page-sections {
   /* Variables first: what the layout depends on, read below */
   --ez-page-sections-breakpoint: theme(--breakpoint-md);
   --ez-page-sections-gap: var(--inset-page);
   --ez-page-sections-toc-width: 275px;
   --ez-page-sections-sticky-top: calc(var(--sizing-toolbar-height, 0px) + var(--space-inset-md));
   --ez-page-sections-nav-surface: var(--color-background);
   --ez-page-sections-nav-border: var(--color-border-muted);

   display: grid;
   grid-template-columns: minmax(0, 1fr);
   align-items: start;
   gap: var(--ez-page-sections-gap);
}

.ez-page-sections__content {
   display: flex;
   flex-direction: column;
   min-width: 0;
}

.ez-page-sections__stack {
   display: flex;
   flex-direction: column;
   gap: var(--ez-page-sections-gap);
   min-width: 0;
}

/* The bar below md: sticky under the toolbar, from one edge of the page to the other */
.ez-page-sections__nav {
   position: sticky;
   top: var(--sizing-toolbar-height, 0px);
   z-index: 10;
   display: flex;
   align-items: center;
   gap: var(--space-gap-sm);
   margin: 0 calc(-1 * var(--inset-page)) var(--space-gap-md);
   padding: var(--space-gap-sm) var(--inset-page);
   border-bottom: 1px solid var(--ez-page-sections-nav-border);
   background: var(--ez-page-sections-nav-surface);
   font-size: var(--text-sm);
}

.ez-page-sections__nav-label {
   flex: 1;
   min-width: 0;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.ez-page-sections__nav-section {
   font-weight: 500;
}

.ez-page-sections__menu-anchor {
   position: relative;
}

.ez-page-sections__toggle :deep(.ez-icon) {
   transform: rotate(90deg);
   transition: transform 0.2s;
}

.ez-page-sections__toggle--open :deep(.ez-icon) {
   transform: rotate(-90deg);
}

.ez-page-sections__menu {
   position: absolute;
   top: calc(100% + var(--space-gap-sm));
   right: 0;
   z-index: 20;
   width: min(var(--ez-page-sections-toc-width), 85vw);
   border-radius: var(--radius-lg);
   box-shadow: var(--shadow-overlay);
}

.ez-page-sections__aside {
   display: none;
}

@media (width >= theme(--breakpoint-md)) {
   .ez-page-sections--with-toc {
      grid-template-columns: minmax(0, 1fr) var(--ez-page-sections-toc-width);
   }

   .ez-page-sections__nav {
      display: none;
   }

   .ez-page-sections__aside {
      position: sticky;
      top: var(--ez-page-sections-sticky-top);
      display: block;
   }
}
</style>
