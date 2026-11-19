import GalleryPage from './GalleryPage.vue'
import { getTask, loadModule, type MockupChrome, type MockupMeta, type MockupModule } from '@/registry'

/** What a path shows: a version of a task, a pattern or the gallery. Shared by the frame and the shell. */
export interface FrameTarget {
   /** Changes when the target changes, to reload */
   key: string
   load: () => Promise<MockupModule | null>
   chrome: MockupChrome
   label: string
   /** Where this target lives in the shell */
   shellUrl: string
   /** The latest version of the task, when the target is an earlier one */
   newer: { id: string, url: string } | null
}

/**
 * Paths:
 *   p/<task>/<version>
 *   e/<example>
 *   gallery
 * `chrome` overrides the task's own (app or none).
 */
export function resolveTarget(path: string, chrome?: MockupChrome | null): FrameTarget {
   const [kind, id, version] = path.split('/').filter(Boolean)

   if (kind === 'p' && id && version) {
      const task = getTask(id)
      const meta: Partial<MockupMeta> = task?.meta ?? {}
      const latest = task?.versions.at(-1)?.id
      return {
         shellUrl: `${import.meta.env.BASE_URL}p/${id}/${version}`,
         newer: latest && latest !== version ? { id: latest, url: `${import.meta.env.BASE_URL}p/${id}/${latest}` } : null,
         key: `p/${id}/${version}`,
         load: () => loadModule(`mockups/${id}/${version}`),
         chrome: chrome ?? meta.chrome ?? 'app',
         label: `${id} · ${version}`,
      }
   }

   if (kind === 'e' && id) {
      return {
         shellUrl: `${import.meta.env.BASE_URL}e/${id}`,
         newer: null,
         key: `e/${id}`,
         load: () => loadModule(`blueprint/patterns/${id}`),
         chrome: chrome ?? 'app',
         label: `exemple · ${id}`,
      }
   }

   return {
      shellUrl: `${import.meta.env.BASE_URL}gallery`,
      newer: null,
      key: 'gallery',
      load: async () => ({ component: GalleryPage, scenarios: { default: () => ({}) } }),
      chrome: 'none',
      label: 'galerie',
   }
}
