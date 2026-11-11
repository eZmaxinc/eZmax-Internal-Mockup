<template>
   <div class="shell">
      <!--
         The left panel follows what is on screen. The dashboard has none: it lists everything itself.
         A prototype: the way back, the task, its versions. A reference or the gallery: the way back and the others.
         Slides away when closed: the prototype gets all the width. Toggled from the dev bar or with [
      -->
      <aside v-if="!isHome" class="shell__sidebar" :class="{ 'is-closed': !theSidebarOpen }" :inert="!theSidebarOpen" aria-label="Navigation">
         <router-link to="/" class="shell-btn shell__back">
            <ez-icon name="back" :size="14" />
            <span>Prototypes</span>
         </router-link>

         <template v-if="theTask">
            <header class="shell__task">
               <h1>{{ theTask.meta.title }}</h1>
               <div class="shell__task-meta">
                  <span class="shell-status" :class="`shell-status--${theTask.meta.status}`">{{ STATUS_LABEL[theTask.meta.status] }}</span>
                  <a v-if="theTask.meta.goodday" class="shell__goodday shell-mono" :href="theTask.meta.goodday.url" target="_blank" rel="noopener" title="Ouvrir la tâche dans GoodDay">#{{ theTask.meta.goodday.number }} ↗</a>
                  <span v-else-if="theTask.meta.demo" class="shell__goodday">démo</span>
               </div>
            </header>

            <p class="shell-heading shell__heading">Versions <span class="shell-count">{{ theTask.versions.length }}</span></p>
            <nav class="shell__versions" aria-label="Versions">
               <router-link
                  v-for="theItem in theVersions"
                  :key="theItem.id"
                  class="shell__version"
                  :class="{ 'is-active': theItem.id === theVersion?.id }"
                  :to="`/p/${theTask.id}/${theItem.id}`"
                  :title="theItem.notes.summary"
               >
                  <span class="shell__version-id shell-mono">{{ theItem.id }}</span>
                  <span v-if="theItem.id === theTask.meta.chosen" class="shell__chosen">★ retenue</span>
                  <span v-else-if="theItem.id === theLatestId" class="shell__latest">dernière</span>
                  <span class="shell__version-summary">{{ theItem.notes.summary || 'Sans résumé' }}</span>
               </router-link>
            </nav>

            <!-- The folder to hand to the agent or to open in the editor -->
            <!-- A strip at the bottom of the panel, as tall as the dev bar next to it. One line: the end of the path (the version) stays visible -->
            <footer class="shell__footer">
               <copy-button :text="thePath" truncate />
            </footer>
         </template>

         <template v-else>
            <p class="shell-heading shell__heading">Références</p>
            <nav class="shell__nav" aria-label="Références">
               <router-link v-for="theExample in theExamples" :key="theExample.id" :to="`/e/${theExample.id}`" class="shell__item shell-mono">
                  {{ theExample.id }}
               </router-link>
            </nav>

            <p class="shell-heading shell__heading">Système</p>
            <nav class="shell__nav" aria-label="Système">
               <router-link to="/gallery" class="shell__item">Galerie des composants</router-link>
            </nav>
         </template>
      </aside>

      <main class="shell__main">
         <router-view />
      </main>
   </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { STATUS_LABEL, currentVersion, getTask, listPatterns } from '@/registry'
import CopyButton from './CopyButton.vue'
import { listenSidebarShortcut, useSidebar } from './sidebar'

const route = useRoute()
const theExamples = listPatterns()

const isHome = computed(() => route.path === '/')
const theTask = computed(() => (typeof route.params.taskId === 'string' ? getTask(route.params.taskId) : undefined))
const theVersion = computed(() => currentVersion(theTask.value, typeof route.params.versionId === 'string' ? route.params.versionId : undefined))
/** Newest first; the chosen version is pinned on top, whatever its number. */
const theVersions = computed(() => {
   const versions = [...(theTask.value?.versions ?? [])].reverse()
   const chosen = theTask.value?.meta.chosen
   return [...versions.filter((version) => version.id === chosen), ...versions.filter((version) => version.id !== chosen)]
})
const theLatestId = computed(() => theTask.value?.versions.at(-1)?.id)
const thePath = computed(() => `prototypes/${theTask.value?.id}/${theVersion.value?.id}`)

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

.shell__chosen,
.shell__latest {
   color: var(--shell-fg-subtle);
   font-size: 11px;
}

.shell__chosen {
   color: var(--shell-status-chosen);
   font-weight: 500;
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
