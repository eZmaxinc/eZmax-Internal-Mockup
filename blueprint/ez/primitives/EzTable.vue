<template>
   <div class="ez-table">
      <table>
         <thead>
            <tr>
               <th v-if="selectable" class="ez-table__check">
                  <input type="checkbox" :checked="allSelected" :indeterminate="selected.length > 0 && !allSelected" aria-label="Tout sélectionner" @change="toggleAll">
               </th>
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
               <td v-if="selectable" />
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
               <td v-if="selectable" class="ez-table__check" @click.stop>
                  <input type="checkbox" :checked="selected.includes(theRow[rowKey])" aria-label="Sélectionner la ligne" @change="toggle(theRow[rowKey])">
               </td>
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
import { computed } from 'vue'
import EzEmptyState from './EzEmptyState.vue'

export interface EzTableColumn {
   key: string
   label: string
   align?: 'left' | 'right' | 'center'
   width?: string
}

const props = withDefaults(defineProps<{
   columns: EzTableColumn[]
   rows: TRow[]
   rowKey?: string
   /** A checkbox per row and one for all; the chosen row keys are in v-model:selected */
   selectable?: boolean
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

/** Keys (row-key) of the selected rows */
const selected = defineModel<(string | number)[]>('selected', { default: () => [] })

const allSelected = computed(() => props.rows.length > 0 && props.rows.every((row) => selected.value.includes(row[props.rowKey])))

function toggle(key: string | number) {
   selected.value = selected.value.includes(key) ? selected.value.filter((item) => item !== key) : [...selected.value, key]
}

function toggleAll() {
   selected.value = allSelected.value ? [] : props.rows.map((row) => row[props.rowKey])
}
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
   height: var(--table-row-height);
   padding: 0 16px;
   background: var(--color-surface-muted);
   border-top: 1px solid var(--color-border-muted);
   border-bottom: 1px solid var(--color-border);
   color: var(--color-foreground);
   font-weight: 600;
   white-space: nowrap;
}

.ez-table__check {
   width: 1%;
   padding-right: 0;

   input {
      display: block;
      width: 18px;
      height: 18px;
      accent-color: var(--color-accent);
      cursor: pointer;
   }
}

td {
   height: var(--table-row-height);
   padding: 0 16px;
   border-bottom: 1px solid var(--color-border-muted);
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
   background: var(--color-border-muted);
   animation: ez-pulse 1.2s ease-in-out infinite;
}

@keyframes ez-pulse {
   50% {
      opacity: 0.5;
   }
}
</style>
