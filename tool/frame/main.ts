import { createApp } from 'vue'
import { EzPlugin } from '@ez'
import FrameApp from './FrameApp.vue'
import { SIDEBAR_MESSAGE, isEditingTarget } from '../shell/sidebar-hotkey'
import '@/app.css'

createApp(FrameApp).use(EzPlugin).mount('#app')

// Inside the shell, the frame has the focus once clicked: forward the shell's [ shortcut to it
if (window.parent !== window) {
   window.addEventListener('keydown', (event) => {
      if (event.key !== '[' || event.ctrlKey || event.metaKey || event.altKey || isEditingTarget(event.target)) return
      event.preventDefault()
      window.parent.postMessage({ type: SIDEBAR_MESSAGE }, window.location.origin)
   })
}
