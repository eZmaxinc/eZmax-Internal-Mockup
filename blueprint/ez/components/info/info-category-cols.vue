<!--
   Private to ez-info (not registered, not in the gallery). The columns of an ez-info category, recursively, as ez-layout-composition-cols: a sub-category (infoGroup) is framed
   by an ez-info-item-group, a leaf goes to the #field slot. ez-info fills it; the nested groups inherit it.
-->
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
         <InfoCategoryCols :cols="col.cols" />
      </ez-layout>

      <ez-layout-col
         v-else
         :span="col.span"
         :container="col.container"
         :class="isLayoutGroup(col) ? undefined : col.class"
         :name="isLayoutGroup(col) ? undefined : `#${col.slot}`"
      >
         <InfoItemGroup
            v-if="isInfoCompositionGroup(col)"
            :class="col.class"
            :tone="col.infoGroup.tone"
            :title="col.infoGroup.title"
            :icon="col.infoGroup.icon"
         >
            <ez-layout :columns="col.columns" :gap="col.gap" :direction="col.direction">
               <InfoCategoryCols :cols="col.cols" />
            </ez-layout>
         </InfoItemGroup>

         <div v-else-if="isLayoutGroup(col)" class="min-w-0" :class="col.class">
            <ez-layout :columns="col.columns" :gap="col.gap" :direction="col.direction">
               <InfoCategoryCols :cols="col.cols" />
            </ez-layout>
         </div>

         <component :is="FieldOutlet" v-else-if="getColumnSlot(col)" :col="col" :render="getColumnSlot(col)!" />
      </ez-layout-col>
   </template>
</template>

<script setup lang="ts">
import { inject, provide, useSlots } from 'vue'
import InfoCategoryCols from './info-category-cols.vue'
import InfoItemGroup from './info-item-group.vue'
import { INFO_FIELD_SLOTS_KEY, isInfoCompositionGroup } from './info'
import { isLayoutGroup, type ILayoutCol, type TLayoutLeafCol } from '../layout/layout'

defineProps<{
   /** The columns of the category (getCategoryLayoutCols) */
   cols: readonly ILayoutCol[]
}>()

const theOwnSlots = useSlots()
const theParentSlots = inject(INFO_FIELD_SLOTS_KEY, null)

/**
 * The slots given here (ez-info's #field) win; the nested groups, which get none, inherit those of the root.
 * A key of its own: the slots of a page's ez-layout-composition around this ez-info never leak in.
 */
const theFieldSlots = Object.keys(theOwnSlots).length ? theOwnSlots : (theParentSlots ?? theOwnSlots)

provide(INFO_FIELD_SLOTS_KEY, theFieldSlots)

function getColumnSlot(col: TLayoutLeafCol) {
   return theFieldSlots[col.slot] ?? theFieldSlots.field
}

function FieldOutlet({ col, render }: { col: TLayoutLeafCol, render: NonNullable<ReturnType<typeof getColumnSlot>> }) {
   return render({ slot: col.slot, label: col.label, props: col.props ?? {} })
}
</script>
