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
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { EzTableColumn } from '@ez'
import { listTasks, type ProtoStatus } from '@/registry'

const theRouter = useRouter()

const statusLabel: Record<ProtoStatus, string> = { draft: 'Brouillon', review: 'En revue', chosen: 'Retenu', archived: 'Archivé' }
const statusTone = { draft: 'neutral', review: 'info', chosen: 'success', archived: 'neutral' } as const

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

function open(row: { id: string }) {
   theRouter.push(`/p/${row.id}`)
}
</script>
