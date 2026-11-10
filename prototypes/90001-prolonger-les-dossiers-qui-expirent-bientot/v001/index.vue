<template>
   <ez-page>
      <ez-page-header
         :title="$gettext('Dossiers')"
         :subtitle="$gettext('%{count} dossiers', { count: theFiltered.length })"
         :button="$gettext('Créer un dossier')"
         :button-icon="ez.icons.add"
         refresh
      />
      <ez-page-content>
         <div class="flex flex-col gap-4">
            <ez-message-important v-if="theConfirmation" type="success">
               {{ theConfirmation }}
            </ez-message-important>

            <ez-message-important
               v-if="theDueSoonFolders.length > 0"
               type="warning"
               :title="$gettext('%{count} dossiers expirent dans les 7 prochains jours', { count: theDueSoonFolders.length })"
            >
               {{ $gettext('Prolongez leur échéance pour laisser le temps aux signataires en attente de signer.') }}
               <template #actions>
                  <ez-btn
                     variant="secondary"
                     size="sm"
                     :icon="ez.icons.filter"
                     :label="theFilters.due === 'due-soon' ? $gettext('Voir tous les dossiers') : $gettext('Afficher ces dossiers')"
                     @click="toggleDueSoonFilter"
                  />
               </template>
            </ez-message-important>

            <div class="list-page__filters || flex flex-wrap items-end gap-3">
               <ez-field
                  v-model="theFilters.search"
                  class="grow"
                  type="search"
                  :icon="ez.icons.search"
                  :placeholder="$gettext('Rechercher un dossier ou un signataire')"
               />
               <ez-field v-model="theFilters.state" type="select" :options="stateOptions" />
               <ez-field v-model="theFilters.due" type="select" :options="dueOptions" />
            </div>

            <ez-card flush>
               <ez-table
                  :columns="columns"
                  :rows="theFiltered"
                  :loading="theData.loading"
                  clickable
               >
                  <template #cell-name="{ row }">
                     <span class="font-semibold">{{ row.name }}</span>
                  </template>
                  <template #cell-state="{ row }">
                     <ez-badge-folder-state :folder="row" />
                  </template>
                  <template #cell-signers="{ row }">
                     {{ row.signedCount() }} / {{ row.signers.length }}
                  </template>
                  <template #cell-dueAt="{ row }">
                     <div class="flex flex-col items-end">
                        <span :class="{ 'text-foreground-warning font-semibold': row.isDueSoon(7) }">
                           {{ formatDate(row.dueAt) }}
                        </span>
                        <span
                           v-if="row.isDueSoon(7)"
                           class="text-xs text-foreground-warning"
                        >
                           {{ formatRelative(row.dueAt) }}
                        </span>
                     </div>
                  </template>
                  <template #cell-actions="{ row }">
                     <EzBtnExtendFolder :folder="row" @extend="openExtendDialog" />
                  </template>
                  <template #empty>
                     <ez-empty-state
                        :title="$gettext('Aucun dossier')"
                        :text="theHasActiveFilters
                           ? $gettext('Aucun dossier ne correspond aux filtres sélectionnés.')
                           : $gettext('Les dossiers que vous créez ou qu’on vous partage apparaîtront ici.')"
                        :icon="ez.icons.folder"
                     >
                        <template #actions>
                           <ez-btn
                              v-if="theHasActiveFilters"
                              variant="secondary"
                              :label="$gettext('Réinitialiser les filtres')"
                              @click="resetFilters"
                           />
                           <ez-btn
                              v-else
                              variant="primary"
                              :icon="ez.icons.add"
                              :label="$gettext('Créer un dossier')"
                           />
                        </template>
                     </ez-empty-state>
                  </template>
               </ez-table>
            </ez-card>
         </div>
      </ez-page-content>

      <ez-dialog
         v-model="theUI.$dialogs.extend"
         :title="$gettext('Prolonger l’échéance')"
         width="min(100%, 28rem)"
      >
         <div v-if="theTargetFolder" class="flex flex-col gap-4">
            <ez-info-list :items="theDialogInfoItems" inline />

            <ez-field
               v-model="theSelectedDays"
               type="select"
               :label="$gettext('Durée de la prolongation')"
               :options="durationOptions"
               :hint="$gettext('Nouvelle échéance: %{date}', { date: formatDate(thePreviewDueAt) })"
            />
         </div>
         <template #actions>
            <ez-btn
               variant="flat"
               :label="$gettext('Annuler')"
               @click="theUI.$dialogs.extend = false"
            />
            <ez-btn
               variant="primary"
               :icon="ez.icons.clock"
               :loading="theUI.$isLoading"
               :label="$gettext('Prolonger')"
               @click="confirmExtend"
            />
         </template>
      </ez-dialog>
   </ez-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { formatDate, formatRelative, gettext, protoToday, useScenario, type EzInfoItem, type EzTableColumn } from '@ez'
import type { EzsignFolder } from '@mocks'
import EzBtnExtendFolder from './components/EzBtnExtendFolder.vue'
import { scenarios } from './mocks'

const DUE_SOON_DAYS = 7

const theData = useScenario(scenarios)
const theFilters = reactive({ search: '', state: 'all', due: 'all' })
const theUI = reactive({ $isLoading: false, $dialogs: { extend: false } })

const theTargetFolder = ref<EzsignFolder | null>(null)
const theSelectedDays = ref<number>(14)
const theConfirmation = ref('')

const stateOptions = [
   { label: gettext('Tous les statuts'), value: 'all' },
   { label: gettext('En signature'), value: 'sent' },
   { label: gettext('Complété'), value: 'completed' },
   { label: gettext('Brouillon'), value: 'draft' },
   { label: gettext('Expiré'), value: 'expired' },
   { label: gettext('Refusé'), value: 'refused' },
]

const dueOptions = [
   { label: gettext('Toutes les échéances'), value: 'all' },
   { label: gettext('Expire sous 7 jours'), value: 'due-soon' },
]

const durationOptions = [
   { label: gettext('7 jours'), value: 7 },
   { label: gettext('14 jours'), value: 14 },
   { label: gettext('30 jours'), value: 30 },
]

const columns: EzTableColumn[] = [
   { key: 'name', label: gettext('Dossier') },
   { key: 'state', label: gettext('Statut'), width: '140px' },
   { key: 'owner', label: gettext('Propriétaire') },
   { key: 'signers', label: gettext('Signatures'), align: 'right', width: '110px' },
   { key: 'dueAt', label: gettext('Échéance'), align: 'right', width: '160px' },
   { key: 'actions', label: '', align: 'right', width: '140px' },
]

const theDueSoonFolders = computed(() =>
   theData.value.folders.filter((folder) => folder.isDueSoon(DUE_SOON_DAYS)),
)

const theHasActiveFilters = computed(
   () => theFilters.due !== 'all' || theFilters.state !== 'all' || Boolean(theFilters.search),
)

const theFiltered = computed(() => {
   const search = String(theFilters.search).toLowerCase()
   return theData.value.folders.filter((folder) => {
      const matchesState = theFilters.state === 'all' || folder.state === theFilters.state
      const matchesDue = theFilters.due === 'all' || folder.isDueSoon(DUE_SOON_DAYS)
      const matchesSearch = !search
         || folder.name.toLowerCase().includes(search)
         || folder.signers.some((signer) => signer.fullName.toLowerCase().includes(search))
      return matchesState && matchesDue && matchesSearch
   })
})

const thePreviewDueAt = computed(() => {
   const folder = theTargetFolder.value
   if (!folder) return null
   const base = folder.dueAt ? new Date(folder.dueAt) : protoToday()
   base.setDate(base.getDate() + Number(theSelectedDays.value))
   return base
})

const theDialogInfoItems = computed<EzInfoItem[]>(() => {
   const folder = theTargetFolder.value
   if (!folder) return []
   return [
      { key: 'name', label: gettext('Dossier'), value: folder.name },
      { key: 'dueAt', label: gettext('Échéance actuelle'), value: formatDate(folder.dueAt) },
      {
         key: 'signers',
         label: gettext('Signatures en attente'),
         value: String(folder.pendingSigners().length),
      },
   ]
})

function toggleDueSoonFilter() {
   theFilters.due = theFilters.due === 'due-soon' ? 'all' : 'due-soon'
}

function resetFilters() {
   theFilters.search = ''
   theFilters.state = 'all'
   theFilters.due = 'all'
}

function openExtendDialog(folder: EzsignFolder) {
   theTargetFolder.value = folder
   theSelectedDays.value = 14
   theUI.$dialogs.extend = true
}

function confirmExtend() {
   const folder = theTargetFolder.value
   if (!folder) return
   const days = Number(theSelectedDays.value)
   theUI.$isLoading = true
   setTimeout(() => {
      const nextDue = folder.extendDueDate(days)
      theConfirmation.value = gettext(
         'Échéance du dossier « %{name} » prolongée de %{days} jours (nouvelle échéance: %{date}).',
         { name: folder.name, days, date: formatDate(nextDue) },
      )
      theUI.$isLoading = false
      theUI.$dialogs.extend = false
   }, 400)
}
</script>
