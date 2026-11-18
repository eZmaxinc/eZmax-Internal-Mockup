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
import GalleryPage from './GalleryPage.vue'
import { applyTheme, parseTheme, type FrameTheme } from './theme'
import { getTask, loadModule, type ProtoChrome, type ProtoMeta } from '@/registry'

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
      segments: path.split('/').filter(Boolean),
      scenario: params.get('scenario') ?? '',
      chrome: params.get('chrome') as ProtoChrome | null,
      theme: parseTheme(params.get('theme')),
      share: params.has('share'),
   }
}

const theRoute = ref(readHash())
const onHashChange = () => (theRoute.value = readHash())
window.addEventListener('hashchange', onHashChange)
watchEffect(() => applyTheme(theRoute.value.theme))
onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange))

const theTarget = computed(() => {
   const [kind, id, version] = theRoute.value.segments

   if (kind === 'p' && id && version) {
      const task = getTask(id)
      const meta: Partial<ProtoMeta> = task?.meta ?? {}
      const latest = task?.versions.at(-1)?.id
      return {
         shellUrl: `${import.meta.env.BASE_URL}p/${id}/${version}`,
         newer: latest && latest !== version ? { id: latest, url: `${import.meta.env.BASE_URL}p/${id}/${latest}` } : null,
         key: `p/${id}/${version}`,
         load: () => loadModule(`prototypes/${id}/${version}`),
         chrome: theRoute.value.chrome ?? meta.chrome ?? 'app',
         label: `${id} · ${version}`,
      }
   }

   if (kind === 'e' && id) {
      return {
         shellUrl: `${import.meta.env.BASE_URL}e/${id}`,
         newer: null,
         key: `e/${id}`,
         load: () => loadModule(`blueprint/patterns/${id}`),
         chrome: theRoute.value.chrome ?? 'app',
         label: `exemple · ${id}`,
      }
   }

   return {
      shellUrl: `${import.meta.env.BASE_URL}gallery`,
      newer: null,
      key: 'gallery',
      load: async () => ({ component: GalleryPage, scenarios: { default: () => ({}) } }),
      chrome: 'none' as ProtoChrome,
      label: 'galerie',
   }
})

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
