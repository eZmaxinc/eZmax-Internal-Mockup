import { createApp, h, ref, watchEffect } from 'vue'
import { EzPlugin } from '@ez'
import FrameRoot from './FrameRoot.vue'
import { applyTheme, type FrameTheme } from './theme'
// Resolved at build time by tool/cli/commands/export.mjs to one prototype version
import target from 'virtual:ez-proto-target'
import '@/app.css'

const theScenario = ref(Object.keys(target.scenarios)[0] ?? '')
const theTheme = ref<FrameTheme>('light')
watchEffect(() => applyTheme(theTheme.value))

createApp({
   render: () => h(FrameRoot, {
      load: async () => ({ component: target.component, scenarios: target.scenarios }),
      targetKey: target.label,
      scenario: theScenario.value,
      chrome: target.chrome,
      label: target.label,
      theme: theTheme.value,
      'onUpdate:scenario': (name: string) => (theScenario.value = name),
      'onUpdate:theme': (theme: FrameTheme) => (theTheme.value = theme),
   }),
}).use(EzPlugin).mount('#app')
