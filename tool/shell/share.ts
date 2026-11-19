import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getTask, listTasks, type MockupTask } from '@/registry'

/**
 * Share links: `/mockup/<taskId>` (or `/mockup/<taskId>/<versionId>`, and legacy `/s/<code>`)
 * show one version of one task without exposing the shell sidebar, other tasks, compare, or export.
 * Add `?version=all` to let the teammate browse every version of that task.
 */

/** In a shared link: no left panel, no way out of what was shared. */
export function useShareMode() {
   const route = useRoute()
   return computed(() => route.path.startsWith('/mockup/') || route.path.startsWith('/s/'))
}

export interface ShareTarget {
   task: MockupTask
   versionId: string
}

/** Default version for a clean `/mockup/<taskId>` URL: retained version when valid, else latest. */
export function defaultShareVersionId(task: MockupTask): string {
   if (task.meta.chosen && task.versions.some((item) => item.id === task.meta.chosen)) {
      return task.meta.chosen
   }
   return task.versions.at(-1)?.id ?? ''
}

/** Short and stable: FNV-1a of the task and version, in base 36. Same task and version = same code. */
export function shareCode(taskId: string, versionId: string): string {
   let hash = 0x811c9dc5
   for (const char of `ez-mockup:${taskId}:${versionId}`) {
      hash ^= char.charCodeAt(0)
      hash = Math.imul(hash, 0x01000193) >>> 0
   }
   return hash.toString(36).padStart(7, '0')
}

/** The task and version a code stands for, or null when no mockup has that code. */
export function resolveShareCode(code: string): ShareTarget | null {
   for (const task of listTasks()) {
      const version = task.versions.find((item) => shareCode(task.id, item.id) === code)
      if (version) return { task, versionId: version.id }
   }
   return null
}

/** Resolves either a readable `/mockup/<taskId>[/<versionId>]` route or a legacy `/s/<code>`. */
export function resolveShareTarget(params: { taskId?: string; versionId?: string; code?: string }): ShareTarget | null {
   if (params.taskId) {
      const task = getTask(params.taskId)
      if (!task) return null
      const resolvedVersion = params.versionId || defaultShareVersionId(task)
      if (!resolvedVersion || !task.versions.some((item) => item.id === resolvedVersion)) return null
      return { task, versionId: resolvedVersion }
   }
   if (params.code) {
      return resolveShareCode(params.code)
   }
   return null
}

/** Clean share URL without `#`, e.g. `https://host/mockup/<taskId>` (or `/<versionId>` for non-default versions). */
export function shareUrl(taskId: string, versionId: string): string {
   const task = getTask(taskId)
   const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
   const isDefault = task ? versionId === defaultShareVersionId(task) : false
   const path = isDefault ? `mockup/${taskId}` : `mockup/${taskId}/${versionId}`
   return `${window.location.origin}${base}${path}`
}
