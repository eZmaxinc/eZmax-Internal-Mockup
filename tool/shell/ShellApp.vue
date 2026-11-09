<template>
   <div class="shell">
      <aside class="shell__sidebar">
         <router-link to="/" class="shell__heading shell__heading--link">Prototypes</router-link>
         <router-link
            v-for="theTask in theTasks"
            :key="theTask.id"
            :to="`/p/${theTask.id}`"
            class="shell__item"
            :class="{ 'is-active': $route.params.taskId === theTask.id }"
         >
            <span class="shell__dot" :class="`shell__dot--${theTask.meta.status}`" />
            <span class="shell__item-label">{{ theTask.meta.title }}</span>
            <span class="shell__count">{{ theTask.versions.length }}</span>
         </router-link>
         <p v-if="!theTasks.length" class="shell__empty">pnpm proto new</p>

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
      </aside>

      <main class="shell__main">
         <router-view />
      </main>
   </div>
</template>

<script setup lang="ts">
import { listPatterns, listTasks } from '@/registry'

const theTasks = listTasks()
const theExamples = listPatterns()
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

.shell__heading--link {
   margin-top: 0;
   text-decoration: none;

   &:hover {
      color: var(--color-foreground);
   }
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
      background: var(--color-accent-subtle);
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

.shell__count {
   color: var(--color-foreground-subtle);
   font-size: var(--text-xs);
}

.shell__dot {
   flex-shrink: 0;
   width: 8px;
   height: 8px;
   border-radius: var(--radius-full);
   background: var(--color-border-strong);
}

.shell__dot--review {
   background: var(--color-info);
}

.shell__dot--chosen {
   background: var(--color-positive);
}

.shell__empty {
   margin: 4px 8px;
   color: var(--color-foreground-subtle);
   font-family: var(--font-mono);
   font-size: var(--text-xs);
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
