<template>
   <component :is="as" class="ez-info">
      <div v-for="(theCategory, categoryIndex) in data" :key="theCategory.name ?? categoryIndex">
         <ez-heading v-if="theCategory.title" variant="group" class="ez-info__title">
            <ez-icon v-if="theCategory.icon" :name="theCategory.icon" :size="16" />
            {{ theCategory.title }}
         </ez-heading>

         <component :is="theCategory.tone ? InfoItemGroup : 'div'" v-bind="theCategory.tone ? { tone: theCategory.tone } : undefined">
            <ez-layout :gap="3">
               <InfoCategoryCols :cols="theCols[categoryIndex]">
                  <template #field="{ slot, label, props: { item } }">
                     <slot :name="slot" :field-slot="slot" :item="item" :label="label">
                        <slot name="field" :field-slot="slot" :item="item" :label="label">
                           <hr v-if="item.separator" class="ez-info__separator">
                           <component :is="elementOf(item)" v-else :item="sortedItemOf(item)" />
                        </slot>
                     </slot>
                  </template>
               </InfoCategoryCols>
            </ez-layout>
         </component>
      </div>
   </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InfoCategoryCols from './info-category-cols.vue'
import InfoElementBoxed from './info-element-boxed.vue'
import InfoElementList from './info-element-list.vue'
import InfoElementPill from './info-element-pill.vue'
import InfoItemGroup from './info-item-group.vue'
import { getCategoryLayoutCols, sortByInfoTone, type IInfoCategory, type IInfoCategoryItems } from './info'

const props = withDefaults(defineProps<{
   /** The categories, in order: titled groups of items (IInfoCategory[], the same objects as production) */
   data: IInfoCategory[]
   /** Renders as another element */
   as?: string
}>(), {
   as: 'div',
})

/** A slot per item (#<key>) replaces its element; #field replaces every element */
defineSlots<{ [name: string]: ((props: { fieldSlot: string, item: IInfoCategoryItems, label?: string }) => any) | undefined }>()

/** The tree of each category, computed once rather than on every render */
const theCols = computed(() => props.data.map((category) => getCategoryLayoutCols(category)))

function elementOf(item: IInfoCategoryItems) {
   if (item.variant === 'pill') return InfoElementPill
   if (item.variant === 'list') return InfoElementList
   return InfoElementBoxed
}

/** Pills and lists: the positive entries first */
function sortedItemOf(item: IInfoCategoryItems): IInfoCategoryItems {
   if (item.variant !== 'pill' && item.variant !== 'list') return item
   if (Array.isArray(item.value)) return { ...item, value: sortByInfoTone(item.value) }
   return item
}
</script>

<style scoped>
.ez-info {
   --ez-info-category-gap: 1.25rem;
   --ez-info-separator: color-mix(in srgb, var(--color-foreground-subtle) 15%, transparent);

   display: flex;
   flex-direction: column;
   gap: var(--ez-info-category-gap);
}

.ez-info__title {
   display: flex;
   align-items: center;
   gap: 0.375rem;
   margin-bottom: var(--space-gap-sm);
}

.ez-info__separator {
   margin: 0;
   border: 0;
   border-top: 1px solid var(--ez-info-separator);
}
</style>
