<template>
   <div v-if="!theTask" class="task-view__missing">Prototype introuvable: {{ taskId }}</div>

   <div v-else class="task-view">
      <!-- The task and its versions are in the shell's left panel; the notes in the panel on the right -->
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
import { currentVersion, getTask } from '@/registry'

const props = defineProps<{
   taskId: string
   versionId?: string
}>()

const isDev = import.meta.env.DEV

const theTask = computed(() => getTask(props.taskId))

const theVersion = computed(() => currentVersion(theTask.value, props.versionId))

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
