declare module 'virtual:ez-mockup-target' {
   import type { Component } from 'vue'
   import type { Scenarios } from '@ez'

   const target: {
      component: Component
      scenarios: Scenarios<unknown>
      chrome: 'app' | 'none'
      label: string
   }
   export default target
}
