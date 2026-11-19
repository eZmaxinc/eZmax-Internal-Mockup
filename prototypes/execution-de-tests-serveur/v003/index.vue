<template>
   <ez-page>
      <ez-page-header
         :title="$gettext('Exécution de tests serveur')"
         :breadcrumbs="[$gettext('Accueil'), $gettext('Serveur CI'), $gettext('Tests et rapports')]"
         refresh
         @refresh="onRefresh"
      />

      <ez-page-content>
         <div class="test-runner || flex flex-col gap-6">
            <ez-message-important
               v-if="!theData.serverOnline"
               type="danger"
               :title="$gettext('Agents d’exécution indisponibles')"
            >
               {{ theData.serverStatusMessage }}
            </ez-message-important>

            <ez-layout class="test-runner__top-grid">
               <ez-layout-col :cols="{ base: 12, md: 8 }" class="flex flex-col">
                  <form class="h-full flex flex-col" @submit.prevent="onLaunchTest">
                     <ez-card
                        class="test-runner__top-card"
                        :title="$gettext('Démarrer un test')"
                        :subtitle="$gettext('Sélectionnez la branche du serveur et le module à valider')"
                     >
                        <ez-layout>
                           <ez-layout-col>
                              <EzAutocomplete
                                 v-model="theForm.branch"
                                 :options="theBranchOptions"
                                 :label="$gettext('Branche du serveur')"
                                 :placeholder="$gettext('Rechercher une branche…')"
                                 :hint="theSelectedBranchHint"
                                 :error="theErrors.branch"
                                 :empty-text="$gettext('Aucune branche correspondante')"
                                 :icon="ez.icons.search"
                                 :disabled="!theData.serverOnline"
                                 required
                                 mono
                              />
                           </ez-layout-col>

                           <ez-layout-col :cols="{ base: 12, md: 6 }">
                              <ModuleSelector
                                 v-model="theForm.moduleIds"
                                 :modules="theData.modules"
                                 :label="$gettext('Modules à tester')"
                                 :placeholder="$gettext('Sélectionner un ou plusieurs modules')"
                                 :error="theErrors.moduleIds"
                                 :disabled="!theData.serverOnline"
                                 required
                              />
                           </ez-layout-col>

                           <ez-layout-col :cols="{ base: 12, md: 6 }">
                              <ez-field
                                 v-model="theForm.suiteType"
                                 :label="$gettext('Portée des tests')"
                                 type="select"
                                 :options="SUITE_TYPE_OPTIONS"
                                 :disabled="!theData.serverOnline"
                              />
                           </ez-layout-col>
                        </ez-layout>

                        <template #footer>
                           <ez-btn
                              variant="flat"
                              :icon="ez.icons.refresh"
                              :aria-label="$gettext('Réinitialiser')"
                              :disabled="!theData.serverOnline"
                              @click="onResetForm"
                           />
                           <ez-btn
                              variant="primary"
                              pill
                              type="submit"
                              :icon="ez.icons.send"
                              :label="$gettext('Lancer le test')"
                              :disabled="!theData.serverOnline"
                           />
                        </template>
                     </ez-card>
                  </form>
               </ez-layout-col>

               <ez-layout-col :cols="{ base: 12, md: 4 }" first-below-md class="flex flex-col">
                  <ez-card
                     class="test-runner__top-card"
                     :title="$gettext('État du serveur')"
                  >
                     <div class="flex flex-col gap-3">
                        <EzInfoList tiles class="test-runner__server-tiles" :items="theServerSummaryItems">
                           <template #value-availability="{ item }">
                              <span class="inline-flex items-center gap-1.5" :class="theServerStatusTextClass">
                                 <span class="test-runner__server-dot shrink-0" :class="`test-runner__server-dot--${theServerStatusTone}`" aria-hidden="true" />
                                 <span>{{ item.value }}</span>
                              </span>
                           </template>
                           <template #value-running="{ item }">
                              <span :class="theRunningRuns.length > 0 ? 'text-foreground-info' : ''">
                                 {{ item.value }}
                              </span>
                           </template>
                        </EzInfoList>

                        <div v-if="theLatestFinishedRun" class="test-runner__latest-box">
                           <div class="flex items-center justify-between gap-2">
                              <span class="text-xs font-semibold text-foreground-muted">
                                 {{ $gettext('Dernier rapport') }} ·
                                 <span class="font-mono text-foreground">{{ theLatestFinishedRun.code }}</span>
                              </span>
                              <ez-badge
                                 :tone="runStateTone(theLatestFinishedRun.state)"
                                 :label="runStateLabel(theLatestFinishedRun.state)"
                                 solid
                              />
                           </div>
                           <span
                              class="font-mono text-xs font-semibold text-foreground test-runner__truncate"
                              :title="theLatestFinishedRun.branch"
                           >
                              {{ theLatestFinishedRun.branch }}
                           </span>
                           <span class="text-xs text-foreground-muted test-runner__truncate" :title="theLatestFinishedRun.moduleLabel">
                              {{ theLatestFinishedRun.moduleLabel }} · {{ theLatestFinishedRun.requestedBy }}
                           </span>
                        </div>
                        <div v-else class="test-runner__latest-box">
                           <span class="text-xs font-semibold text-foreground-muted">{{ $gettext('Dernier rapport') }}</span>
                           <span class="text-xs text-foreground-subtle">{{ $gettext('Aucune exécution enregistrée pour l’instant.') }}</span>
                        </div>
                     </div>

                     <template #footer>
                        <ez-btn
                           v-if="theLatestFinishedRun"
                           variant="flat"
                           :icon="ez.icons.refresh"
                           :label="$gettext('Relancer')"
                           :disabled="!theData.serverOnline"
                           @click="onRerunFromDialog(theLatestFinishedRun)"
                        />
                        <ez-btn
                           v-if="theLatestFinishedRun"
                           variant="secondary"
                           :icon="ez.icons.eye"
                           :label="$gettext('Voir %{code}', { code: theLatestFinishedRun.code })"
                           @click="onOpenRun(theLatestFinishedRun)"
                        />
                        <span v-else class="text-xs text-foreground-subtle">{{ $gettext('Aucun rapport récent') }}</span>
                     </template>
                  </ez-card>
               </ez-layout-col>
            </ez-layout>

            <ez-message-important
               v-for="theRun in theRunningRuns"
               :key="theRun.id"
               type="info"
               :title="$gettext('Test en cours: %{code} — %{branch}', { code: theRun.code, branch: theRun.branch })"
            >
               <div class="flex flex-col gap-2">
                  <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                     <span>
                        {{ theRun.moduleLabel }} ·
                        {{ $gettext('Demandé par %{name}', { name: theRun.requestedBy }) }}
                     </span>
                     <span class="font-semibold">{{ theRun.progressPercent }} %</span>
                  </div>
                  <div class="test-runner__progress-track">
                     <div class="test-runner__progress-fill" :style="{ width: `${theRun.progressPercent}%` }" />
                  </div>
                  <span class="text-xs text-foreground-muted">{{ theRun.currentStep }}</span>
               </div>
               <template #actions>
                  <ez-btn
                     variant="secondary"
                     size="sm"
                     :icon="ez.icons.eye"
                     :label="$gettext('Suivre en direct')"
                     @click="onOpenRun(theRun)"
                  />
                  <ez-btn
                     variant="danger"
                     size="sm"
                     :icon="ez.icons.close"
                     :label="$gettext('Annuler')"
                     @click="onCancelRun(theRun.id)"
                  />
               </template>
            </ez-message-important>

            <ez-card
               :title="$gettext('Historique des exécutions')"
               :subtitle="$gettext('%{count} exécution(s) affichée(s) — cliquez sur une ligne pour ouvrir le rapport', { count: theFilteredRuns.length })"
            >
               <div class="flex flex-wrap items-end gap-3 mb-4">
                  <ez-field
                     v-model="theFilters.search"
                     class="grow min-w-56"
                     type="search"
                     :icon="ez.icons.search"
                     :placeholder="$gettext('Rechercher par branche, module, demandeur ou #RUN…')"
                  />
                  <ez-field v-model="theFilters.state" type="select" :options="theStateFilterOptions" />
                  <ez-field v-model="theFilters.moduleId" type="select" :options="theModuleFilterOptions" />
                  <ez-field v-model="theFilters.requester" type="select" :options="theRequesterFilterOptions" />
               </div>

               <div class="border border-border-muted">
                  <ez-table
                     :columns="columns"
                     :rows="theFilteredRuns"
                     :loading="theUI.isRefreshing"
                     clickable
                     @row-click="onOpenRun"
                  >
                     <template #cell-code="{ row }">
                        <span class="font-mono text-sm font-semibold text-foreground">{{ row.code }}</span>
                     </template>

                     <template #cell-branch="{ row }">
                        <div class="flex flex-col">
                           <span class="font-mono text-sm font-semibold">{{ row.branch }}</span>
                           <span class="font-mono text-xs text-foreground-subtle">{{ row.commitSha }}</span>
                        </div>
                     </template>

                     <template #cell-moduleLabel="{ row }">
                        <div class="flex flex-col">
                           <span>{{ row.moduleLabel }}</span>
                           <span class="text-xs text-foreground-subtle">{{ suiteTypeLabel(row.suiteType) }}</span>
                        </div>
                     </template>

                     <template #cell-startedAt="{ row }">
                        {{ formatDateTime(row.startedAt) }}
                     </template>

                     <template #cell-durationSeconds="{ row }">
                        <span v-if="row.state === 'running'" class="text-foreground-info font-semibold">
                           {{ formatDuration(row.durationSeconds) }}…
                        </span>
                        <span v-else>{{ formatDuration(row.durationSeconds) }}</span>
                     </template>

                     <template #cell-results="{ row }">
                        <div v-if="row.state === 'running'" class="flex items-center justify-end gap-2">
                           <div class="test-runner__mini-track">
                              <div class="test-runner__mini-fill" :style="{ width: `${row.progressPercent}%` }" />
                           </div>
                           <span class="text-xs font-semibold text-foreground-info">{{ row.progressPercent }} %</span>
                        </div>
                        <div v-else class="test-runner__results-grid text-xs">
                           <span class="text-foreground-positive font-semibold">
                              {{ $gettext('%{count} OK', { count: row.passedTests }) }}
                           </span>
                           <span v-if="row.failedTests > 0" class="text-foreground-negative font-semibold">
                              {{ row.failedTests > 1 ? $gettext('%{count} échecs', { count: row.failedTests }) : $gettext('%{count} échec', { count: row.failedTests }) }}
                           </span>
                           <span v-else-if="row.skippedTests > 0" class="text-foreground-warning">
                              {{ row.skippedTests > 1 ? $gettext('%{count} ignorés', { count: row.skippedTests }) : $gettext('%{count} ignoré', { count: row.skippedTests }) }}
                           </span>
                           <span v-else aria-hidden="true" />
                        </div>
                     </template>

                     <template #cell-state="{ row }">
                        <ez-badge
                           class="test-runner__state-badge"
                           :tone="runStateTone(row.state)"
                           :label="runStateLabel(row.state)"
                           solid
                        />
                     </template>

                     <template #cell-actions="{ row }">
                        <div class="flex items-center justify-end gap-1">
                           <ez-btn
                              variant="flat"
                              size="sm"
                              :icon="ez.icons.eye"
                              :aria-label="$gettext('Consulter le résumé du test')"
                              @click.stop="onOpenRun(row)"
                           />
                           <ez-btn
                              variant="flat"
                              size="sm"
                              :icon="ez.icons.download"
                              :aria-label="$gettext('Télécharger le log complet')"
                              :disabled="row.state === 'running'"
                              @click.stop="onQuickDownloadLog(row)"
                           />
                        </div>
                     </template>

                     <template #empty>
                        <ez-empty-state
                           :title="hasActiveFilters ? $gettext('Aucun test ne correspond aux filtres') : $gettext('Aucun test exécuté')"
                           :text="hasActiveFilters
                              ? $gettext('Modifiez ou réinitialisez vos critères de recherche pour voir l’historique.')
                              : $gettext('Choisissez une branche et un module ci-dessus pour lancer votre première exécution.')"
                           :icon="ez.icons.file"
                        >
                           <template #actions>
                              <ez-btn
                                 v-if="hasActiveFilters"
                                 variant="secondary"
                                 :label="$gettext('Réinitialiser les filtres')"
                                 @click="onResetFilters"
                              />
                           </template>
                        </ez-empty-state>
                     </template>
                  </ez-table>
               </div>
            </ez-card>
         </div>

         <TestReportDialog
            v-model="theUI.isDialogOpen"
            :run="theSelectedRun"
            :server-online="theData.serverOnline"
            @cancel="onCancelRun"
            @rerun="onRerunFromDialog"
         />
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { formatDateTime, gettext, useAppShell, useScenario, type EzTableColumn } from '@ez'
import EzAutocomplete from './components/EzAutocomplete.vue'
import type { EzAutocompleteOption } from './components/EzAutocomplete.vue'
import EzInfoList from './components/EzInfoList.vue'
import TestReportDialog from './components/TestReportDialog.vue'
import ModuleSelector from './components/ModuleSelector.vue'
import {
   buildLogLines,
   formatDuration,
   formatModuleSelectionLabel,
   runStateLabel,
   runStateTone,
   scenarios,
   SUITE_TYPE_OPTIONS,
   suiteTypeLabel,
   type TestRun,
   type TestSuiteType,
} from './mocks'

const theData = useScenario(scenarios)
useAppShell({ withSkeleton: true })

const theForm = reactive({
   branch: 'feat/ezsign-relance-signataires',
   moduleIds: ['ezsign-folders', 'ezsign-signers'] as string[],
   suiteType: 'all' as TestSuiteType,
})

const theErrors = reactive({
   branch: '',
   moduleIds: '',
})

const theFilters = reactive({
   search: '',
   state: 'all',
   moduleId: 'all',
   requester: 'all',
})

const theUI = reactive({
   isRefreshing: false,
   isDialogOpen: false,
   selectedRunId: null as number | null,
})

let theTickerId: ReturnType<typeof setInterval> | null = null

const columns: EzTableColumn[] = [
   { key: 'code', label: gettext('ID'), width: '105px' },
   { key: 'branch', label: gettext('Branche') },
   { key: 'moduleLabel', label: gettext('Module') },
   { key: 'requestedBy', label: gettext('Demandé par'), width: '155px' },
   { key: 'startedAt', label: gettext('Date et heure'), align: 'right', width: '165px' },
   { key: 'durationSeconds', label: gettext('Durée'), align: 'right', width: '105px' },
   { key: 'results', label: gettext('Résultats'), align: 'right', width: '185px' },
   { key: 'state', label: gettext('Statut'), width: '115px' },
   { key: 'actions', label: '', align: 'right', width: '88px' },
]

const theBranchOptions = computed<EzAutocompleteOption[]>(() =>
   theData.value.branches.map((branch) => ({
      label: branch.name,
      value: branch.name,
      meta: `${branch.lastCommitSha} · ${branch.lastAuthor} · ${branch.updatedLabel}`,
   })),
)

const theSelectedBranchHint = computed(() => {
   const found = theData.value.branches.find((branch) => branch.name === theForm.branch)
   if (!found) return gettext('Tapez pour filtrer les branches disponibles sur le serveur')
   return gettext('Dernier commit %{sha} par %{author} (%{when})', {
      sha: found.lastCommitSha,
      author: found.lastAuthor,
      when: found.updatedLabel,
   })
})

const theModuleOptions = computed(() =>
   theData.value.modules.map((mod) => ({
      label: mod.label,
      value: mod.id,
   })),
)

const theStateFilterOptions = [
   { label: gettext('Tous les statuts'), value: 'all' },
   { label: gettext('En cours'), value: 'running' },
   { label: gettext('Réussi'), value: 'passed' },
   { label: gettext('Échoué'), value: 'failed' },
   { label: gettext('Instable'), value: 'warning' },
   { label: gettext('Annulé'), value: 'cancelled' },
]

const theModuleFilterOptions = computed(() => [
   { label: gettext('Tous les modules'), value: 'all' },
   ...theData.value.modules
      .filter((mod) => mod.id !== 'all')
      .map((mod) => ({ label: mod.shortLabel, value: mod.id })),
])

const theRequesterFilterOptions = computed(() => {
   const names = Array.from(new Set(theData.value.runs.map((run) => run.requestedBy)))
   return [
      { label: gettext('Tous les demandeurs'), value: 'all' },
      ...names.map((name) => ({ label: name, value: name })),
   ]
})

const theRunningRuns = computed(() =>
   theData.value.runs.filter((run) => run.state === 'running'),
)

const theLatestFinishedRun = computed(() =>
   theData.value.runs.find((run) => run.state !== 'running') ?? null,
)

const theServerStatusTone = computed(() => {
   if (!theData.value.serverOnline) return 'danger'
   if (theRunningRuns.value.length > 0) return 'info'
   return 'success'
})

const theServerStatusTextClass = computed(() => {
   if (!theData.value.serverOnline) return 'text-foreground-negative'
   if (theRunningRuns.value.length > 0) return 'text-foreground-info'
   return 'text-foreground-positive'
})

const theServerSummaryItems = computed(() => {
   const finished = theData.value.runs.filter((run) => run.state !== 'running')
   const passedCount = finished.filter((run) => run.state === 'passed').length
   const passRate = finished.length ? `${Math.round((passedCount / finished.length) * 100)} %` : '—'
   const avgSeconds = finished.length
      ? Math.round(finished.reduce((sum, run) => sum + run.durationSeconds, 0) / finished.length)
      : 0

   return [
      {
         key: 'availability',
         label: gettext('Disponibilité'),
         value: !theData.value.serverOnline
            ? gettext('Hors ligne')
            : theRunningRuns.value.length > 0
              ? gettext('En cours')
              : gettext('Prêt'),
      },
      {
         key: 'running',
         label: gettext('Tests en cours'),
         value: theRunningRuns.value.length > 0
            ? gettext('%{count} actif', { count: theRunningRuns.value.length })
            : '0',
      },
      {
         key: 'passRate',
         label: gettext('Réussite'),
         value: finished.length ? `${passRate} (${passedCount}/${finished.length})` : '—',
      },
      {
         key: 'avgDuration',
         label: gettext('Durée moyenne'),
         value: finished.length ? formatDuration(avgSeconds) : '—',
      },
   ]
})

const hasActiveFilters = computed(() =>
   Boolean(theFilters.search)
   || theFilters.state !== 'all'
   || theFilters.moduleId !== 'all'
   || theFilters.requester !== 'all',
)

const theFilteredRuns = computed(() => {
   const query = String(theFilters.search).trim().toLowerCase()
   return theData.value.runs.filter((run) => {
      const matchesState = theFilters.state === 'all' || run.state === theFilters.state
      const matchesModule = theFilters.moduleId === 'all' || run.moduleIds.includes(theFilters.moduleId)
      const matchesRequester = theFilters.requester === 'all' || run.requestedBy === theFilters.requester
      const matchesQuery =
         !query
         || run.code.toLowerCase().includes(query)
         || run.branch.toLowerCase().includes(query)
         || run.moduleLabel.toLowerCase().includes(query)
         || run.requestedBy.toLowerCase().includes(query)
      return matchesState && matchesModule && matchesRequester && matchesQuery
   })
})

const theSelectedRun = computed(() =>
   theData.value.runs.find((run) => run.id === theUI.selectedRunId) ?? null,
)

function startRunExecution(branchName: string, moduleId: string, suiteType: TestSuiteType) {
   const branchMeta = theData.value.branches.find((branch) => branch.name === branchName)
   const moduleMeta = theData.value.modules.find((mod) => mod.id === moduleId)
   const nextId = theData.value.runs.reduce((max, run) => Math.max(max, run.id), 1048) + 1
   const totalTests = moduleId === 'all' ? 412 : suiteType === 'unit' ? 68 : 124

   const newRun: TestRun = {
      id: nextId,
      code: `#RUN-${nextId}`,
      branch: branchName,
      commitSha: branchMeta?.lastCommitSha ?? 'd4e5f60',
      moduleId,
      moduleLabel: moduleMeta?.label ?? moduleId,
      suiteType,
      requestedBy: theData.value.currentUser,
      environment: 'ci-runner-02',
      startedAt: new Date(),
      finishedAt: null,
      durationSeconds: 1,
      state: 'running',
      progressPercent: 8,
      currentStep: gettext('Initialisation de la branche et chargement des fixtures…'),
      totalTests,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      coveragePercent: null,
      suites: [],
      logLines: [],
   }

   newRun.logLines = buildLogLines(newRun)
   theData.value.runs.unshift(newRun)
}

function onLaunchTest() {
   const isValidBranch = theData.value.branches.some((branch) => branch.name === theForm.branch)
   theErrors.branch = !theForm.branch
      ? gettext('Veuillez sélectionner une branche.')
      : !isValidBranch
        ? gettext('Sélectionnez une branche valide dans la liste.')
        : ''
   theErrors.moduleIds = theForm.moduleIds.length > 0 ? '' : gettext('Veuillez sélectionner au moins un module.')

   if (theErrors.branch || theErrors.moduleIds || !theData.value.serverOnline) return

   startRunExecution(theForm.branch, theForm.moduleIds, theForm.suiteType)
}

function onResetForm() {
   theForm.branch = 'main'
   theForm.moduleIds = ['ezsign-folders', 'ezsign-signers']
   theForm.suiteType = 'all'
   theErrors.branch = ''
   theErrors.moduleIds = ''
}

function onResetFilters() {
   theFilters.search = ''
   theFilters.state = 'all'
   theFilters.moduleId = 'all'
   theFilters.requester = 'all'
}

function onOpenRun(run: TestRun) {
   theUI.selectedRunId = run.id
   theUI.isDialogOpen = true
}

function onCancelRun(runId: number) {
   const target = theData.value.runs.find((run) => run.id === runId)
   if (!target || target.state !== 'running') return
   target.state = 'cancelled'
   target.finishedAt = new Date()
   target.currentStep = gettext('Interrompu à %{percent} %', { percent: target.progressPercent })
   target.logLines = buildLogLines(target)
}

function onRerunFromDialog(run: TestRun) {
   theForm.branch = run.branch
   theForm.moduleIds = [...run.moduleIds]
   theForm.suiteType = run.suiteType
   startRunExecution(run.branch, run.moduleIds, run.suiteType)
}

function onQuickDownloadLog(run: TestRun) {
   const slug = run.code.replace('#', '')
   const blob = new Blob([`${run.logLines.join('\n')}\n`], { type: 'text/plain;charset=utf-8' })
   const url = URL.createObjectURL(blob)
   const link = document.createElement('a')
   link.href = url
   link.download = `${slug}-console.log`
   document.body.appendChild(link)
   link.click()
   link.remove()
   URL.revokeObjectURL(url)
}

function onRefresh() {
   theUI.isRefreshing = true
   setTimeout(() => {
      theUI.isRefreshing = false
   }, 500)
}

function advanceRunningTests() {
   for (const run of theData.value.runs) {
      if (run.state !== 'running') continue

      const nextProgress = Math.min(100, run.progressPercent + 14)
      run.progressPercent = nextProgress
      run.durationSeconds += 6
      run.passedTests = Math.round((run.totalTests * nextProgress) / 100)

      if (nextProgress >= 100) {
         run.state = 'passed'
         run.finishedAt = new Date()
         run.currentStep = gettext('Terminé')
         run.passedTests = run.totalTests
         run.coveragePercent = 89.4
         run.suites = [
            {
               id: `${run.id}-suite-1`,
               name: `${run.moduleId}-unit`,
               passed: Math.ceil(run.totalTests * 0.6),
               failed: 0,
               skipped: 0,
               durationSeconds: Math.max(12, Math.floor(run.durationSeconds * 0.45)),
               failures: [],
            },
            {
               id: `${run.id}-suite-2`,
               name: `${run.moduleId}-integration`,
               passed: Math.floor(run.totalTests * 0.4),
               failed: 0,
               skipped: 0,
               durationSeconds: Math.max(14, Math.ceil(run.durationSeconds * 0.55)),
               failures: [],
            },
         ]
      } else if (nextProgress >= 75) {
         run.currentStep = gettext('Finalisation du rapport et calcul de couverture…')
      } else {
         run.currentStep = gettext('Exécution des suites de tests (%{done}/%{total})…', {
            done: run.passedTests,
            total: run.totalTests,
         })
      }

      run.logLines = buildLogLines(run)
   }
}

watch(theData, () => {
   theUI.isDialogOpen = false
   theUI.selectedRunId = null
   theErrors.branch = ''
   theErrors.moduleId = ''
   onResetFilters()
})

onMounted(() => {
   theTickerId = setInterval(advanceRunningTests, 1200)
})

onBeforeUnmount(() => {
   if (theTickerId) clearInterval(theTickerId)
})
</script>

<style scoped>
.test-runner__progress-track {
   height: 8px;
   border-radius: var(--radius-full);
   background: var(--color-surface);
   overflow: hidden;
}

.test-runner__progress-fill {
   height: 100%;
   border-radius: var(--radius-full);
   background: var(--color-info);
   transition: width 250ms ease;
}

.test-runner__mini-track {
   width: 72px;
   height: 6px;
   border-radius: var(--radius-full);
   background: var(--color-border);
   overflow: hidden;
}

.test-runner__mini-fill {
   height: 100%;
   border-radius: var(--radius-full);
   background: var(--color-info);
   transition: width 250ms ease;
}

.test-runner__top-grid {
   align-items: stretch;
}

.test-runner__top-card {
   flex: 1;
   height: 100%;
   display: flex;
   flex-direction: column;
}

.test-runner__top-card :deep(.ez-card__body) {
   flex: 1;
}

.test-runner__server-tiles.ez-info-list--tiles {
   grid-template-columns: repeat(2, minmax(0, 1fr));
}

.test-runner__latest-box {
   display: flex;
   flex-direction: column;
   gap: 4px;
   padding: var(--space-inset-sm);
   border: 1px solid var(--color-border-muted);
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
   min-width: 0;
}

.test-runner__truncate {
   display: block;
   max-width: 100%;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.test-runner__server-dot {
   width: 8px;
   height: 8px;
   border-radius: var(--radius-full);
}

.test-runner__server-dot--success {
   background: var(--color-positive);
}

.test-runner__server-dot--info {
   background: var(--color-info);
}

.test-runner__server-dot--danger {
   background: var(--color-negative);
}

.test-runner__results-grid {
   display: inline-grid;
   grid-template-columns: 60px 84px;
   gap: 10px;
   justify-items: end;
   font-variant-numeric: tabular-nums;
   white-space: nowrap;
}

.test-runner__state-badge {
   width: 88px;
   justify-content: center;
   text-align: center;
}
</style>
