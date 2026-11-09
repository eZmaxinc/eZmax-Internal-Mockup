<template>
   <div class="ez-table">
      <table>
         <thead>
            <tr>
               <th
                  v-for="theColumn in columns"
                  :key="theColumn.key"
                  :style="{ width: theColumn.width, textAlign: theColumn.align ?? 'left' }"
               >
                  {{ theColumn.label }}
               </th>
            </tr>
         </thead>
         <tbody v-if="loading">
            <tr v-for="n in 4" :key="n">
               <td v-for="theColumn in columns" :key="theColumn.key">
                  <span class="ez-table__skeleton" />
               </td>
            </tr>
         </tbody>
         <tbody v-else-if="rows.length">
            <tr
               v-for="(theRow, index) in rows"
               :key="String(theRow[rowKey] ?? index)"
               :class="{ 'ez-table__row--clickable': clickable }"
               :tabindex="clickable ? 0 : undefined"
               @click="clickable && emit('row-click', theRow)"
               @keydown.enter="clickable && emit('row-click', theRow)"
            >
               <td
                  v-for="theColumn in columns"
                  :key="theColumn.key"
                  :style="{ textAlign: theColumn.align ?? 'left' }"
               >
                  <!-- Explicit check: a provided slot that renders nothing must stay empty, not fall back to "—" -->
                  <slot
                     v-if="$slots[`cell-${theColumn.key}`]"
                     :name="`cell-${theColumn.key}`"
                     :row="theRow"
                     :value="theRow[theColumn.key]"
                  />
                  <template v-else>{{ theRow[theColumn.key] ?? '—' }}</template>
               </td>
            </tr>
         </tbody>
      </table>
      <div v-if="!loading && !rows.length" class="ez-table__empty">
         <slot name="empty">
            <ez-empty-state :title="emptyTitle" />
         </slot>
      </div>
   </div>
</template>

<script setup lang="ts" generic="TRow extends Record<string, any>">
import EzEmptyState from './EzEmptyState.vue'

export interface EzTableColumn {
   key: string
   label: string
   align?: 'left' | 'right' | 'center'
   width?: string
}

withDefaults(defineProps<{
   columns: EzTableColumn[]
   rows: TRow[]
   rowKey?: string
   clickable?: boolean
   loading?: boolean
   emptyTitle?: string
}>(), {
   rowKey: 'id',
   emptyTitle: 'Aucun élément',
})

const emit = defineEmits<{
   'row-click': [row: TRow]
}>()
</script>

<style scoped>
.ez-table {
   overflow-x: auto;
}

table {
   width: 100%;
   border-collapse: collapse;
   font-size: var(--text-sm);
}

th {
   height: 36px;
   padding: 0 16px;
   background: var(--color-surface-muted);
   border-top: 1px solid var(--color-border-subtle);
   border-bottom: 1px solid var(--color-border);
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   font-weight: 600;
   text-transform: uppercase;
   letter-spacing: 0.03em;
   white-space: nowrap;
}

td {
   height: var(--table-row-height);
   padding: 0 16px;
   border-bottom: 1px solid var(--color-border-subtle);
   vertical-align: middle;
}

tbody tr:last-child td {
   border-bottom: none;
}

.ez-table__row--clickable {
   cursor: pointer;

   &:hover,
   &:focus-visible {
      background: color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface));
      outline: none;
   }
}

.ez-table__skeleton {
   display: block;
   width: 70%;
   height: 10px;
   border-radius: var(--radius-sm);
   background: var(--color-border-subtle);
   animation: ez-pulse 1.2s ease-in-out infinite;
}

@keyframes ez-pulse {
   50% {
      opacity: 0.5;
   }
}
</style>
