<template>
   <div class="proto-viewer">
      <div class="proto-viewer__body">
         <div class="proto-viewer__stage" :class="{ 'proto-viewer__stage--split': frames.length > 1 }">
            <div v-for="theFrame in frames" :key="theFrame" class="proto-viewer__slot">
               <p v-if="frames.length > 1" class="proto-viewer__slot-label">{{ theFrame.split('/').pop() }}</p>
               <iframe
                  class="proto-viewer__frame"
                  :src="frameUrl(theFrame)"
                  :style="{ width: theWidth }"
                  :title="theFrame"
               />
            </div>
         </div>
         <aside v-if="$slots.panel" class="proto-viewer__panel" :class="{ 'is-closed': !theNotesOpen }" :inert="!theNotesOpen">
            <slot name="panel" />
         </aside>
      </div>

      <footer class="proto-viewer__devbar">
         <!-- Hides or shows the shell's left panel; a shared link (?share) has none -->
         <button
            v-if="!isShare"
            type="button"
            class="shell-btn shell-btn--icon"
            :aria-label="theSidebarOpen ? 'Masquer le panneau' : 'Afficher le panneau'"
            :aria-expanded="theSidebarOpen"
            :title="`${theSidebarOpen ? 'Masquer' : 'Afficher'} le panneau ( [ )`"
            @click="toggleSidebar"
         >
            <panel-icon side="left" :open="theSidebarOpen" />
         </button>

         <span v-if="!isShare" class="proto-viewer__divider" />

         <div class="shell-segmented" role="group" aria-label="Largeur">
            <button
               v-for="theViewport in viewports"
               :key="theViewport.key"
               type="button"
               :class="{ 'is-active': theViewport.key === theViewportKey }"
               :aria-pressed="theViewport.key === theViewportKey"
               :title="theViewport.width ? `${theViewport.width} px` : 'Largeur disponible'"
               @click="theViewportKey = theViewport.key"
            >
               {{ theViewport.label }}
            </button>
         </div>

         <div class="shell-segmented" role="group" aria-label="Thème du prototype">
            <button
               v-for="theOption in themes"
               :key="theOption.key"
               type="button"
               :class="{ 'is-active': theOption.key === theTheme }"
               :aria-pressed="theOption.key === theTheme"
               @click="theTheme = theOption.key"
            >
               {{ theOption.label }}
            </button>
         </div>

         <label v-if="scenarioNames.length > 1" class="shell-field">
            <span>Scénario</span>
            <select v-model="theScenario">
               <option v-for="theName in scenarioNames" :key="theName" :value="theName">{{ theName }}</option>
            </select>
         </label>

         <slot name="devbar-start" />

         <!-- Right end of the bar: what leaves the page (export), then the notes toggle -->
         <div class="proto-viewer__devbar-end">
            <slot name="devbar-end" :scenario="theScenario" />

            <!-- Mirror of the left toggle, at the right end -->
            <button
               v-if="$slots.panel"
               type="button"
               class="shell-btn shell-btn--icon"
               :aria-label="theNotesOpen ? 'Masquer les notes' : 'Afficher les notes'"
               :aria-expanded="theNotesOpen"
               :title="`${theNotesOpen ? 'Masquer' : 'Afficher'} les notes ( ] )`"
               @click="toggleNotes"
            >
               <panel-icon side="right" :open="theNotesOpen" />
            </button>
         </div>
      </footer>
   </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PanelIcon from './PanelIcon.vue'
import { useNotes, useSidebar } from './sidebar'
import { useShareMode } from './share'

const { theSidebarOpen, toggleSidebar } = useSidebar()
const isShare = useShareMode()
const { theNotesOpen, toggleNotes } = useNotes()

const props = defineProps<{
   /** Frame hash paths, e.g. ["p/my-task/v002"] — two entries = side-by-side compare */
   frames: string[]
   scenarioNames: string[]
}>()

const viewports = [
   { key: 'fluid', label: 'Auto', width: 0 },
   { key: 'desktop', label: 'Bureau', width: 1440 },
   { key: 'tablet', label: 'Tablette', width: 834 },
   { key: 'mobile', label: 'Mobile', width: 390 },
] as const

const themes = [
   { key: 'light', label: 'Clair' },
   { key: 'dark', label: 'Sombre' },
] as const
type ThemeKey = (typeof themes)[number]['key']

type ViewportKey = (typeof viewports)[number]['key']
const viewportKeys = viewports.map((viewport) => viewport.key)
const themeKeys = themes.map((theme) => theme.key)

/*
 * The address drives the viewer and tells its state:
 *   #/p/<task>/<version>?scenario=empty&theme=dark&width=mobile
 * A link shows exactly one state, and an agent checks every state here, in the shell, where the user is
 * looking too. A parameter left out means the default: first scenario, light, available width.
 */
const route = useRoute()
const router = useRouter()

function queryValue(key: string): string {
   const value = route.query[key]
   return typeof value === 'string' ? value : ''
}

function pick<T extends string>(value: string, allowed: readonly T[]): T | undefined {
   return allowed.includes(value as T) ? (value as T) : undefined
}

// On arrival, what the address does not say comes from the viewer's remembered choices
const theScenario = ref(pick(queryValue('scenario'), props.scenarioNames) ?? props.scenarioNames[0] ?? '')
const theViewportKey = ref<ViewportKey>(pick(queryValue('width'), viewportKeys) ?? readStored('ez-proto:viewport', viewportKeys, 'fluid'))
const theTheme = ref<ThemeKey>(pick(queryValue('theme'), themeKeys) ?? readStored('ez-proto:theme', themeKeys, 'light'))

function writeAddress() {
   if (route.path === '/') return // leaving for the dashboard: nothing to say there
   // Until the names are loaded (mocks.ts comes on demand), keep the scenario the address asks for
   const scenario = props.scenarioNames.length ? theScenario.value : queryValue('scenario')
   router.replace({
      query: {
         ...route.query,
         scenario: scenario && scenario !== props.scenarioNames[0] ? scenario : undefined,
         theme: theTheme.value === 'dark' ? 'dark' : undefined,
         width: theViewportKey.value === 'fluid' ? undefined : theViewportKey.value,
      },
   })
}

onMounted(writeAddress)
watch([theScenario, theTheme, theViewportKey], writeAddress)

watch(() => props.scenarioNames, (names) => {
   theScenario.value = pick(queryValue('scenario'), names) ?? (names.includes(theScenario.value) ? theScenario.value : names[0] ?? '')
   writeAddress()
})

watch(() => ({ path: route.path, query: route.query }), (now, before) => {
   // Another version or reference: the viewer keeps its state, and the new address says it
   if (now.path !== before.path) return writeAddress()
   // Same page, another address (a link, the back button, an agent): follow it
   theScenario.value = pick(queryValue('scenario'), props.scenarioNames) ?? props.scenarioNames[0] ?? ''
   theTheme.value = pick(queryValue('theme'), themeKeys) ?? 'light'
   theViewportKey.value = pick(queryValue('width'), viewportKeys) ?? 'fluid'
})

watch(theViewportKey, (key) => store('ez-proto:viewport', key))
watch(theTheme, (key) => store('ez-proto:theme', key))

/** Per-viewer preferences, remembered across prototypes; storage may be unavailable. */
function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
   try {
      const stored = localStorage.getItem(key) as T | null
      return stored && allowed.includes(stored) ? stored : fallback
   }
   catch {
      return fallback
   }
}

function store(key: string, value: string) {
   try {
      localStorage.setItem(key, value)
   }
   catch {
      // storage unavailable: keep in memory only
   }
}

const theWidth = computed(() => {
   const width = viewports.find((viewport) => viewport.key === theViewportKey.value)?.width ?? 0
   return width ? `${width}px` : '100%'
})

/** Only the hash changes between scenarios and themes: the frame updates without reloading. */
function frameUrl(path: string) {
   const params = new URLSearchParams()
   if (theScenario.value) params.set('scenario', theScenario.value)
   if (theTheme.value === 'dark') params.set('theme', 'dark')
   // A shared link: the frame drops its links to the shell and to the latest version
   if (isShare.value) params.set('share', '1')
   const query = params.toString()
   return `${import.meta.env.BASE_URL}frame.html#/${path}${query ? `?${query}` : ''}`
}
</script>

<style scoped>
/*
 * Fills the space left by the page header (flex: 1 1 0 wins over height in a flex column)
 * and never grows past it: only the stage and the panel scroll, the dev bar stays at the bottom.
 */
.proto-viewer {
   display: flex;
   flex: 1 1 0;
   flex-direction: column;
   height: 100%;
   min-height: 0;
   overflow: hidden;
}

/* Dev bar: viewer controls, always visible at the bottom, full width */
.proto-viewer__devbar {
   flex-shrink: 0;
   z-index: 10;
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   gap: 8px;
   padding: 6px 8px;
   background: var(--shell-surface);
   border-top: 1px solid var(--shell-border);
}

.proto-viewer__divider {
   width: 1px;
   height: 16px;
   background: var(--shell-border);
}

.proto-viewer__devbar-end {
   display: flex;
   align-items: center;
   gap: 4px;
   margin-left: auto;
}

.proto-viewer__body {
   display: flex;
   flex: 1;
   min-height: 0;
   overflow: hidden;
}

.proto-viewer__stage {
   display: flex;
   flex: 1;
   gap: 12px;
   min-width: 0;
   padding: 12px;
   overflow: auto;
   background: var(--shell-bg);
}

.proto-viewer__slot {
   display: flex;
   flex-direction: column;
   flex: 1 0 auto;
   align-items: center;
   min-width: 0;
}

.proto-viewer__stage--split .proto-viewer__slot {
   flex: 1 1 0;
   overflow-x: auto;
}

.proto-viewer__slot-label {
   align-self: flex-start;
   margin: 0 0 6px 2px;
   color: var(--shell-fg-muted);
   font-family: var(--font-mono);
   font-size: 12px;
   font-weight: 600;
}

.proto-viewer__frame {
   flex: 1;
   max-width: none;
   min-height: 480px;
   border: 1px solid var(--shell-border);
   border-radius: 8px;
   background: var(--color-background);
   box-shadow: var(--shell-shadow);
}

.proto-viewer__panel {
   flex: 0 0 320px;
   overflow-y: auto;
   padding: 16px;
   background: var(--shell-surface);
   border-left: 1px solid var(--shell-border);

   /* Slides out of the layout instead of vanishing: the prototype grows as the drawer leaves */
   transition: margin-right 180ms ease, visibility 0s;

   &.is-closed {
      margin-right: -320px;
      visibility: hidden;
      transition: margin-right 180ms ease, visibility 0s 180ms;
   }

   @media (prefers-reduced-motion: reduce) {
      transition: none;
   }
}
</style>
