import { ref, watch } from 'vue'
import { SIDEBAR_MESSAGE, isEditingTarget } from './sidebar-hotkey'

/**
 * The shell's left panel: open, or hidden entirely to give the prototype all the width.
 * One state for the whole shell (the panel's own button, the dev bar's button, the [ shortcut),
 * remembered per viewer.
 */
const theSidebarOpen = ref(readStored())

watch(theSidebarOpen, (open) => {
   try {
      localStorage.setItem('ez-proto:sidebar', open ? 'open' : 'closed')
   }
   catch {
      // storage unavailable: keep in memory only
   }
})

function readStored() {
   try {
      return localStorage.getItem('ez-proto:sidebar') !== 'closed'
   }
   catch {
      return true
   }
}

export function toggleSidebar() {
   theSidebarOpen.value = !theSidebarOpen.value
}

export function useSidebar() {
   return { theSidebarOpen, toggleSidebar }
}

/** [ toggles the panel (unless typing), from the shell or from the prototype frame. Returns the cleanup. */
export function listenSidebarShortcut() {
   const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== '[' || event.ctrlKey || event.metaKey || event.altKey || isEditingTarget(event.target)) return
      event.preventDefault()
      toggleSidebar()
   }
   const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === SIDEBAR_MESSAGE) toggleSidebar()
   }
   window.addEventListener('keydown', onKeydown)
   window.addEventListener('message', onMessage)
   return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('message', onMessage)
   }
}
