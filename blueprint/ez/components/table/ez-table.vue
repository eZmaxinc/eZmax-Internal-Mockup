<template>
   <div class="ez-table">
      <table>
         <thead>
            <tr>
               <th v-if="selectable" class="ez-table__check">
                  <input type="checkbox" :checked="isAllSelected" :indeterminate="theSelected.length > 0 && !isAllSelected" :aria-label="$gettext('Tout sélectionner')" @change="onToggleAll">
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
               @click="onRowClick(theRow)"
               @keydown.enter="onRowClick(theRow)"
            >
               <td v-if="selectable" class="ez-table__check" @click.stop>
                  <input type="checkbox" :checked="theSelected.includes(theRow[rowKey])" :aria-label="$gettext('Sélectionner la ligne')" @change="onToggle(theRow[rowKey])">
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
            <ez-empty-state :title="emptyTitle ?? $gettext('Aucun élément')" />
         </slot>
      </div>
   </div>
</template>

<script setup lang="ts" generic="TRow extends Record<string, any>">
import { computed } from 'vue'
import EzEmptyState from '../empty-state/ez-empty-state.vue'

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
})

const emit = defineEmits<{
   'row-click': [row: TRow]
}>()

/** Keys (row-key) of the selected rows: v-model:selected */
const theSelected = defineModel<(string | number)[]>('selected', { default: () => [] })

const isAllSelected = computed(() => props.rows.length > 0 && props.rows.every((row) => theSelected.value.includes(row[props.rowKey])))

function onRowClick(row: TRow) {
   if (props.clickable) emit('row-click', row)
}

function onToggle(key: string | number) {
   theSelected.value = theSelected.value.includes(key) ? theSelected.value.filter((item) => item !== key) : [...theSelected.value, key]
}

function onToggleAll() {
   theSelected.value = isAllSelected.value ? [] : props.rows.map((row) => row[props.rowKey])
}
</script>

<style scoped>
.ez-table {
   /* Variables first: what the table's look depends on, read below */
   --ez-table-row-height: var(--table-row-height);
   --ez-table-padding-x: var(--space-inset-md);
   --ez-table-head-surface: var(--color-surface-muted);
   --ez-table-head-border: var(--color-border);
   --ez-table-border: var(--color-border-muted);
   --ez-table-color: var(--color-foreground);
   --ez-table-hover: color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface));
   --ez-table-check: var(--color-accent);

   overflow-x: auto;
}

table {
   width: 100%;
   border-collapse: collapse;
   font-size: var(--text-sm);
}

th {
   height: var(--ez-table-row-height);
   padding: 0 var(--ez-table-padding-x);
   background: var(--ez-table-head-surface);
   border-top: 1px solid var(--ez-table-border);
   border-bottom: 1px solid var(--ez-table-head-border);
   color: var(--ez-table-color);
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
      accent-color: var(--ez-table-check);
      cursor: pointer;
   }
}

td {
   height: var(--ez-table-row-height);
   padding: 0 var(--ez-table-padding-x);
   border-bottom: 1px solid var(--ez-table-border);
   vertical-align: middle;
}

tbody tr:last-child td {
   border-bottom: none;
}

.ez-table__row--clickable {
   cursor: pointer;

   &:hover,
   &:focus-visible {
      background: var(--ez-table-hover);
      outline: none;
   }
}

.ez-table__skeleton {
   display: block;
   width: 70%;
   height: 10px;
   border-radius: var(--radius-sm);
   background: var(--ez-table-border);
   animation: ez-pulse 1.2s ease-in-out infinite;
}

@keyframes ez-pulse {
   50% {
      opacity: 0.5;
   }
}
</style>
