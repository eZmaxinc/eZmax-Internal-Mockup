<!-- Private to ez-layout-composition (not registered, not in the gallery). The columns of a composition, recursively: a group becomes an ez-layout, a leaf the slot of its name (or #field) -->
<template>
   <template v-for="col in cols" :key="col.id">
      <ez-layout
         v-if="isLayoutGroup(col) && col.direction === 'subgrid'"
         direction="subgrid"
         :span="col.span"
         :container="col.container"
         :gap="col.gap"
         :class="[col.class, { 'col-span-full': col.span === undefined }]"
      >
         <LayoutCompositionCols :cols="col.cols" />
      </ez-layout>

      <ez-layout-col
         v-else
         :span="col.span"
         :container="col.container"
         :class="col.class"
         :name="isLayoutGroup(col) ? undefined : `#${col.slot}`"
      >
         <ez-layout v-if="isLayoutGroup(col)" :columns="col.columns" :gap="col.gap" :direction="col.direction">
            <LayoutCompositionCols :cols="col.cols" />
         </ez-layout>

         <component :is="SlotOutlet" v-else-if="getColumnSlot(col)" :col="col" />
      </ez-layout-col>
   </template>
</template>

<script setup lang="ts">
import { inject, type Slots } from 'vue'
import LayoutCompositionCols from './layout-composition-cols.vue'
import { isLayoutGroup, LAYOUT_COMPOSITION_SLOTS_KEY, type ILayoutCol, type TLayoutLeafCol } from './layout'

const theCompositionSlots = inject(LAYOUT_COMPOSITION_SLOTS_KEY, null)

if (!theCompositionSlots) throw new Error('ez-layout-composition-cols must be used inside ez-layout-composition')

defineProps<{
   /** The columns to draw: leaves (slot) and groups (cols) */
   cols: readonly ILayoutCol[]
}>()

function getColumnSlot(col: TLayoutLeafCol) {
   return theCompositionSlots![col.slot] ?? theCompositionSlots!.field
}

function SlotOutlet({ col }: { col: TLayoutLeafCol }) {
   return getColumnSlot(col)?.({ slot: col.slot, label: col.label, props: col.props ?? {} })
}
</script>
