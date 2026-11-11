<template>
   <ez-page>
      <ez-page-header :title="theData.folder.name" :subtitle="$gettext('Ligne du temps')" cancelable>
         <template #meta>
            <ez-badge-folder-state :folder="theData.folder" />
         </template>
      </ez-page-header>
      <ez-page-content>
         <ez-layout>
            <ez-layout-col :cols="{ base: 12, md: 8 }">
               <ez-card :title="$gettext('Parcours du dossier')">
                  <template v-if="theData.events.length" #actions>
                     <ez-field v-model="theUI.signerId" type="select" :options="signerOptions" />
                  </template>
                  <folder-timeline v-if="theEvents.length" :events="theEvents" />
                  <ez-empty-state
                     v-else-if="theData.events.length"
                     icon="clock"
                     :title="$gettext('Aucune activité pour ce signataire')"
                     :text="$gettext('Il n\'a pas encore ouvert le dossier.')"
                  />
                  <ez-empty-state
                     v-else
                     icon="clock"
                     :title="$gettext('Rien à afficher pour l\'instant')"
                     :text="$gettext('La ligne du temps commence à l\'envoi du dossier.')"
                  />
               </ez-card>
            </ez-layout-col>
            <ez-layout-col :cols="{ base: 12, md: 4 }" first-below-md>
               <ez-card :title="$gettext('Résumé')">
                  <ez-info-list :items="summary" />
                  <template v-if="pendingSigners.length" #footer>
                     <ez-btn variant="primary" icon="mail" :label="$gettext('Envoyer un rappel')" @click="remind" />
                  </template>
               </ez-card>
            </ez-layout-col>
         </ez-layout>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { formatDate, formatRelative, gettext, protoToday, useScenario } from '@ez'
import FolderTimeline from './components/FolderTimeline.vue'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theUI = reactive({ signerId: '' })

const signerOptions = computed(() => [
   { label: gettext('Tous les signataires'), value: '' },
   ...theData.value.folder.signers.map((signer) => ({ label: signer.fullName, value: String(signer.id) })),
])

/** With a signer picked, only what that signer did or received. */
const theEvents = computed(() => theData.value.events.filter((event) => !theUI.signerId || String(event.signer?.id) === theUI.signerId))

const pendingSigners = computed(() => (theData.value.folder.isStateClosed() ? [] : theData.value.folder.pendingSigners()))

/** Simulated: one « reminded » event per signer who still has to sign, now. */
function remind() {
   for (const signer of pendingSigners.value) {
      theData.value.events.push({ id: theData.value.events.length + 1, kind: 'reminded', at: protoToday(), signer })
   }
}

const summary = computed(() => {
   const folder = theData.value.folder
   return [
      { label: gettext('Créé le'), value: formatDate(folder.createdAt) },
      { label: gettext('Échéance'), value: folder.dueAt ? `${formatDate(folder.dueAt)} (${formatRelative(folder.dueAt)})` : '—' },
      { label: gettext('Signatures'), value: gettext('%{done} sur %{total}', { done: folder.signedCount(), total: folder.signers.length }) },
      { label: gettext('Dernière activité'), value: formatRelative(theData.value.events.at(-1)?.at) },
   ]
})
</script>
