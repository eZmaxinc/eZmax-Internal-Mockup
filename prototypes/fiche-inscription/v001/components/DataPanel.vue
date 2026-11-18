<template>
   <SubPanel :title="panel.title" :icon="panel.icon" :count="addable ? theEntryCount : undefined">
      <template v-if="addable" #actions>
         <ez-btn variant="flat" size="sm" icon="add" :aria-label="$gettext('Ajouter')" />
      </template>

      <div class="overflow-x-auto">
         <ez-table :columns="panel.columns" :rows="panel.rows">
            <template v-for="(theColumn, index) in panel.columns" :key="theColumn.key" #[`cell-${theColumn.key}`]="{ row }">
               <div :class="{ 'font-bold': row.isTotal }">
                  <a v-if="row.cells[index].isLink" href="#" class="text-accent underline" @click.prevent>{{ row.cells[index].value }}</a>
                  <span v-else :class="{ 'text-foreground-subtle': row.cells[index].value === '—' }">{{ row.cells[index].value }}</span>
                  <div v-if="row.cells[index].sub" class="text-xs font-normal text-foreground-muted">{{ row.cells[index].sub }}</div>
               </div>
            </template>
         </ez-table>
      </div>

      <div v-if="panel.summary" class="flex flex-wrap justify-end gap-2 px-3 py-2">
         <ez-badge v-for="theStat in panel.summary" :key="theStat.label" tone="action">
            {{ theStat.label }} {{ theStat.value }}
         </ez-badge>
      </div>
   </SubPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Panel } from '../mocks'
import EzBadge from './EzBadge.vue'
import SubPanel from './SubPanel.vue'

const props = defineProps<{ panel: Panel; addable?: boolean }>()

const theEntryCount = computed(() => props.panel.rows.filter((row) => !row.isTotal).length)
</script>
