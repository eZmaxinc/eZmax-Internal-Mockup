<template>
   <div v-if="!theTarget || !theVersion" class="share-view__missing">
      <p>Ce lien ne mène à aucune maquette.</p>
   </div>

   <!-- What was shared and nothing else: one version, or with ?version=all the versions of its task -->
   <proto-viewer v-else :frames="[`p/${theTarget.task.id}/${theVersion.id}`]" :scenario-names="theScenarioNames">
      <!-- ?version=all: a menu to go from one version to another. One version: nothing to add -->
      <template v-if="isAllVersions" #devbar-start>
         <label class="shell-field">
            <span>Version</span>
            <select v-model="theVersionId">
               <option v-for="theItem in theVersions" :key="theItem.id" :value="theItem.id">
                  {{ theItem.id }}{{ theItem.id === theTarget.task.meta.chosen ? ' ★' : '' }}
               </option>
            </select>
         </label>
      </template>

      <template #panel>
         <section class="share-view__notes">
            <h2 class="shell-heading">Notes <span class="shell-mono">{{ theVersion.id }}</span></h2>
            <p class="share-view__summary">{{ theVersion.notes.summary || 'Sans résumé.' }}</p>
            <div v-if="theNotesRest" class="markdown" v-html="renderMarkdown(theNotesRest)" />
         </section>
      </template>
   </proto-viewer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProtoViewer from '../ProtoViewer.vue'
import { renderMarkdown } from '../markdown'
import { useScenarioNames } from '../scenario-names'
import { resolveShareCode } from '../share'
import { currentVersion } from '@/registry'

const route = useRoute()

const props = defineProps<{
   code: string
}>()

const theTarget = computed(() => resolveShareCode(props.code))
/** ?version=all: the teammate may go through every version of this task (only this task) */
const isAllVersions = computed(() => route.query.version === 'all')

/** Newest first; it opens on the version the link was made from */
const theVersions = computed(() => [...(theTarget.value?.task.versions ?? [])].reverse())
const theVersionId = ref('')
watch(theTarget, (target) => {
   theVersionId.value = target?.versionId ?? ''
}, { immediate: true })

const theVersion = computed(() => currentVersion(theTarget.value?.task, theVersionId.value))

const theScenarioNames = useScenarioNames(() => (theTarget.value && theVersion.value ? `prototypes/${theTarget.value.task.id}/${theVersion.value.id}` : undefined))

/** The notes without their first line: the summary is shown on its own, above. */
const theNotesRest = computed(() => {
   const notes = theVersion.value?.notes
   if (!notes) return ''
   return notes.summary && notes.body.startsWith(notes.summary) ? notes.body.slice(notes.summary.length).trim() : notes.body
})
</script>

<style scoped>
.share-view__missing {
   padding: 24px;
}

.share-view__notes h2 {
   margin-bottom: 8px;
}

.share-view__summary {
   margin: 0 0 12px;
   color: var(--shell-fg);
   font-weight: 500;
}
</style>
