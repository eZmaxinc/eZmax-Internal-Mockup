<template>
   <ez-page>
      <ez-page-header :title="theFolder.name" cancelable refresh>
         <template #meta>
            <ez-badge :tone="theFolder.stateTone()" :label="theFolder.stateLabel()" />
         </template>
      </ez-page-header>

      <ez-page-content>
         <ez-page-sections>
            <ez-message-important v-if="theLastReminder" type="success">
               {{ $gettext('Rappel envoyé à %{name}.', { name: theLastReminder }) }}
            </ez-message-important>

            <ez-page-section
               id="signers"
               :title="$gettext('Signataires')"
               :subtitle="$gettext('%{done} sur %{total} ont signé', { done: theFolder.signedCount(), total: theFolder.signers.length })"
            >
               <ez-card :title="$gettext('Ordre de signature')" toc-id="signers-list" flush>
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
                           @click="remind(row)"
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
   </ez-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScenario, type EzTableColumn } from '@ez'
import type { EzsignSigner } from '@mocks'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theFolder = computed(() => theData.value.folder)
const theLastReminder = ref('')

const columns: EzTableColumn[] = [
   { key: 'fullName', label: 'Signataire' },
   { key: 'state', label: 'Statut', width: '130px' },
   { key: 'remindersSent', label: 'Relances', align: 'right', width: '100px' },
   { key: 'actions', label: '', align: 'right', width: '130px' },
]

function remind(signer: EzsignSigner) {
   signer.remindersSent++
   theLastReminder.value = signer.fullName
}
</script>
