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
            <ez-page-section id="summary" :label="$gettext('Résumé')" icon="info" hide-label>
               <ez-card :title="$gettext('Informations')" toc-id="summary-info">
                  <ez-info :data="theInfoData" />
               </ez-card>

               <ez-card :title="$gettext('Échéance et rappels')" toc-id="summary-reminders">
                  <ez-info :data="theReminderData" />
               </ez-card>

               <ez-card :title="$gettext('Options du dossier')" toc-id="summary-options">
                  <ez-info :data="theOptionData" />
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

               <ez-card :title="$gettext('Authentification')" toc-id="signers-auth">
                  <ez-info :data="theAuthData" />
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
                  <ez-info :data="documentDataOf(theDocument)" />
               </ez-card>
            </ez-page-section>

            <ez-page-section id="activity" :label="$gettext('Activité')" icon="clock">
               <ez-card :title="$gettext('Journal')" toc-id="activity-journal" flush>
                  <ez-table :columns="journalColumns" :rows="theData.journal">
                     <template #cell-at="{ row }">{{ formatDateTime(row.at) }}</template>
                  </ez-table>
               </ez-card>

               <ez-card :title="$gettext('Notes internes')" toc-id="activity-notes">
                  <p class="m-0 text-sm text-foreground-muted">
                     {{ $gettext('Le locataire a demandé de reporter la signature de l\'annexe B après la visite du 28. Garder le dossier ouvert jusqu\'à son retour.') }}
                  </p>
               </ez-card>
            </ez-page-section>
         </ez-page-sections>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, formatDateTime, gettext, useScenario, type EzTableColumn, type IInfoCategory } from '@ez'
import type { EzsignDocument } from '@mocks'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theFolder = computed(() => theData.value.folder)

const signerColumns: EzTableColumn[] = [
   { key: 'fullName', label: gettext('Signataire') },
   { key: 'state', label: gettext('Statut'), width: '130px' },
   { key: 'lastActivityAt', label: gettext('Dernière activité'), align: 'right' },
]

const journalColumns: EzTableColumn[] = [
   { key: 'at', label: gettext('Date'), width: '200px' },
   { key: 'who', label: gettext('Par') },
   { key: 'what', label: gettext('Action') },
]

const theInfoData = computed<IInfoCategory[]>(() => [
   {
      name: 'summary',
      items: [
         { key: 'name', label: gettext('Nom du dossier'), value: theFolder.value.name, col: 12 },
         { key: 'owner', label: gettext('Propriétaire'), value: theFolder.value.owner },
         { key: 'created', label: gettext('Créé le'), value: formatDate(theFolder.value.createdAt) },
         { key: 'due', label: gettext('Échéance'), value: formatDate(theFolder.value.dueAt) },
         {
            key: 'documents',
            label: gettext('Documents'),
            value: { amount: theFolder.value.documents.length, unit: theFolder.value.documents.length > 1 ? gettext('fichiers') : gettext('fichier') },
            col: { xs: 12, sm: 6, lg: 3 },
         },
      ],
   },
])

const theReminderData = computed<IInfoCategory[]>(() => [
   {
      name: 'reminders',
      items: [
         { key: 'deadline', label: gettext('Date limite de signature'), value: formatDate(theFolder.value.dueAt) },
         { key: 'first', label: gettext('Premier rappel après'), value: { amount: 2, unit: gettext('jours') } },
         { key: 'every', label: gettext('Puis tous les'), value: { amount: 2, unit: gettext('jours') } },
         { key: 'sent', label: gettext('Rappels envoyés'), value: { amount: 2, unit: gettext('rappels') } },
      ],
   },
])

const theOptionData = computed<IInfoCategory[]>(() => [
   {
      name: 'options',
      items: [
         {
            key: 'options',
            variant: 'list',
            value: [
               { label: gettext('Signature dans l\'ordre'), value: true },
               { label: gettext('Discussions sur les documents'), value: true },
               { label: gettext('Délégation de signature'), value: false },
               { label: gettext('Preuve électronique jointe à l\'envoi'), value: false },
            ],
         },
      ],
   },
])

const theAuthData = computed<IInfoCategory[]>(() => [
   {
      name: 'auth',
      items: theFolder.value.signers.map((theSigner) => ({
         key: `auth-${theSigner.id}`,
         label: theSigner.fullName,
         value: [{ label: gettext('Courriel'), icon: 'mail' as const }],
         col: 12,
      })),
   },
])

function documentDataOf(document: EzsignDocument): IInfoCategory[] {
   return [
      {
         name: `document-${document.id}`,
         items: [
            { key: 'pages', label: gettext('Pages'), value: { amount: document.pageCount, unit: gettext('pages') } },
            { key: 'signatures', label: gettext('Signatures'), value: { amount: `${document.signaturesDone}/${document.signaturesRequired}` } },
            { key: 'state', label: gettext('État'), value: document.isComplete() ? gettext('Complété') : gettext('En attente') },
         ],
      },
   ]
}
</script>
