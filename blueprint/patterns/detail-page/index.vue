<template>
   <ez-page>
      <ez-page-header :title="theFolder.name" cancelable refresh>
         <template #meta>
            <ez-badge-folder-state :folder="theFolder" />
         </template>
         <template #actions>
            <ez-btn :icon="ez.icons.download" :label="$gettext('Télécharger')" />
         </template>
      </ez-page-header>

      <ez-page-content>
         <ez-page-sections>
            <ez-message-important v-if="theFolder.isDueSoon()" type="warning" :title="$gettext('Échéance proche')">
               {{ $gettext('Ce dossier expire le %{date}.', { date: formatDate(theFolder.dueAt) }) }}
               <template #actions>
                  <ez-btn size="sm" :label="$gettext('Prolonger')" />
               </template>
            </ez-message-important>

            <ez-page-section id="summary" :title="$gettext('Résumé')">
               <ez-card :title="$gettext('Informations')" toc-id="summary-info">
                  <ez-layout>
                     <ez-layout-col :cols="{ base: 12, md: 6 }">
                        <ez-info-list :items="theInfoLeft" />
                     </ez-layout-col>
                     <ez-layout-col :cols="{ base: 12, md: 6 }">
                        <ez-info-list :items="theInfoRight" />
                     </ez-layout-col>
                  </ez-layout>
               </ez-card>
            </ez-page-section>

            <ez-page-section id="signers" :title="$gettext('Signataires')" :subtitle="$gettext('%{done} sur %{total} ont signé', { done: theFolder.signedCount(), total: theFolder.signers.length })">
               <ez-card :title="$gettext('Ordre de signature')" toc-id="signers-list" flush>
                  <ez-table :columns="signerColumns" :rows="theFolder.signers">
                     <template #cell-fullName="{ row }">
                        <div class="font-semibold">{{ row.fullName }}</div>
                        <div class="text-xs text-foreground-muted">{{ row.email }}</div>
                     </template>
                     <template #cell-state="{ row }">
                        <ez-badge-signer-state :signer="row" />
                     </template>
                     <template #cell-lastActivityAt="{ row }">{{ formatDateTime(row.lastActivityAt) }}</template>
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
               >
                  <template #actions>
                     <ez-btn variant="flat" size="sm" :icon="ez.icons.eye" :label="$gettext('Aperçu')" />
                  </template>
                  <ez-badge
                     :tone="theDocument.isComplete() ? 'success' : 'info'"
                     :label="$gettext('%{done} / %{total} signatures', { done: theDocument.signaturesDone, total: theDocument.signaturesRequired })"
                  />
               </ez-card>
            </ez-page-section>
         </ez-page-sections>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, formatDateTime, gettext, useScenario, type EzTableColumn } from '@ez'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theFolder = computed(() => theData.value.folder)

const signerColumns: EzTableColumn[] = [
   { key: 'fullName', label: 'Signataire' },
   { key: 'state', label: 'Statut', width: '130px' },
   { key: 'lastActivityAt', label: 'Dernière activité', align: 'right' },
]

const theInfoLeft = computed(() => [
   { label: gettext('Propriétaire'), value: theFolder.value.owner },
   { label: gettext('Créé le'), value: formatDate(theFolder.value.createdAt) },
])

const theInfoRight = computed(() => [
   { label: gettext('Échéance'), value: formatDate(theFolder.value.dueAt) },
   { label: gettext('Documents'), value: theFolder.value.documents.length },
])
</script>
