<template>
   <ez-page>
      <ez-page-header :title="theFolder.name" :breadcrumbs="[$gettext('Accueil'), $gettext('Dossiers eZsign'), $gettext('Informations du dossier')]" refresh>
         <template #meta>
            <ez-badge :tone="theFolder.stateTone()" :label="theFolder.stateLabel()" />
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

            <ez-page-section id="summary" :label="$gettext('Résumé')" icon="info">
               <ez-card :title="$gettext('Informations')" toc-id="summary-info">
                  <ez-info :data="theInfoData" />
               </ez-card>
            </ez-page-section>

            <ez-page-section id="signers" :label="$gettext('Signataires')" icon="users">
               <ez-card
                  :title="$gettext('Ordre de signature')"
                  :subtitle="$gettext('%{done} sur %{total} ont signé', { done: theFolder.signedCount(), total: theFolder.signers.length })"
                  toc-id="signers-list"
                  flush
               >
                  <ez-table :columns="signerColumns" :rows="theFolder.signers">
                     <template #cell-fullName="{ row }">
                        <div class="font-semibold">{{ row.fullName }}</div>
                        <div class="text-xs text-foreground-muted">{{ row.email }}</div>
                     </template>
                     <template #cell-state="{ row }">
                        <ez-badge :tone="row.stateTone()" :label="row.stateLabel()" />
                     </template>
                     <template #cell-lastActivityAt="{ row }">{{ formatDateTime(row.lastActivityAt) }}</template>
                  </ez-table>
               </ez-card>
            </ez-page-section>

            <ez-page-section id="documents" :label="$gettext('Documents')" icon="file">
               <ez-card
                  v-for="theDocument in theFolder.documents"
                  :key="theDocument.id"
                  :title="theDocument.name"
                  :icon="ez.icons.file"
                  :toc-id="`document-${theDocument.id}`"
               >
                  <template #actions>
                     <ez-btn variant="flat" size="sm" :icon="ez.icons.eye" :label="$gettext('Aperçu')" />
                  </template>
                  <ez-badge
                     outline
                     :label="$gettext('%{pages} pages', { pages: theDocument.pageCount })"
                     class="mr-2"
                  />
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
import { formatDate, formatDateTime, gettext, useScenario, type EzTableColumn, type IInfoCategory } from '@ez'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theFolder = computed(() => theData.value.folder)

const signerColumns: EzTableColumn[] = [
   { key: 'fullName', label: 'Signataire' },
   { key: 'state', label: 'Statut', width: '130px' },
   { key: 'lastActivityAt', label: 'Dernière activité', align: 'right' },
]

// The tiles of the card: the same objects as production's theInfoData (ez-info)
const theInfoData = computed<IInfoCategory[]>(() => [
   {
      name: 'summary',
      items: [
         { key: 'name', label: gettext('Nom du dossier'), value: theFolder.value.name, col: 12 },
         { key: 'owner', label: gettext('Propriétaire'), value: theFolder.value.owner },
         { key: 'created', label: gettext('Créé le'), value: formatDate(theFolder.value.createdAt) },
         { key: 'due', label: gettext('Échéance'), value: formatDate(theFolder.value.dueAt) },
         // A count needs room for its label beside the box: half a row until lg
         {
            key: 'documents',
            label: gettext('Documents'),
            value: { amount: theFolder.value.documents.length, unit: theFolder.value.documents.length > 1 ? gettext('fichiers') : gettext('fichier') },
            col: { xs: 12, sm: 6, lg: 3 },
         },
      ],
   },
])
</script>
