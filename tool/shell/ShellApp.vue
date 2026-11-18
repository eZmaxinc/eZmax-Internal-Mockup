<template>
   <div class="shell">
      <!--
         The left panel follows what is on screen. The dashboard has none: it lists everything itself.
         A prototype: the way back, the task, its versions. A reference or the gallery: the way back and the others.
         Slides away when closed: the prototype gets all the width. Toggled from the dev bar or with [
      -->
      <aside v-if="!isHome && !isShare" class="shell__sidebar" :class="{ 'is-closed': !theSidebarOpen }" :inert="!theSidebarOpen" aria-label="Navigation">
         <router-link :to="linkWithHome('/')" class="shell-btn shell__back">
            <ez-icon name="back" :size="14" />
            <span>Prototypes</span>
         </router-link>

         <template v-if="theTask">
            <header class="shell__task">
               <h1>{{ theTask.meta.title }}</h1>
               <div class="shell__task-meta">
                  <!-- The status is changed here, by the human: a click opens the list. Only while the dev server runs -->
                  <div v-if="canChoose" class="shell__status" @click.stop @keydown.esc="theStatusOpen = false">
                     <button
                        type="button"
                        class="shell-status shell__status-btn"
                        :class="`shell-status--${theTask.meta.status}`"
                        aria-haspopup="menu"
                        :aria-expanded="theStatusOpen"
                        title="Changer le statut"
                        @click="theStatusOpen = !theStatusOpen"
                     >
                        {{ STATUS_LABEL[theTask.meta.status] }}
                        <span class="shell__status-caret" aria-hidden="true">▾</span>
                     </button>
                     <div v-if="theStatusOpen" class="shell__status-menu" role="menu" aria-label="Statut de la tâche">
                        <button
                           v-for="theStatus in STATUSES"
                           :key="theStatus"
                           type="button"
                           class="shell__status-item"
                           role="menuitemradio"
                           :aria-checked="theStatus === theTask.meta.status"
                           :disabled="theChoosing"
                           @click="setStatus(theStatus)"
                        >
                           <span class="shell-status" :class="`shell-status--${theStatus}`">{{ STATUS_LABEL[theStatus] }}</span>
                           <!-- « Retenu » needs a version: the one already retained, else the one on screen -->
                           <span v-if="theStatus === 'chosen'" class="shell__status-hint shell-mono">{{ theChosenTarget }}</span>
                           <span v-if="theStatus === theTask.meta.status" class="shell__status-check" aria-hidden="true">✓</span>
                        </button>
                     </div>
                  </div>
                  <span v-else class="shell-status" :class="`shell-status--${theTask.meta.status}`">{{ STATUS_LABEL[theTask.meta.status] }}</span>
                  <a v-if="theTask.meta.goodday?.url" class="shell__goodday shell-mono" :href="theTask.meta.goodday.url" target="_blank" rel="noopener" title="Ouvrir la tâche dans GoodDay">{{ theTask.meta.goodday.number ? `#${theTask.meta.goodday.number}` : 'GoodDay' }} ↗</a>
                  <span v-else-if="theTask.meta.goodday?.number" class="shell__goodday shell-mono">#{{ theTask.meta.goodday.number }}</span>
                  <span v-else-if="theTask.meta.demo" class="shell__goodday">démo</span>
               </div>
            </header>

            <p class="shell-heading shell__heading">Versions <span class="shell-count">{{ theTask.versions.length }}</span></p>
            <nav class="shell__versions" aria-label="Versions">
               <div v-for="theItem in theVersions" :key="theItem.id" class="shell__version-row">
                  <router-link
                     class="shell__version"
                     :class="{ 'is-active': theItem.id === theVersion?.id, 'has-star': canChoose }"
                     :to="linkWithHome(`/p/${theTask.id}/${theItem.id}`)"
                     :title="theItem.notes.summary"
                  >
                     <span class="shell__version-id shell-mono">{{ theItem.id }}</span>
                     <!-- Without the dev server there is no star to click: the retained version still shows one -->
                     <span v-if="!canChoose && theItem.id === theTask.meta.chosen" class="shell__chosen" title="Version retenue">★</span>
                     <span class="shell__version-summary">{{ theItem.notes.summary || 'Sans résumé' }}</span>
                  </router-link>
                  <!--
                     The team decision is a click on the star, not a request to the agent: it runs
                     `mockup status <task> chosen <version>`; a click on the full star takes the decision back
                     (the task returns to draft). Only while the dev server runs: a built shell has
                     nobody to write meta.json. Next to the link, not inside it: a button in a link is not valid.
                  -->
                  <button
                     v-if="canChoose"
                     type="button"
                     class="shell__star"
                     :class="{ 'is-chosen': theItem.id === theTask.meta.chosen }"
                     :disabled="theChoosing"
                     :aria-pressed="theItem.id === theTask.meta.chosen"
                     :aria-label="`Retenir la ${theItem.id}`"
                     :title="theItem.id === theTask.meta.chosen ? `Ne plus retenir la ${theItem.id}` : `Retenir la ${theItem.id}`"
                     @click="theItem.id === theTask.meta.chosen ? setStatus('draft') : setStatus('chosen', theItem.id)"
                  >
                     {{ theItem.id === theTask.meta.chosen ? '★' : '☆' }}
                  </button>
               </div>
            </nav>
            <p v-if="theChooseError" class="shell__choose-error" role="alert">{{ theChooseError }}</p>

            <!-- The folder to hand to the agent or to open in the editor -->
            <!-- A strip at the bottom of the panel, as tall as the dev bar next to it. One line: the end of the path (the version) stays visible -->
            <footer class="shell__footer">
               <copy-button :text="thePath" truncate />
            </footer>
         </template>

         <template v-else>
            <p class="shell-heading shell__heading">Références</p>
            <nav class="shell__nav" aria-label="Références">
               <router-link v-for="theExample in theExamples" :key="theExample.id" :to="linkWithHome(`/e/${theExample.id}`)" class="shell__item shell-mono">
                  {{ theExample.id }}
               </router-link>
            </nav>

            <p class="shell-heading shell__heading">Système</p>
            <nav class="shell__nav" aria-label="Système">
               <router-link :to="linkWithHome('/gallery')" class="shell__item">Galerie des composants</router-link>
            </nav>
         </template>
      </aside>

      <main class="shell__main">
         <router-view />
      </main>
   </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { STATUS_LABEL, currentVersion, getTask, listPatterns, type ProtoStatus } from '@/registry'
import CopyButton from './CopyButton.vue'
import { listenSidebarShortcut, useSidebar } from './sidebar'
import { useShareMode } from './share'

const route = useRoute()
const theExamples = listPatterns()

function linkWithHome(path: string) {
   return route.query.home === 'true' ? { path, query: { home: 'true' } } : path
}

const isHome = computed(() => route.path === '/')
/** A shared link (?share): one version, no left panel */
const isShare = useShareMode()
const theTask = computed(() => (typeof route.params.taskId === 'string' ? getTask(route.params.taskId) : undefined))
const theVersion = computed(() => currentVersion(theTask.value, typeof route.params.versionId === 'string' ? route.params.versionId : undefined))
/** Newest first. The retained version keeps its place: its star tells it apart. */
const theVersions = computed(() => [...(theTask.value?.versions ?? [])].reverse())
const thePath = computed(() => `prototypes/${theTask.value?.id}/${theVersion.value?.id}`)

/** Changing the status or retaining a version writes meta.json: only the dev server can. */
const canChoose = import.meta.env.DEV
const STATUSES = Object.keys(STATUS_LABEL) as ProtoStatus[]
const theStatusOpen = ref(false)
const theChoosing = ref(false)
const theChooseError = ref('')
/** The version « Retenu » applies to when it is picked in the list: the one already retained, else the one on screen. */
const theChosenTarget = computed(() => theTask.value?.meta.chosen ?? theVersion.value?.id)

/** Runs `mockup status` through the dev server. A click on a star passes its version. */
async function setStatus(status: ProtoStatus, versionId?: string) {
   if (!theTask.value) return
   const version = versionId ?? (status === 'chosen' ? theChosenTarget.value : undefined)
   theStatusOpen.value = false
   theChoosing.value = true
   theChooseError.value = ''
   const query = new URLSearchParams({ task: theTask.value.id, status, ...(version ? { version } : {}) })
   const response = await fetch(`/__proto/status?${query}`, { method: 'POST' })
   // On success the server reloads the shell, with the new status and the full star on the retained version
   if (!response.ok) {
      theChooseError.value = (await response.text()) || 'Impossible de changer le statut.'
      theChoosing.value = false
   }
}

// A click anywhere else closes the list of statuses
const closeStatus = () => (theStatusOpen.value = false)
document.addEventListener('click', closeStatus)
onBeforeUnmount(() => document.removeEventListener('click', closeStatus))

const { theSidebarOpen } = useSidebar()
onBeforeUnmount(listenSidebarShortcut())
</script>

<style scoped>
.shell {
   display: flex;
   height: 100vh;
   overflow: hidden;
}

.shell__sidebar {
   display: flex;
   flex: 0 0 264px;
   flex-direction: column;
   overflow-y: auto;
   padding: 12px;
   background: var(--shell-surface);
   border-right: 1px solid var(--shell-border);

   /* Slides out of the layout instead of vanishing: the prototype grows as the drawer leaves */
   transition: margin-left 180ms ease, visibility 0s;

   &.is-closed {
      margin-left: -264px;
      visibility: hidden;
      transition: margin-left 180ms ease, visibility 0s 180ms;
   }

   @media (prefers-reduced-motion: reduce) {
      transition: none;
   }
}

.shell__back {
   align-self: flex-start;
   margin-left: -2px;
}

.shell__task {
   display: flex;
   flex-direction: column;
   gap: 8px;
   margin: 14px 6px 0;

   h1 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.3;
      letter-spacing: -0.01em;
   }
}

.shell__task-meta {
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: 12px;
}

.shell__goodday {
   color: var(--shell-fg-muted);
   text-decoration: none;

   &:hover {
      color: var(--shell-fg);
   }
}

.shell__heading {
   margin: 24px 6px 8px;
}

.shell__versions {
   display: flex;
   flex-direction: column;
   gap: 6px;
}

.shell__version {
   display: grid;
   grid-template-columns: 1fr auto;
   align-items: baseline;
   gap: 4px 8px;
   padding: 9px 10px;
   border: 1px solid var(--shell-border);
   border-radius: 8px;
   text-decoration: none;

   &:hover {
      border-color: var(--shell-border-strong);
      background: var(--shell-bg);
   }

   &.is-active {
      border-color: var(--shell-fg);
      background: var(--shell-surface);
      box-shadow: var(--shell-shadow);
   }
}

.shell__version-id {
   font-weight: 600;
}

.shell__status {
   position: relative;
}

/* The status badge, as a button */
.shell__status-btn {
   margin: -3px -6px;
   padding: 3px 6px;
   border: 0;
   border-radius: 6px;
   background: none;
   font: inherit;
   cursor: pointer;

   &:hover,
   &[aria-expanded="true"] {
      background: var(--shell-hover);
      color: var(--shell-fg);
   }
}

.shell__status-caret {
   color: var(--shell-fg-subtle);
   font-size: 10px;
}

.shell__status-menu {
   position: absolute;
   top: calc(100% + 6px);
   left: -6px;
   z-index: 10;
   display: flex;
   flex-direction: column;
   min-width: 180px;
   padding: 4px;
   border: 1px solid var(--shell-border);
   border-radius: 8px;
   background: var(--shell-surface);
   box-shadow: var(--shell-shadow);
}

.shell__status-item {
   display: flex;
   align-items: center;
   gap: 8px;
   padding: 6px 8px;
   border: 0;
   border-radius: 6px;
   background: none;
   font: inherit;
   text-align: left;
   cursor: pointer;

   &:hover:not(:disabled) {
      background: var(--shell-hover);
   }
}

.shell__status-hint {
   color: var(--shell-fg-subtle);
   font-size: 11px;
}

.shell__status-check {
   margin-left: auto;
   color: var(--shell-fg-muted);
}

.shell__version-row {
   position: relative;
}

/* Room for the star, at the end of the line of the version's name */
.shell__version.has-star {
   padding-right: 36px;
}

.shell__star {
   position: absolute;
   top: 5px;
   right: 6px;
   width: 24px;
   height: 24px;
   padding: 0;
   border: 0;
   border-radius: 6px;
   background: none;
   color: var(--shell-fg-subtle);
   font-size: 15px;
   line-height: 1;
   cursor: pointer;

   &:hover:not(:disabled) {
      background: var(--shell-hover);
      color: var(--shell-fg);
   }

   &.is-chosen {
      color: var(--shell-status-chosen);
   }
}

.shell__choose-error {
   margin: -8px 0 16px;
   color: var(--shell-fg-muted);
   font-size: 12px;
}

.shell__chosen {
   color: var(--shell-status-chosen);
}

/* Three lines at most: the full sentence is in the tooltip and in the notes */
.shell__version-summary {
   display: -webkit-box;
   grid-column: 1 / -1;
   overflow: hidden;
   color: var(--shell-fg-muted);
   font-size: 12px;
   -webkit-line-clamp: 3;
   -webkit-box-orient: vertical;
}

/*
 * Continues the dev bar: same height (a 28px control, 6px above and below, the border), same line on top.
 * Stays at the bottom when the versions scroll; the negative margins cancel the panel's padding.
 */
.shell__footer {
   position: sticky;
   bottom: -12px;
   display: flex;
   flex-shrink: 0;
   align-items: center;
   height: 41px;
   margin: auto -12px -12px;
   padding: 0 8px;
   background: var(--shell-surface);
   border-top: 1px solid var(--shell-border);
}

.shell__versions {
   margin-bottom: 16px;
}

.shell__nav {
   display: flex;
   flex-direction: column;
   gap: 1px;
}

.shell__item {
   overflow: hidden;
   padding: 5px 6px;
   border-radius: var(--shell-radius);
   color: var(--shell-fg-muted);
   text-decoration: none;
   white-space: nowrap;
   text-overflow: ellipsis;

   &:hover {
      background: var(--shell-hover);
      color: var(--shell-fg);
   }

   &.router-link-exact-active {
      background: var(--shell-active);
      color: var(--shell-fg);
      font-weight: 500;
   }
}

.shell__main {
   flex: 1;
   min-width: 0;
   overflow: auto;
}
</style>
