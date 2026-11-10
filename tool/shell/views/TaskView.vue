<template>
   <div v-if="!theTask" class="task-view__missing">Prototype introuvable: {{ taskId }}</div>

   <div v-else class="task-view">
      <header class="task-view__header">
         <div class="task-view__titles">
            <h1>{{ theTask.meta.title }}</h1>
            <ez-badge :tone="statusTone[theTask.meta.status]" :label="statusLabel[theTask.meta.status]" />
            <a v-if="theTask.meta.goodday" :href="theTask.meta.goodday.url" target="_blank" rel="noopener">GoodDay #{{ theTask.meta.goodday.number }} ↗</a>
            <ez-badge v-else-if="theTask.meta.demo" tone="neutral" label="Démo" />
         </div>
         <code class="task-view__id">prototypes/{{ theTask.id }}/{{ theVersion?.id }}</code>
      </header>

      <nav class="task-view__timeline" aria-label="Versions">
         <router-link
            v-for="theItem in theTask.versions"
            :key="theItem.id"
            class="task-view__version"
            :class="{ 'is-active': theItem.id === theVersion?.id, 'is-chosen': theItem.id === theTask.meta.chosen }"
            :to="`/p/${theTask.id}/${theItem.id}`"
            :title="theItem.notes.summary"
         >
            <span class="task-view__version-id">{{ theItem.id }}</span>
            <span v-if="theItem.id === theTask.meta.chosen" class="task-view__chosen">retenue</span>
            <span class="task-view__version-summary">{{ theItem.notes.summary || '—' }}</span>
         </router-link>
      </nav>

      <proto-viewer v-if="theVersion" :frames="theFrames" :scenario-names="theScenarioNames">
         <template #devbar-start>
            <label class="task-view__compare">
               <span>Comparer avec</span>
               <select v-model="theCompareWith">
                  <option value="">—</option>
                  <option v-for="theItem in otherVersions" :key="theItem.id" :value="theItem.id">{{ theItem.id }}</option>
               </select>
            </label>
         </template>

         <template #devbar-end>
            <a
               v-if="isDev"
               class="task-view__export"
               :href="`/__proto/export?task=${theTask.id}&version=${theVersion.id}`"
               :download="`${theTask.id}-${theVersion.id}.html`"
               title="Télécharger cette version en un fichier HTML autonome et interactif"
            >Exporter</a>
         </template>

         <template #panel>
            <section class="task-view__notes">
               <h2>Notes · {{ theVersion.id }}</h2>
               <p class="task-view__meta">
                  <span v-if="theVersion.notes.date">{{ theVersion.notes.date }}</span>
                  <span v-if="theVersion.notes.basedOn">· à partir de {{ theVersion.notes.basedOn }}</span>
               </p>
               <div class="markdown" v-html="renderMarkdown(theVersion.notes.body || '_Pas de notes._')" />
            </section>
            <section class="task-view__notes">
               <h2>Brief</h2>
               <div class="markdown" v-html="renderMarkdown(theTask.brief || 'Pas de brief (README.md).')" />
            </section>
         </template>
      </proto-viewer>

      <ez-empty-state v-else title="Aucune version" text="Lancer pnpm proto iterate pour créer une version." icon="file" />
   </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ProtoViewer from '../ProtoViewer.vue'
import { renderMarkdown } from '../markdown'
import { useScenarioNames } from '../scenario-names'
import { getTask, type ProtoStatus } from '@/registry'

const props = defineProps<{
   taskId: string
   versionId?: string
}>()

const isDev = import.meta.env.DEV

const statusLabel: Record<ProtoStatus, string> = { draft: 'Brouillon', review: 'En revue', chosen: 'Retenu', archived: 'Archivé' }
const statusTone = { draft: 'neutral', review: 'info', chosen: 'success', archived: 'neutral' } as const

const theTask = computed(() => getTask(props.taskId))

/** Default: requested version, else the chosen one, else the latest. */
const theVersion = computed(() => {
   const versions = theTask.value?.versions ?? []
   return versions.find((version) => version.id === props.versionId)
      ?? versions.find((version) => version.id === theTask.value?.meta.chosen)
      ?? versions[versions.length - 1]
})

const theScenarioNames = useScenarioNames(() => theVersion.value && `prototypes/${props.taskId}/${theVersion.value.id}`)

const theCompareWith = ref('')
watch(() => props.taskId, () => (theCompareWith.value = ''))

const otherVersions = computed(() => theTask.value?.versions.filter((version) => version.id !== theVersion.value?.id) ?? [])

const theFrames = computed(() => {
   const base = `p/${props.taskId}/${theVersion.value?.id}`
   return theCompareWith.value ? [base, `p/${props.taskId}/${theCompareWith.value}`] : [base]
})
</script>

<style scoped>
.task-view {
   display: flex;
   flex-direction: column;
   height: 100%;
}

.task-view__missing {
   padding: 24px;
}

.task-view__header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 16px;
   padding: 14px 16px 8px;
   background: var(--color-surface);
}

.task-view__titles {
   display: flex;
   align-items: center;
   gap: 10px;
   font-size: var(--text-sm);

   h1 {
      margin: 0;
      font-size: var(--text-lg);
   }
}

.task-view__id {
   color: var(--color-foreground-subtle);
   font-size: var(--text-xs);
}

.task-view__timeline {
   display: flex;
   gap: 6px;
   padding: 0 16px 10px;
   overflow-x: auto;
   background: var(--color-surface);
}

.task-view__version {
   display: grid;
   grid-template-columns: auto auto;
   align-items: center;
   gap: 0 6px;
   flex: 0 0 auto;
   max-width: 220px;
   padding: 6px 10px;
   border: 1px solid var(--color-border);
   border-radius: var(--radius-md);
   color: var(--color-foreground);
   text-decoration: none;

   &:hover {
      border-color: var(--color-border-strong);
   }

   &.is-active {
      border-color: var(--color-accent);
      background: var(--color-accent-subtle);
   }

   &.is-chosen .task-view__version-id::before {
      content: "★ ";
      color: var(--color-positive);
   }
}

.task-view__version-id {
   font-family: var(--font-mono);
   font-size: var(--text-xs);
   font-weight: 700;
}

.task-view__chosen {
   justify-self: end;
   color: var(--color-positive-strong);
   font-size: var(--text-xs);
}

.task-view__version-summary {
   grid-column: 1 / -1;
   overflow: hidden;
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   white-space: nowrap;
   text-overflow: ellipsis;
}

.task-view__compare {
   display: flex;
   align-items: center;
   gap: 6px;
   color: var(--color-foreground-muted);

   select {
      height: 30px;
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      font: inherit;
   }
}

.task-view__export {
   font-weight: 600;
   text-decoration: none;
}

.task-view__notes {
   margin-bottom: 24px;

   h2 {
      margin: 0 0 4px;
      font-size: var(--text-sm);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-foreground-subtle);
   }
}

.task-view__meta {
   margin: 0 0 8px;
   color: var(--color-foreground-subtle);
   font-size: var(--text-xs);
}
</style>
