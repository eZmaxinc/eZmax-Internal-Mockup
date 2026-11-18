import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { listTasks, type ProtoTask } from '@/registry'

/**
 * Share links: `#/s/<code>` shows one version of one task, and nothing that leads elsewhere (no left
 * panel, no other task, no compare, no export, no link back to the shell). Add `?version=all` to the
 * link to let the teammate go through every version of that task, and only that task.
 *
 * The code is opaque on purpose: the version is not in the address, so changing v003 into v004 leads
 * nowhere. It narrows what a teammate sees; it is not access control: the built site still holds every
 * prototype, for whoever goes looking.
 */

/** In a shared link: no left panel, no way out of what was shared. */
export function useShareMode() {
   const route = useRoute()
   return computed(() => route.path.startsWith('/s/'))
}

export interface ShareTarget {
   task: ProtoTask
   versionId: string
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

/** The task and version a code stands for, or null when no prototype has that code. */
export function resolveShareCode(code: string): ShareTarget | null {
   for (const task of listTasks()) {
      const version = task.versions.find((item) => shareCode(task.id, item.id) === code)
      if (version) return { task, versionId: version.id }
   }
   return null
}

/** The address to send. The shell's own address and folder: works on localhost and on GitHub Pages. */
export function shareUrl(taskId: string, versionId: string): string {
   return `${window.location.origin}${window.location.pathname}#/s/${shareCode(taskId, versionId)}`
}
