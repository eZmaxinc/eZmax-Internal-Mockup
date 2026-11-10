<template>
   <ez-page>
      <ez-page-header title="Prototypes" subtitle="Une tâche GoodDay = un dossier dans prototypes/. Créer: pnpm proto new" />
      <ez-page-content>
         <ez-card flush>
            <ez-table :columns="columns" :rows="theRows" clickable empty-title="Aucun prototype" @row-click="open">
               <template #cell-title="{ row }">
                  <strong>{{ row.title }}</strong>
                  <div class="text-xs text-foreground-muted">{{ row.id }}</div>
               </template>
               <template #cell-status="{ row }">
                  <ez-badge :tone="statusTone[row.status as ProtoStatus]" :label="statusLabel[row.status as ProtoStatus]" />
               </template>
            </ez-table>
         </ez-card>

         <ez-layout class="mt-4">
            <ez-layout-col :cols="{ base: 12, md: 8 }">
               <ez-card title="Références" subtitle="Les patrons de page dont partent les prototypes." flush>
                  <ez-table :columns="patternColumns" :rows="thePatterns" clickable @row-click="openPattern">
                     <template #cell-id="{ row }">
                        <strong>{{ row.id }}</strong>
                     </template>
                  </ez-table>
               </ez-card>
            </ez-layout-col>
            <ez-layout-col :cols="{ base: 12, md: 4 }">
               <ez-card title="Système" subtitle="Les composants ez- et les tokens, tels qu'ils s'affichent.">
                  <ez-btn variant="secondary" icon="eye" label="Galerie des composants" @click="theRouter.push('/gallery')" />
               </ez-card>
            </ez-layout-col>
         </ez-layout>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { EzTableColumn } from '@ez'
import { STATUS_LABEL as statusLabel, STATUS_TONE as statusTone, listPatterns, listTasks, type ProtoStatus } from '@/registry'

const theRouter = useRouter()

const columns: EzTableColumn[] = [
   { key: 'goodday', label: 'GoodDay' },
   { key: 'title', label: 'Tâche' },
   { key: 'status', label: 'Statut' },
   { key: 'versions', label: 'Versions', align: 'right' },
   { key: 'chosen', label: 'Retenue', align: 'right' },
   { key: 'owner', label: 'Responsable' },
]

const theRows = computed(() => listTasks().map((task) => ({
   id: task.id,
   goodday: task.meta.goodday ? `#${task.meta.goodday.number}` : (task.meta.demo ? 'démo' : '—'),
   title: task.meta.title,
   status: task.meta.status,
   versions: task.versions.length,
   chosen: task.meta.chosen ?? '—',
   owner: task.meta.owner ?? '—',
})))

const patternColumns: EzTableColumn[] = [
   { key: 'id', label: 'Patron' },
   { key: 'summary', label: 'Ce qu\'il montre' },
]

const thePatterns = computed(() => listPatterns().map((pattern) => ({ id: pattern.id, summary: pattern.notes.summary })))

function openPattern(row: { id: string }) {
   theRouter.push(`/e/${row.id}`)
}

function open(row: { id: string }) {
   theRouter.push(`/p/${row.id}`)
}
</script>
