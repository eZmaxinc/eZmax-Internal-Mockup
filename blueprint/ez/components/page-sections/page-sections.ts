/*
 * A long page in sections, with its table of contents (production: components/page/sections, and the composables
 * useActiveSection and useSectionAnchor, rewritten here).
 *
 * Compound: ez-page-sections provides the context; its sections and anchors register in it, the TOC reads it.
 * A section is a level of the TOC (a label, an icon); an anchor is a sub-entry of its section (a card, a group).
 */
import { inject, onBeforeUnmount, onMounted, ref, type InjectionKey, type Ref } from 'vue'
import type { IconName } from '../../icons'

export interface SectionMeta {
   id: string
   label: string
   icon?: IconName
   el: HTMLElement
}

export interface AnchorMeta {
   id: string
   label: string
   sectionId: string
   el: HTMLElement
}

/** What ez-page-sections shares with its children: its state read-only, and the methods that change it */
export interface PageSectionsContext {
   sections: Readonly<Ref<readonly SectionMeta[]>>
   anchors: Readonly<Ref<readonly AnchorMeta[]>>
   activeId: Readonly<Ref<string | null>>
   activeAnchorId: Readonly<Ref<string | null>>
   /** Below md: the TOC is a menu, a section with sub-entries opens instead of scrolling */
   isCompact: Readonly<Ref<boolean>>
   register: (meta: SectionMeta) => () => void
   registerAnchor: (meta: AnchorMeta) => () => void
   scrollTo: (id: string) => Promise<void>
}

export const pageSectionsKey: InjectionKey<PageSectionsContext> = Symbol('ez-page-sections')

/** The section around an anchor */
export const pageSectionKey: InjectionKey<{ id: string }> = Symbol('ez-page-section')

/** For a child of ez-page-sections: its context, or an error when used outside of it */
export function usePageSections(child: string): PageSectionsContext {
   const context = inject(pageSectionsKey, null)
   if (!context) throw new Error(`${child} doit être utilisé dans ez-page-sections`)
   return context
}

/** A list kept in the order of the page: the TOC follows the document, whatever the mount order */
export function createRegistry<T extends { id: string, el: HTMLElement }>() {
   const theList = ref([]) as Ref<T[]>

   function register(meta: T) {
      const next = theList.value.filter((item) => item.id !== meta.id)
      next.push(meta)
      next.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      theList.value = next

      return () => {
         theList.value = theList.value.filter((item) => item !== meta)
      }
   }

   return { list: theList, register }
}

/**
 * Registers an anchor in its section, from mount to unmount. Outside of ez-page-sections it does nothing:
 * a card with a toc-id still renders anywhere.
 */
export function useSectionAnchor(meta: () => { id?: string, label?: string | null }, el: Readonly<Ref<HTMLElement | null>>) {
   const theContext = inject(pageSectionsKey, null)
   const theSection = inject(pageSectionKey, null)
   let unregister: (() => void) | null = null

   onMounted(() => {
      const { id, label } = meta()
      if (!theContext || !theSection || !el.value || !id) return
      if (!el.value.id) el.value.id = id
      unregister = theContext.registerAnchor({ id, label: label ?? id, sectionId: theSection.id, el: el.value })
   })

   onBeforeUnmount(() => unregister?.())
}

/** What scrolls the page: a given target, else the nearest ancestor that scrolls (the shell), else the window */
export type ScrollTarget = HTMLElement | Window

export function findScroller(element: HTMLElement | null): ScrollTarget {
   for (let parent = element?.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight) return parent
   }
   return window
}

/** The top of the visible area of a scroll target, in viewport coordinates, and how far it has scrolled */
export function viewportOf(target: ScrollTarget) {
   if (target instanceof Window) {
      return { top: 0, scrolled: target.scrollY, isAtBottom: target.innerHeight + target.scrollY >= document.documentElement.scrollHeight - 2 }
   }
   return { top: target.getBoundingClientRect().top, scrolled: target.scrollTop, isAtBottom: target.scrollTop + target.clientHeight >= target.scrollHeight - 2 }
}
