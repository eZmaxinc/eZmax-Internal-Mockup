<template>
   <ez-page>
      <ez-page-header :title="theFolder.name" cancelable refresh>
         <template #meta>
            <ez-badge :tone="theFolder.stateTone()" :label="theFolder.stateLabel()" />
         </template>
      </ez-page-header>

      <ez-page-content>
         <ez-page-sections>
            <ez-message-important v-if="theConfirmation" type="success">{{ theConfirmation }}</ez-message-important>

            <ez-page-section
               id="signers"
               :title="$gettext('Signataires')"
               :subtitle="$gettext('%{done} sur %{total} ont signé', { done: theFolder.signedCount(), total: theFolder.signers.length })"
            >
               <ez-card :title="$gettext('Ordre de signature')" toc-id="signers-list" flush>
                  <template #actions>
                     <ez-btn
                        v-if="thePending.length"
                        variant="primary"
                        size="sm"
                        :icon="ez.icons.send"
                        :label="$gettext('Relancer les %{count} en attente', { count: thePending.length })"
                        @click="openDialog(thePending)"
                     />
                  </template>

                  <ez-table :columns="columns" :rows="theFolder.signers">
                     <template #cell-fullName="{ row }">
                        <div class="font-semibold">{{ row.fullName }}</div>
                        <div class="text-xs text-foreground-muted">{{ row.email }}</div>
                     </template>
                     <template #cell-state="{ row }">
                        <ez-badge :tone="row.stateTone()" :label="row.stateLabel()" />
                     </template>
                     <template #cell-remindersSent="{ row }">{{ row.remindersSent }}</template>
                     <template #cell-actions="{ row }">
                        <ez-btn
                           v-if="row.canBeReminded()"
                           variant="flat"
                           size="sm"
                           :icon="ez.icons.send"
                           :label="$gettext('Relancer')"
                           @click="openDialog([row])"
                        />
                     </template>
                  </ez-table>
               </ez-card>
            </ez-page-section>

            <ez-page-section id="documents" :title="$gettext('Documents')">
               <ez-card
                  v-for="theDocument in theFolder.documents"
                  :key="theDocument.id"
                  :title="theDocument.name"
                  :subtitle="$gettext('%{pages} pages', { pages: theDocument.pageCount })"
                  :icon="ez.icons.file"
                  :toc-id="`document-${theDocument.id}`"
               />
            </ez-page-section>
         </ez-page-sections>
      </ez-page-content>

      <ez-dialog v-model="theUI.$dialogs.remind" :title="theDialogTitle">
         <div class="flex flex-col gap-4">
            <ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm">
               <li v-for="theSigner in theTargets" :key="theSigner.id">
                  <span class="font-semibold">{{ theSigner.fullName }}</span>
                  <span class="text-foreground-muted"> · {{ theSigner.email }}</span>
               </li>
            </ul>
            <ez-field
               v-model="theMessage"
               type="textarea"
               :rows="3"
               :label="$gettext('Message (optionnel)')"
               :hint="$gettext('Ajouté au courriel de rappel.')"
            />
         </div>
         <template #actions>
            <ez-btn variant="flat" :label="$gettext('Annuler')" @click="theUI.$dialogs.remind = false" />
            <ez-btn variant="primary" :icon="ez.icons.send" :loading="theUI.$isLoading" :label="$gettext('Envoyer')" @click="send" />
         </template>
      </ez-dialog>
   </ez-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { gettext, useScenario, type EzTableColumn } from '@ez'
import type { EzsignSigner } from '@mocks'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theFolder = computed(() => theData.value.folder)
const thePending = computed(() => theFolder.value.pendingSigners())

const theUI = reactive({ $isLoading: false, $dialogs: { remind: false } })
const theTargets = ref<EzsignSigner[]>([])
const theMessage = ref('')
const theConfirmation = ref('')

const theDialogTitle = computed(() => (theTargets.value.length > 1
   ? gettext('Relancer %{count} signataires', { count: theTargets.value.length })
   : gettext('Relancer le signataire')))

const columns: EzTableColumn[] = [
   { key: 'fullName', label: 'Signataire' },
   { key: 'state', label: 'Statut', width: '130px' },
   { key: 'remindersSent', label: 'Relances', align: 'right', width: '100px' },
   { key: 'actions', label: '', align: 'right', width: '130px' },
]

function openDialog(signers: EzsignSigner[]) {
   theTargets.value = signers
   theMessage.value = ''
   theUI.$dialogs.remind = true
}

function send() {
   theUI.$isLoading = true
   setTimeout(() => {
      for (const signer of theTargets.value) signer.remindersSent++
      theConfirmation.value = theTargets.value.length > 1
         ? gettext('Rappel envoyé à %{count} signataires.', { count: theTargets.value.length })
         : gettext('Rappel envoyé à %{name}.', { name: theTargets.value[0].fullName })
      theUI.$isLoading = false
      theUI.$dialogs.remind = false
   }, 600)
}
</script>
