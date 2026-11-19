<!-- A page or a card laid out from a definition (defineLayoutComposition): sections, then columns, one typed slot per leaf -->
<template>
   <ez-layout
      :as="as"
      :columns="theOptions.sections.columns"
      :gap="theOptions.sections.gap"
      :container="theOptions.container"
      :debug="debug"
   >
      <ez-layout-col v-for="theSection in theSections" :key="theSection.key" as="section" :span="theSection.span" :container="theSection.container">
         <ez-heading v-if="theSection.title" variant="card" class="ez-layout-composition__title">{{ theSection.title }}</ez-heading>

         <ez-layout
            :columns="theSection.columns ?? theOptions.cols.columns"
            :gap="theSection.gap ?? theOptions.cols.gap"
            :direction="theSection.direction"
         >
            <LayoutCompositionCols :cols="theSection.cols" />
         </ez-layout>
      </ez-layout-col>
   </ez-layout>
</template>

<script setup lang="ts" generic="T extends TLayoutComposition">
import { computed, provide, useSlots } from 'vue'
import { gettext } from '../../i18n'
import LayoutCompositionCols from './layout-composition-cols.vue'
import { LAYOUT_COMPOSITION_SLOTS_KEY, LAYOUT_KEY, type TLayoutBreakpointSource, type TLayoutComposition, type TLayoutCompositionDefinition, type TLayoutDirection, type TLayoutFieldSlotProps, type TLayoutSlotName, type TLayoutSlotProps } from './layout'

const props = withDefaults(defineProps<{
   /** The definition: defineLayoutComposition((t) => [...sections], options) */
   composition: TLayoutCompositionDefinition<T>
   /** Outlines every grid and labels every column */
   debug?: boolean
   /** Renders as another element */
   as?: string
}>(), {
   debug: undefined,
   as: 'div',
})

defineSlots<
   { field?: (props: TLayoutFieldSlotProps<T>) => any } & {
      [K in TLayoutSlotName<T>]?: (props: TLayoutSlotProps<T, K>) => any
   }
>()

const theSections = computed(() => props.composition((message) => gettext(message)))
const theOptions = computed(() => props.composition.options)

// The leaves find their slot here, whatever their depth
provide(LAYOUT_COMPOSITION_SLOTS_KEY, useSlots())

// A composition starts a new tree: viewport thresholds, no debug inherited, a grid
provide(LAYOUT_KEY, {
   breakpointSource: computed<TLayoutBreakpointSource>(() => 'viewport'),
   childBreakpointSource: computed<TLayoutBreakpointSource>(() => 'viewport'),
   debugEnabled: computed(() => false),
   direction: computed<TLayoutDirection>(() => 'grid'),
})
</script>

<style scoped>
.ez-layout-composition__title {
   margin-bottom: var(--space-gap-md);
}
</style>
