<template>
   <ez-page>
      <ez-page-header
         :title="$gettext('Dossiers')"
         :breadcrumbs="[$gettext('Accueil'), $gettext('Dossiers eZsign')]"
         :button="$gettext('Créer un dossier')"
         :button-icon="ez.icons.add"
         refresh
      />
      <ez-page-content>
         <ez-card :title="$gettext('Liste des dossiers')" :subtitle="$gettext('%{count} dossiers', { count: theFiltered.length })">
            <div class="list-page__filters || flex flex-wrap items-end gap-3 mb-4">
               <ez-field
                  v-model="theFilters.search"
                  class="grow"
                  type="search"
                  :icon="ez.icons.search"
                  :placeholder="$gettext('Rechercher un dossier ou un signataire')"
               />
               <ez-field v-model="theFilters.state" type="select" :options="stateOptions" />
            </div>

            <div class="list-page__table || border border-border-muted">
               <ez-table
                  v-model:selected="theUI.selected"
                  :columns="columns"
                  :rows="theFiltered"
                  :loading="theData.loading"
                  selectable
                  clickable
               >
                  <template #cell-name="{ row }">
                     <span class="font-semibold">{{ row.name }}</span>
                  </template>
                  <template #cell-state="{ row }">
                     <ez-badge :tone="row.stateTone()" :label="row.stateLabel()" solid />
                  </template>
                  <template #cell-signers="{ row }">
                     {{ row.signedCount() }} / {{ row.signers.length }}
                  </template>
                  <template #cell-dueAt="{ row }">
                     <span :class="{ 'text-foreground-warning font-semibold': row.isDueSoon() }">{{ formatDate(row.dueAt) }}</span>
                  </template>
                  <template #empty>
                     <ez-empty-state
                        :title="$gettext('Aucun dossier')"
                        :text="$gettext('Les dossiers que vous créez ou qu’on vous partage apparaîtront ici.')"
                        :icon="ez.icons.folder"
                     >
                        <template #actions>
                           <ez-btn variant="positive" pill :icon="ez.icons.add" :label="$gettext('Créer un dossier')" />
                        </template>
                     </ez-empty-state>
                  </template>
               </ez-table>
            </div>
         </ez-card>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { formatDate, useScenario, type EzTableColumn } from '@ez'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theFilters = reactive({ search: '', state: 'all' })
const theUI = reactive({ selected: [] as (string | number)[] })

const stateOptions = [
   { label: 'Tous les statuts', value: 'all' },
   { label: 'En signature', value: 'sent' },
   { label: 'Complété', value: 'completed' },
   { label: 'Brouillon', value: 'draft' },
   { label: 'Expiré', value: 'expired' },
]

const columns: EzTableColumn[] = [
   { key: 'name', label: 'Dossier' },
   { key: 'state', label: 'Statut', width: '140px' },
   { key: 'owner', label: 'Propriétaire' },
   { key: 'signers', label: 'Signatures', align: 'right', width: '110px' },
   { key: 'dueAt', label: 'Échéance', align: 'right', width: '130px' },
]

const theFiltered = computed(() => {
   const search = String(theFilters.search).toLowerCase()
   return theData.value.folders.filter((folder) => {
      const matchesState = theFilters.state === 'all' || folder.state === theFilters.state
      const matchesSearch = !search
         || folder.name.toLowerCase().includes(search)
         || folder.signers.some((signer) => signer.fullName.toLowerCase().includes(search))
      return matchesState && matchesSearch
   })
})
</script>
