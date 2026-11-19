<template>
   <frame-root
      :load="theTarget.load"
      :target-key="theTarget.key"
      :scenario="theRoute.scenario"
      :chrome="theTarget.chrome"
      :label="theTarget.label"
      :theme="theRoute.theme"
      :shell-url="theRoute.share ? undefined : theTarget.shellUrl"
      :newer="theRoute.share ? null : theTarget.newer"
      @update:scenario="(name: string) => setParam('scenario', name)"
      @update:theme="(theme: FrameTheme) => setParam('theme', theme === 'dark' ? 'dark' : '')"
   />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watchEffect } from 'vue'
import FrameRoot from './FrameRoot.vue'
import { resolveTarget } from './target'
import { applyTheme, parseTheme, type FrameTheme } from './theme'
import type { MockupChrome } from '@/registry'

/**
 * Hash routes:
 *   #/p/<task>/<version>?scenario=<name>&theme=dark
 *   #/e/<example>?scenario=<name>
 *   #/gallery
 * Query: scenario (mocks.ts key), theme (light by default, or dark), chrome (app or none),
 * share (inside a shared link: no link to the shell nor to the latest version).
 */
function readHash() {
   const [path, query = ''] = window.location.hash.replace(/^#/, '').split('?')
   const params = new URLSearchParams(query)
   return {
      path,
      scenario: params.get('scenario') ?? '',
      chrome: params.get('chrome') as MockupChrome | null,
      theme: parseTheme(params.get('theme')),
      share: params.has('share'),
   }
}

const theRoute = ref(readHash())
const onHashChange = () => (theRoute.value = readHash())
window.addEventListener('hashchange', onHashChange)
watchEffect(() => applyTheme(theRoute.value.theme))
onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange))

const theTarget = computed(() => resolveTarget(theRoute.value.path, theRoute.value.chrome))

/** Changes one query parameter of the hash, keeping the others (empty value = removed). */
function setParam(key: string, value: string) {
   const [path, query = ''] = window.location.hash.replace(/^#/, '').split('?')
   const params = new URLSearchParams(query)
   if (value) params.set(key, value)
   else params.delete(key)
   const next = params.toString()
   window.location.hash = next ? `${path}?${next}` : path
}
</script>
