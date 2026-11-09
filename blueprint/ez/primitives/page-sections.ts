import type { InjectionKey, Ref } from 'vue'

export interface TocEntry {
   id: string
   title: string
   children: { id: string, title: string }[]
}

export interface PageSectionsContext {
   entries: Ref<TocEntry[]>
   activeId: Ref<string | null>
   register: (entry: TocEntry) => void
   unregister: (id: string) => void
   scrollTo: (id: string) => void
}

export const pageSectionsKey: InjectionKey<PageSectionsContext> = Symbol('ez-page-sections')
