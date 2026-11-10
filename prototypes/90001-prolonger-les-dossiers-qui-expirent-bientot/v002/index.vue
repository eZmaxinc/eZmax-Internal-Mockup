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
               :type="theUrgentFolders.length > 0 ? 'danger' : 'warning'"
               :title="$gettext('%{count} dossiers expirent dans les 7 prochains jours (dont %{urgent} urgents à 3 jours ou moins)', { count: theDueSoonFolders.length, urgent: theUrgentFolders.length })"
            >
               {{ $gettext('Prolongez leur échéance d’un coup ou individuellement pour laisser le temps aux signataires en attente de signer.') }}
               <template #actions>
                  <div class="flex flex-wrap items-center gap-2">
                     <ez-btn
                        variant="secondary"
                        size="sm"
                        :icon="ez.icons.filter"
                        :label="theFilters.due === 'due-soon' ? $gettext('Voir tous les dossiers') : $gettext('Filtrer ces dossiers')"
                        @click="toggleDueSoonFilter"
                     />
                     <ez-btn
                        variant="primary"
                        size="sm"
                        :icon="ez.icons.clock"
                        :label="$gettext('Prolonger les %{count} dossiers', { count: theDueSoonFolders.length })"
                        @click="openExtendDialog(theDueSoonFolders)"
                     />
                  </div>
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

            <div class="flex flex-wrap items-center justify-between gap-2">
               <div class="flex flex-wrap items-center gap-2">
                  <ez-badge
                     v-if="theSelectedFolders.length > 0"
                     tone="action"
                     :label="$gettext('%{count} sélectionné(s)', { count: theSelectedFolders.length })"
                  />
                  <ez-btn
                     v-if="theSelectedFolders.length > 0"
                     variant="flat"
                     size="sm"
                     :label="$gettext('Tout désélectionner')"
                     @click="clearSelection"
                  />
                  <ez-btn
                     v-else-if="theFilteredExtendable.length > 0"
                     variant="secondary"
                     size="sm"
                     :label="$gettext('Sélectionner les %{count} prolongeables', { count: theFilteredExtendable.length })"
                     @click="selectAllFilteredExtendable"
                  />
               </div>
               <ez-btn
                  v-if="theSelectedFolders.length > 0"
                  variant="primary"
                  size="sm"
                  :icon="ez.icons.clock"
                  :label="$gettext('Prolonger la sélection (%{count})', { count: theSelectedFolders.length })"
                  @click="openExtendDialog(theSelectedFolders)"
               />
            </div>

            <ez-card flush>
               <ez-table
                  :columns="columns"
                  :rows="theFiltered"
                  :loading="theData.loading"
               >
                  <template #cell-select="{ row }">
                     <ez-btn
                        v-if="canExtend(row)"
                        :variant="isSelected(row.id) ? 'primary' : 'secondary'"
                        size="sm"
                        :icon="isSelected(row.id) ? ez.icons.check : ez.icons.add"
                        :aria-label="isSelected(row.id) ? $gettext('Retirer de la sélection') : $gettext('Sélectionner ce dossier')"
                        @click="toggleSelect(row.id)"
                     />
                  </template>
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
                     <EzBadgeFolderDue :folder="row" />
                  </template>
                  <template #cell-actions="{ row }">
                     <EzBtnExtendFolder :folder="row" @extend="openSingleExtendDialog" />
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
         :title="theDialogTitle"
         width="min(100%, 30rem)"
      >
         <div v-if="theTargetFolders.length > 0" class="flex flex-col gap-4">
            <ez-info-list v-if="theTargetFolders.length === 1" :items="theSingleDialogInfoItems" inline />

            <div v-else class="flex flex-col gap-2">
               <div class="text-xs font-semibold text-foreground-muted">
                  {{ $gettext('Dossiers concernés (%{count})', { count: theTargetFolders.length }) }}
               </div>
               <ul class="m-0 flex list-none flex-col gap-2 p-0 text-sm">
                  <li
                     v-for="theFolder in theTargetFolders"
                     :key="theFolder.id"
                     class="flex items-center justify-between gap-2"
                  >
                     <span class="font-semibold">{{ theFolder.name }}</span>
                     <span class="text-xs text-foreground-muted">
                        {{ formatDate(theFolder.dueAt) }} → {{ formatDate(previewDueFor(theFolder)) }}
                     </span>
                  </li>
               </ul>
            </div>

            <ez-field
               v-model="theSelectedDays"
               type="select"
               :label="$gettext('Durée de la prolongation')"
               :options="durationOptions"
               :hint="theTargetFolders.length === 1
                  ? $gettext('Nouvelle échéance: %{date}', { date: formatDate(previewDueFor(theTargetFolders[0])) })
                  : $gettext('Chaque dossier sélectionné sera prolongé de %{days} jours.', { days: theSelectedDays })"
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
               :label="theTargetFolders.length > 1
                  ? $gettext('Prolonger %{count} dossiers', { count: theTargetFolders.length })
                  : $gettext('Prolonger')"
               @click="confirmExtend"
            />
         </template>
      </ez-dialog>
   </ez-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { formatDate, gettext, protoToday, useScenario, type EzInfoItem, type EzTableColumn } from '@ez'
import type { EzsignFolder } from '@mocks'
import EzBadgeFolderDue from './components/EzBadgeFolderDue.vue'
import EzBtnExtendFolder from './components/EzBtnExtendFolder.vue'
import { scenarios } from './mocks'

const DUE_SOON_DAYS = 7
const URGENT_DAYS = 3

const theData = useScenario(scenarios)
const theFilters = reactive({ search: '', state: 'all', due: 'all' })
const theUI = reactive({ $isLoading: false, $dialogs: { extend: false } })

const theSelectedIds = ref<number[]>([])
const theTargetFolders = ref<EzsignFolder[]>([])
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
   { label: gettext('Urgent (3 jours ou moins)'), value: 'urgent' },
]

const durationOptions = [
   { label: gettext('7 jours'), value: 7 },
   { label: gettext('14 jours'), value: 14 },
   { label: gettext('30 jours'), value: 30 },
]

const columns: EzTableColumn[] = [
   { key: 'select', label: '', width: '52px' },
   { key: 'name', label: gettext('Dossier') },
   { key: 'state', label: gettext('Statut'), width: '140px' },
   { key: 'owner', label: gettext('Propriétaire') },
   { key: 'signers', label: gettext('Signatures'), align: 'right', width: '110px' },
   { key: 'dueAt', label: gettext('Échéance'), align: 'right', width: '180px' },
   { key: 'actions', label: '', align: 'right', width: '140px' },
]

function canExtend(folder: EzsignFolder): boolean {
   return folder.state !== 'completed' && folder.state !== 'refused'
}

const theDueSoonFolders = computed(() =>
   theData.value.folders.filter((folder) => folder.isDueSoon(DUE_SOON_DAYS)),
)

const theUrgentFolders = computed(() =>
   theData.value.folders.filter((folder) => folder.isDueSoon(URGENT_DAYS)),
)

const theHasActiveFilters = computed(
   () => theFilters.due !== 'all' || theFilters.state !== 'all' || Boolean(theFilters.search),
)

const theFiltered = computed(() => {
   const search = String(theFilters.search).toLowerCase()
   return theData.value.folders.filter((folder) => {
      const matchesState = theFilters.state === 'all' || folder.state === theFilters.state
      const matchesDue =
         theFilters.due === 'all'
         || (theFilters.due === 'due-soon' && folder.isDueSoon(DUE_SOON_DAYS))
         || (theFilters.due === 'urgent' && folder.isDueSoon(URGENT_DAYS))
      const matchesSearch = !search
         || folder.name.toLowerCase().includes(search)
         || folder.signers.some((signer) => signer.fullName.toLowerCase().includes(search))
      return matchesState && matchesDue && matchesSearch
   })
})

const theFilteredExtendable = computed(() =>
   theFiltered.value.filter((folder) => canExtend(folder)),
)

const theSelectedFolders = computed(() =>
   theData.value.folders.filter(
      (folder) => theSelectedIds.value.includes(folder.id) && canExtend(folder),
   ),
)

const theDialogTitle = computed(() =>
   theTargetFolders.value.length > 1
      ? gettext('Prolonger %{count} dossiers', { count: theTargetFolders.value.length })
      : gettext('Prolonger l’échéance'),
)

const theSingleDialogInfoItems = computed<EzInfoItem[]>(() => {
   const folder = theTargetFolders.value[0]
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

function isSelected(id: number): boolean {
   return theSelectedIds.value.includes(id)
}

function toggleSelect(id: number) {
   const idx = theSelectedIds.value.indexOf(id)
   if (idx >= 0) {
      theSelectedIds.value.splice(idx, 1)
   } else {
      theSelectedIds.value.push(id)
   }
}

function selectAllFilteredExtendable() {
   theSelectedIds.value = theFilteredExtendable.value.map((folder) => folder.id)
}

function clearSelection() {
   theSelectedIds.value = []
}

function previewDueFor(folder: EzsignFolder): Date {
   const base = folder.dueAt ? new Date(folder.dueAt) : protoToday()
   base.setDate(base.getDate() + Number(theSelectedDays.value))
   return base
}

function toggleDueSoonFilter() {
   theFilters.due = theFilters.due === 'due-soon' ? 'all' : 'due-soon'
}

function resetFilters() {
   theFilters.search = ''
   theFilters.state = 'all'
   theFilters.due = 'all'
}

function openSingleExtendDialog(folder: EzsignFolder) {
   openExtendDialog([folder])
}

function openExtendDialog(folders: EzsignFolder[]) {
   theTargetFolders.value = folders.filter((folder) => canExtend(folder))
   theSelectedDays.value = 14
   theUI.$dialogs.extend = true
}

function confirmExtend() {
   const targets = theTargetFolders.value
   if (!targets.length) return
   const days = Number(theSelectedDays.value)
   theUI.$isLoading = true
   setTimeout(() => {
      for (const folder of targets) {
         folder.extendDueDate(days)
      }
      theConfirmation.value =
         targets.length > 1
            ? gettext(
                 'Échéance prolongée de %{days} jours pour %{count} dossiers.',
                 { days, count: targets.length },
              )
            : gettext(
                 'Échéance du dossier « %{name} » prolongée de %{days} jours (nouvelle échéance: %{date}).',
                 { name: targets[0].name, days, date: formatDate(targets[0].dueAt) },
              )
      theSelectedIds.value = []
      theUI.$isLoading = false
      theUI.$dialogs.extend = false
   }, 400)
}
</script>
