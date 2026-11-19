import { ref, watch } from 'vue'
import { NOTES_MESSAGE, SIDEBAR_MESSAGE, isEditingTarget } from './sidebar-hotkey'

/**
 * The shell's left panel (in a mockup: the way back, the task and its versions): open, or hidden
 * entirely to give the mockup all the width.
 * One state for the whole shell (the panel's own button, the dev bar's button, the [ shortcut),
 * remembered per viewer.
 */
const theSidebarOpen = ref(readStored())

watch(theSidebarOpen, (open) => {
   try {
      localStorage.setItem('ez-mockup:sidebar', open ? 'open' : 'closed')
   }
   catch {
      // storage unavailable: keep in memory only
   }
})

function readStored() {
   try {
      return localStorage.getItem('ez-mockup:sidebar') !== 'closed'
   }
   catch {
      return true
   }
}

/**
 * The notes panel on the right of a mockup: closed by default, so the mockup gets the width.
 * Same rules as the left panel: one state, remembered per viewer, its button in the dev bar, the ] shortcut.
 */
const theNotesOpen = ref(readStoredNotes())

watch(theNotesOpen, (open) => {
   try {
      localStorage.setItem('ez-mockup:notes', open ? 'open' : 'closed')
   }
   catch {
      // storage unavailable: keep in memory only
   }
})

function readStoredNotes() {
   try {
      return localStorage.getItem('ez-mockup:notes') === 'open'
   }
   catch {
      return false
   }
}

export function toggleNotes() {
   theNotesOpen.value = !theNotesOpen.value
}

export function useNotes() {
   return { theNotesOpen, toggleNotes }
}

export function toggleSidebar() {
   theSidebarOpen.value = !theSidebarOpen.value
}

export function useSidebar() {
   return { theSidebarOpen, toggleSidebar }
}

/** [ toggles the left panel and ] the notes (unless typing), from the shell or from the mockup frame. Returns the cleanup. */
export function listenSidebarShortcut() {
   const onKeydown = (event: KeyboardEvent) => {
      if ((event.key !== '[' && event.key !== ']') || event.ctrlKey || event.metaKey || event.altKey || isEditingTarget(event.target)) return
      event.preventDefault()
      if (event.key === '[') toggleSidebar()
      else toggleNotes()
   }
   const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === SIDEBAR_MESSAGE) toggleSidebar()
      if (event.data?.type === NOTES_MESSAGE) toggleNotes()
   }
   window.addEventListener('keydown', onKeydown)
   window.addEventListener('message', onMessage)
   return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('message', onMessage)
   }
}
