<template>
   <div v-if="theError" class="frame-root__error">{{ theError }}</div>

   <template v-else-if="theModule">
      <ez-app-shell v-if="chrome === 'app'">
         <component :is="theModule.component" :key="theRenderKey" />
      </ez-app-shell>
      <component :is="theModule.component" v-else :key="theRenderKey" />
   </template>

   <!--
      Standalone (new tab or exported HTML): small floating bar to switch scenarios.
      This page stays on the version it was opened at, so it says when a later one exists and links back to
      the shell: someone left on an old version would otherwise wait for changes that went into the next one.
   -->
   <div v-if="isStandalone && theModule" class="frame-root__bar">
      <span class="frame-root__label">{{ label }}</span>
      <a v-if="newer" class="frame-root__chip frame-root__chip--active" :href="newer.url">Dernière version: {{ newer.id }} →</a>
      <template v-if="theScenarioNames.length > 1">
         <button
            v-for="theName in theScenarioNames"
            :key="theName"
            class="frame-root__chip"
            :class="{ 'frame-root__chip--active': theName === scenario }"
            type="button"
            @click="emit('update:scenario', theName)"
         >
            {{ theName }}
         </button>
      </template>
      <button
         class="frame-root__chip"
         type="button"
         :title="theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'"
         @click="emit('update:theme', theme === 'dark' ? 'light' : 'dark')"
      >
         {{ theme === 'dark' ? 'Clair' : 'Sombre' }}
      </button>
      <a v-if="shellUrl" class="frame-root__chip" :href="shellUrl" title="Voir cette version dans le shell, avec les autres versions et les notes">Shell ↗</a>
   </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, shallowRef, toRef, watch } from 'vue'
import { scenarioKey } from '@ez'
import type { MockupModule } from '@/registry'
import type { FrameTheme } from './theme'

const props = defineProps<{
   load: () => Promise<MockupModule | null>
   /** Changes when the target changes, to reload */
   targetKey: string
   scenario: string
   chrome: 'app' | 'none'
   label: string
   theme: FrameTheme
   /** Rendered by the shell itself, without a frame: the shell's dev bar does the switching */
   embedded?: boolean
   /** Dev only: where this version lives in the shell */
   shellUrl?: string
   /** Dev only: the latest version of the task, when this page shows an earlier one */
   newer?: { id: string, url: string } | null
}>()

const emit = defineEmits<{
   'update:scenario': [name: string]
   'update:theme': [theme: FrameTheme]
   loaded: [scenarioNames: string[]]
}>()

const theModule = shallowRef<MockupModule | null>(null)
const theError = ref('')
const theRenderKey = ref(0)
const isStandalone = !props.embedded && window.parent === window

const theScenarioNames = computed(() => Object.keys(theModule.value?.scenarios ?? {}))

provide(scenarioKey, toRef(props, 'scenario'))

watch(() => props.targetKey, async () => {
   theError.value = ''
   theModule.value = null
   try {
      const module = await props.load()
      if (!module) {
         theError.value = `Introuvable: ${props.targetKey}`
         return
      }
      theModule.value = module
      theRenderKey.value++
      emit('loaded', Object.keys(module.scenarios))
   }
   catch (error) {
      theError.value = error instanceof Error ? error.message : String(error)
   }
}, { immediate: true })
</script>

<style scoped>
.frame-root__error {
   padding: 24px;
   color: var(--color-negative);
   font-family: var(--font-mono);
   white-space: pre-wrap;
}

.frame-root__bar {
   position: fixed;
   right: 12px;
   bottom: 12px;
   z-index: 1000;
   display: flex;
   align-items: center;
   gap: 4px;
   padding: 4px 4px 4px 12px;
   border: 1px solid color-mix(in srgb, var(--color-foreground-inverse) 12%, transparent);
   border-radius: var(--radius-full);
   background: var(--color-surface-inverse);
   color: var(--color-foreground-inverse);
   font-size: var(--text-xs);
   box-shadow: var(--shadow-overlay);
   opacity: 0.85;

   &:hover {
      opacity: 1;
   }
}

.frame-root__label {
   margin-right: 6px;
   font-weight: 600;
}

.frame-root__chip {
   display: inline-flex;
   align-items: center;
   height: 24px;
   text-decoration: none;
   padding: 0 10px;
   border: none;
   border-radius: var(--radius-full);
   background: transparent;
   color: inherit;
   font: inherit;
   cursor: pointer;

   &:hover {
      background: color-mix(in srgb, var(--color-foreground-inverse) 15%, transparent);
   }
}

.frame-root__chip--active {
   background: var(--color-foreground-inverse);
   color: var(--color-surface-inverse);
   font-weight: 600;

   &:hover {
      background: var(--color-foreground-inverse);
   }
}
</style>
