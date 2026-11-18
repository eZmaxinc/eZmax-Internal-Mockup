import { inject, type DeepReadonly, type InjectionKey, type Ref } from 'vue'

export interface TocEntry {
   id: string
   title: string
   children: { id: string, title: string }[]
}

/** What ez-page-sections shares with its children: its state read-only, and the methods that change it. */
export interface PageSectionsContext {
   entries: DeepReadonly<Ref<TocEntry[]>>
   activeId: DeepReadonly<Ref<string | null>>
   register: (entry: TocEntry) => void
   unregister: (id: string) => void
   scrollTo: (id: string) => void
}

export const pageSectionsKey: InjectionKey<PageSectionsContext> = Symbol('ez-page-sections')

/** For a child of ez-page-sections: its context, or an error when used outside of it. */
export function usePageSections(child: string): PageSectionsContext {
   const context = inject(pageSectionsKey, null)
   if (!context) throw new Error(`${child} doit être utilisé dans ez-page-sections`)
   return context
}
