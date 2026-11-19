<template>
   <div v-if="theTask" class="task-view">
      <!-- The task and its versions are in the shell's left panel; the notes in the panel on the right -->
      <mockup-viewer v-if="theVersion" :frames="theFrames" :scenario-names="theScenarioNames">
         <template #devbar-start>
            <label v-if="otherVersions.length" class="shell-field">
               <span>Comparer</span>
               <select v-model="theCompareWith">
                  <option value="">aucune</option>
                  <option v-for="theItem in otherVersions" :key="theItem.id" :value="theItem.id">{{ theItem.id }}</option>
               </select>
            </label>
         </template>

         <template #devbar-end>
            <!-- A link to send a teammate: this version, nothing else (add ?version=all for its task's versions, share.ts) -->
            <button
               type="button"
               class="shell-btn"
               title="Copier un lien vers cette version seulement. Ajouter ?version=all au lien pour toutes les versions de la tâche."
               @click="onCopyShare"
            >
               {{ isCopied ? 'Lien copié' : 'Partager' }}
            </button>
            <a
               v-if="isDev"
               class="shell-btn shell-btn--icon"
               :href="`/__mockup/export?task=${theTask.id}&version=${theVersion.id}`"
               :download="`${theTask.id}-${theVersion.id}.html`"
               aria-label="Exporter"
               title="Exporter: télécharger cette version en un fichier HTML autonome et interactif"
            >
               <ez-icon name="download" :size="16" />
            </a>
         </template>

         <template #panel>
            <section class="task-view__notes">
               <h2 class="shell-heading">
                  Notes <span class="shell-mono">{{ theVersion.id }}</span>
                  <span class="task-view__meta">{{ theNotesMeta }}</span>
               </h2>
               <p class="task-view__summary">{{ theVersion.notes.summary || 'Sans résumé.' }}</p>
               <div v-if="theNotesRest" class="markdown" v-html="renderMarkdown(theNotesRest)" />
               <p v-else class="task-view__none">Aucun signalement, aucune question ouverte.</p>
            </section>
            <!-- Only when the task has a README.md: the constraints given with the request -->
            <section v-if="theTask.brief" class="task-view__notes">
               <h2 class="shell-heading">Contraintes</h2>
               <div class="markdown" v-html="renderMarkdown(theTask.brief)" />
            </section>
         </template>
      </mockup-viewer>

      <ez-empty-state v-else title="Aucune version" text="Lancer yarn mockup iterate pour créer une version." icon="file" />
   </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import MockupViewer from '../MockupViewer.vue'
import { renderMarkdown } from '../markdown'
import { useScenarioNames } from '../scenario-names'
import { shareUrl } from '../share'
import { currentVersion, getTask } from '@/registry'

const router = useRouter()

const props = defineProps<{
   taskId: string
   versionId?: string
}>()

const isDev = import.meta.env.DEV

const theTask = computed(() => getTask(props.taskId))

const theVersion = computed(() => currentVersion(theTask.value, props.versionId))

watchEffect(() => {
   const hasUnknownVersion = Boolean(props.versionId && theTask.value && !theTask.value.versions.some((item) => item.id === props.versionId))
   if (!theTask.value || hasUnknownVersion) {
      router.replace({ path: '/', query: { notfound: '1' } })
   }
})

const theScenarioNames = useScenarioNames(() => theVersion.value && `mockups/${props.taskId}/${theVersion.value.id}`)

const theCompareWith = ref('')
watch(() => props.taskId, () => (theCompareWith.value = ''))

/** "2026-11-10 · depuis v001": when the version was made and what it started from. */
const theNotesMeta = computed(() => {
   const notes = theVersion.value?.notes
   return [notes?.date, notes?.basedOn && `depuis ${notes.basedOn}`].filter(Boolean).join(' · ')
})

/** The notes without their first line: the summary is shown on its own, above. */
const theNotesRest = computed(() => {
   const notes = theVersion.value?.notes
   if (!notes) return ''
   return notes.summary && notes.body.startsWith(notes.summary) ? notes.body.slice(notes.summary.length).trim() : notes.body
})

const otherVersions = computed(() => theTask.value?.versions.filter((version) => version.id !== theVersion.value?.id) ?? [])

const isCopied = ref(false)

async function onCopyShare() {
   if (!theTask.value || !theVersion.value) return
   const url = shareUrl(theTask.value.id, theVersion.value.id)
   try {
      await navigator.clipboard.writeText(url)
   }
   catch {
      window.prompt('Copier ce lien:', url) // clipboard unavailable: the link stays selectable
   }
   isCopied.value = true
   setTimeout(() => (isCopied.value = false), 1500)
}

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

.task-view__notes {
   & + & {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--shell-border);
   }

   h2 {
      margin-bottom: 8px;
   }
}

.task-view__meta {
   margin-left: auto;
   font-weight: 400;
}

.task-view__summary {
   margin: 0 0 12px;
   color: var(--shell-fg);
   font-weight: 500;
}

.task-view__none {
   margin: 0;
   color: var(--shell-fg-subtle);
}
</style>
