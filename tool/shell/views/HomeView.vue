<template>
   <div class="home">
      <header class="home__top">
         <h1>Prototypes</h1>
         <span class="shell-count">{{ theTasks.length }}</span>
         <copy-button class="home__hint" text="pnpm proto new" outlined />
      </header>

      <div class="home__filters">
         <label class="home__search">
            <ez-icon name="search" :size="14" />
            <input ref="theSearchInput" v-model="theUI.search" type="search" placeholder="Chercher une tâche, un numéro, un responsable" @keydown.esc="clearSearch">
            <span class="shell-kbd">/</span>
         </label>

         <div class="shell-segmented" role="group" aria-label="Statut">
            <button
               v-for="theFilter in filters"
               :key="theFilter.key"
               type="button"
               :class="{ 'is-active': theFilter.key === theUI.status }"
               :aria-pressed="theFilter.key === theUI.status"
               @click="theUI.status = theFilter.key"
            >
               {{ theFilter.label }} <span class="shell-count">{{ theFilter.count }}</span>
            </button>
         </div>
      </div>

      <nav class="home__list" aria-label="Prototypes">
         <router-link v-for="theTask in theVisibleTasks" :key="theTask.id" class="home__row" :to="`/p/${theTask.id}`">
            <span class="home__number shell-mono">{{ theTask.number }}</span>
            <span class="home__title">{{ theTask.title }}</span>
            <span class="shell-status" :class="`shell-status--${theTask.status}`">{{ statusLabel[theTask.status] }}</span>
            <span class="home__versions shell-mono" :title="theTask.chosen ? `Version retenue: ${theTask.chosen}` : `Dernière version: ${theTask.latest}`">
               {{ theTask.chosen ? `★ ${theTask.chosen}` : theTask.latest }}<span class="shell-count"> · {{ theTask.versions }}</span>
            </span>
            <span class="home__owner">{{ theTask.owner }}</span>
            <span class="home__date">{{ theTask.created }}</span>
         </router-link>

         <p v-if="!theVisibleTasks.length" class="home__empty">
            {{ theTasks.length ? 'Aucun prototype ne correspond.' : 'Aucun prototype. Créer le premier: pnpm proto new' }}
         </p>
      </nav>

      <h2 class="shell-heading home__heading">Références</h2>
      <nav class="home__list" aria-label="Références">
         <router-link v-for="thePattern in thePatterns" :key="thePattern.id" class="home__row home__row--reference" :to="`/e/${thePattern.id}`">
            <span class="home__title shell-mono">{{ thePattern.id }}</span>
            <span class="home__summary">{{ thePattern.summary }}</span>
         </router-link>
         <router-link class="home__row home__row--reference" to="/gallery">
            <span class="home__title">Galerie des composants</span>
            <span class="home__summary">Les composants ez- et les tokens, tels qu'ils s'affichent.</span>
         </router-link>
      </nav>
   </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { STATUS_LABEL as statusLabel, listPatterns, listTasks, type ProtoStatus } from '@/registry'
import CopyButton from '../CopyButton.vue'
import { isEditingTarget } from '../sidebar-hotkey'

const theUI = reactive({ search: '', status: 'all' as ProtoStatus | 'all' })
const theSearchInput = ref<HTMLInputElement>()

const dateFormat = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short' })

const theTasks = computed(() => listTasks().map((task) => ({
   id: task.id,
   number: task.meta.goodday ? `#${task.meta.goodday.number}` : 'démo',
   title: task.meta.title,
   status: task.meta.status,
   versions: task.versions.length,
   latest: task.versions.at(-1)?.id ?? '—',
   chosen: task.meta.chosen ?? '',
   owner: task.meta.owner ?? '',
   created: task.meta.created ? dateFormat.format(new Date(`${task.meta.created}T12:00`)) : '',
})))

const filters = computed(() => [
   { key: 'all' as const, label: 'Tous', count: theTasks.value.length },
   ...(Object.keys(statusLabel) as ProtoStatus[])
      .map((status) => ({ key: status, label: statusLabel[status], count: theTasks.value.filter((task) => task.status === status).length }))
      .filter((filter) => filter.count),
])

const theVisibleTasks = computed(() => {
   const search = theUI.search.trim().toLowerCase()
   return theTasks.value.filter((task) =>
      (theUI.status === 'all' || task.status === theUI.status)
      && (!search || `${task.number} ${task.title} ${task.owner} ${task.id}`.toLowerCase().includes(search)),
   )
})

/** The notes of a pattern start with « Référence: »: said once by the heading, not on every row. */
const thePatterns = listPatterns().map((pattern) => ({ id: pattern.id, summary: pattern.notes.summary.replace(/^Référence:\s*/, '') }))

function clearSearch() {
   theUI.search = ''
   theSearchInput.value?.blur()
}

/** / puts the cursor in the search, unless one is already typing somewhere. */
function onKeydown(event: KeyboardEvent) {
   if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || isEditingTarget(event.target)) return
   event.preventDefault()
   theSearchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.home {
   max-width: 960px;
   margin: 0 auto;
   padding: 40px 24px 64px;
}

.home__top {
   display: flex;
   align-items: baseline;
   gap: 8px;
   margin-bottom: 20px;

   h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
   }
}

.home__hint {
   margin-left: auto;
}

.home__filters {
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: 8px;
   margin-bottom: 12px;
}

.home__search {
   display: flex;
   flex: 1 1 260px;
   align-items: center;
   gap: 8px;
   height: 32px;
   padding: 0 8px 0 10px;
   border: 1px solid var(--shell-border);
   border-radius: var(--shell-radius);
   background: var(--shell-surface);
   color: var(--shell-fg-subtle);

   &:hover {
      border-color: var(--shell-border-strong);
   }

   &:focus-within {
      border-color: var(--shell-fg);
   }

   input {
      flex: 1;
      min-width: 0;
      border: none;
      background: transparent;
      color: var(--shell-fg);
      font: inherit;
      outline: none;
   }
}

.home__filters .shell-segmented {
   height: 32px;
}

.home__list {
   overflow: hidden;
   border: 1px solid var(--shell-border);
   border-radius: 8px;
   background: var(--shell-surface);
}

.home__row {
   display: grid;
   grid-template-columns: 64px minmax(0, 1fr) 96px 96px 120px 56px;
   align-items: center;
   gap: 16px;
   min-height: 44px;
   padding: 0 16px;
   text-decoration: none;

   & + & {
      border-top: 1px solid var(--shell-border);
   }

   &:hover {
      background: var(--shell-bg);
   }
}

.home__row--reference {
   grid-template-columns: 200px minmax(0, 1fr);
}

.home__number,
.home__owner,
.home__date,
.home__summary {
   color: var(--shell-fg-muted);
}

.home__title {
   overflow: hidden;
   font-weight: 500;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.home__owner,
.home__summary {
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
}

.home__summary::first-letter {
   text-transform: uppercase;
}

.home__date {
   color: var(--shell-fg-subtle);
   text-align: right;
   white-space: nowrap;
}

.home__empty {
   margin: 0;
   padding: 32px 16px;
   color: var(--shell-fg-muted);
   text-align: center;
}

.home__heading {
   margin: 32px 0 8px;
}

/* Narrow: the title and the status stay, the rest goes */
@media (max-width: 720px) {
   .home__row {
      grid-template-columns: 56px minmax(0, 1fr) auto;
   }

   .home__versions,
   .home__owner,
   .home__date {
      display: none;
   }

   .home__row--reference {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
      padding: 8px 16px;
   }
}
</style>
