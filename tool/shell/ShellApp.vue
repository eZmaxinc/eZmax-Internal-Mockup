<template>
   <div class="shell">
      <!--
         The left panel follows what is on screen. The dashboard has none: it lists everything itself.
         A prototype: the way back, the task, its versions. A reference or the gallery: the way back and the others.
         Slides away when closed: the prototype gets all the width. Toggled from the dev bar or with [
      -->
      <aside v-if="!isHome" class="shell__sidebar" :class="{ 'is-closed': !theSidebarOpen }" :inert="!theSidebarOpen" aria-label="Navigation">
         <router-link to="/" class="shell__back">
            <ez-icon name="back" :size="16" />
            <span>Prototypes</span>
         </router-link>

         <template v-if="theTask">
            <header class="shell__task">
               <h1>{{ theTask.meta.title }}</h1>
               <div class="shell__task-meta">
                  <ez-badge :tone="STATUS_TONE[theTask.meta.status]" :label="STATUS_LABEL[theTask.meta.status]" />
                  <a v-if="theTask.meta.goodday" :href="theTask.meta.goodday.url" target="_blank" rel="noopener">GoodDay #{{ theTask.meta.goodday.number }} ↗</a>
                  <ez-badge v-else-if="theTask.meta.demo" tone="neutral" label="Démo" />
               </div>
            </header>

            <p class="shell__heading">Versions</p>
            <nav class="shell__versions" aria-label="Versions">
               <router-link
                  v-for="theItem in theTask.versions"
                  :key="theItem.id"
                  class="shell__version"
                  :class="{ 'is-active': theItem.id === theVersion?.id, 'is-chosen': theItem.id === theTask.meta.chosen }"
                  :to="`/p/${theTask.id}/${theItem.id}`"
               >
                  <span class="shell__version-id">{{ theItem.id }}</span>
                  <span v-if="theItem.id === theTask.meta.chosen" class="shell__chosen">retenue</span>
                  <span class="shell__version-summary">{{ theItem.notes.summary || '—' }}</span>
               </router-link>
            </nav>
            <code class="shell__path">prototypes/{{ theTask.id }}/{{ theVersion?.id }}</code>
         </template>

         <div v-else class="shell__nav">
            <p class="shell__heading">Références</p>
            <router-link
               v-for="theExample in theExamples"
               :key="theExample.id"
               :to="`/e/${theExample.id}`"
               class="shell__item"
            >
               <span class="shell__item-label">{{ theExample.id }}</span>
            </router-link>

            <p class="shell__heading">Système</p>
            <router-link to="/gallery" class="shell__item">
               <span class="shell__item-label">Galerie des composants</span>
            </router-link>
         </div>
      </aside>

      <main class="shell__main">
         <router-view />
      </main>
   </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { STATUS_LABEL, STATUS_TONE, currentVersion, getTask, listPatterns } from '@/registry'
import { listenSidebarShortcut, useSidebar } from './sidebar'

const route = useRoute()
const theExamples = listPatterns()

const isHome = computed(() => route.path === '/')
const theTask = computed(() => (typeof route.params.taskId === 'string' ? getTask(route.params.taskId) : undefined))
const theVersion = computed(() => currentVersion(theTask.value, typeof route.params.versionId === 'string' ? route.params.versionId : undefined))

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
   flex: 0 0 248px;
   overflow-y: auto;
   padding: 16px 12px;
   background: var(--color-surface);
   border-right: 1px solid var(--color-border);
   font-size: var(--text-sm);

   /* Slides out of the layout instead of vanishing: the prototype grows as the drawer leaves */
   transition: margin-left 180ms ease, visibility 0s;

   &.is-closed {
      margin-left: -248px;
      visibility: hidden;
      transition: margin-left 180ms ease, visibility 0s 180ms;
   }

   @media (prefers-reduced-motion: reduce) {
      transition: none;
   }
}

.shell__heading {
   display: block;
   margin: 16px 8px 4px;
   color: var(--color-foreground-subtle);
   font-size: var(--text-xs);
   font-weight: 600;
   text-transform: uppercase;
   letter-spacing: 0.04em;
}

.shell__item {
   display: flex;
   align-items: center;
   gap: 8px;
   padding: 6px 8px;
   border-radius: var(--radius-md);
   color: var(--color-foreground);
   text-decoration: none;

   &:hover {
      background: color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface));
   }

   &.is-active,
   &.router-link-exact-active {
      background: var(--color-surface-accent);
      color: var(--color-accent);
      font-weight: 600;
   }
}

.shell__item-label {
   flex: 1;
   min-width: 0;
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.shell__back {
   display: inline-flex;
   align-items: center;
   gap: 6px;
   margin: 0 0 12px;
   padding: 4px 8px;
   border-radius: var(--radius-md);
   color: var(--color-foreground-muted);
   font-weight: 600;
   text-decoration: none;

   &:hover {
      background: color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface));
      color: var(--color-foreground);
   }
}

.shell__task {
   display: flex;
   flex-direction: column;
   gap: 6px;
   margin: 0 8px 4px;

   h1 {
      margin: 0;
      font-size: var(--text-lg);
      line-height: var(--text-lg--line-height);
   }
}

.shell__task-meta {
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: 8px;
}

.shell__versions {
   display: flex;
   flex-direction: column;
   gap: 6px;
   margin: 0 8px;
}

.shell__version {
   display: grid;
   grid-template-columns: auto auto;
   align-items: center;
   gap: 2px 6px;
   padding: 8px 10px;
   border: 1px solid var(--color-border);
   border-radius: var(--radius-md);
   color: var(--color-foreground);
   text-decoration: none;

   &:hover {
      border-color: var(--color-border-strong);
   }

   &.is-active {
      border-color: var(--color-accent);
      background: var(--color-surface-accent);
   }

   &.is-chosen .shell__version-id::before {
      content: "★ ";
      color: var(--color-positive);
   }
}

.shell__version-id {
   font-family: var(--font-mono);
   font-size: var(--text-xs);
   font-weight: 700;
}

.shell__chosen {
   justify-self: end;
   color: var(--color-foreground-positive);
   font-size: var(--text-xs);
}

.shell__version-summary {
   grid-column: 1 / -1;
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
}

.shell__path {
   display: block;
   margin: 12px 8px 0;
   color: var(--color-foreground-subtle);
   font-size: var(--text-xs);
   overflow-wrap: anywhere;
}

.shell__main {
   flex: 1;
   min-width: 0;
   overflow: auto;
}

:global(.markdown) {
   line-height: 1.55;
}

:global(.markdown h3),
:global(.markdown h4),
:global(.markdown h5) {
   margin: 16px 0 4px;
   font-size: var(--text-sm);
}

:global(.markdown p),
:global(.markdown ul),
:global(.markdown ol) {
   margin: 0 0 8px;
}

:global(.markdown ul),
:global(.markdown ol) {
   padding-left: 18px;
}

:global(.markdown code) {
   padding: 1px 4px;
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
   font-size: 0.92em;
}

:global(.markdown ul) {
   list-style: disc;
}

:global(.markdown ol) {
   list-style: decimal;
}

:global(.markdown h3),
:global(.markdown h4),
:global(.markdown h5) {
   font-weight: 600;
}
</style>
