<template>
   <div
      class="ez-layout-col"
      :class="{ 'ez-layout-col--first-below-md': firstBelowMd }"
      :style="{
         '--span-base': spanBase,
         '--span-md': span.md ?? spanBase,
         '--span-lg': span.lg ?? span.md ?? spanBase,
      }"
   >
      <slot />
   </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Span = number | { base?: number, md?: number, lg?: number }

const props = withDefaults(defineProps<{
   /** Columns out of 12. Number, or per breakpoint: { base: 12, md: 8 } (md ≥ 1024px, lg ≥ 1440px, as in production) */
   cols?: Span
   /** Production pattern: right column goes first under md */
   firstBelowMd?: boolean
}>(), {
   cols: 12,
})

const span = computed(() => (typeof props.cols === 'number' ? { base: props.cols } : props.cols))
const spanBase = computed(() => span.value.base ?? 12)
</script>

<style scoped>
/* Self-contained: copies into the mono as is, with EzLayout.vue. Override the gap with --card-gap. */
.ez-layout-col {
   display: flex;
   flex-direction: column;
   gap: var(--card-gap, var(--space-gap-md));
   min-width: 0;
   grid-column: span var(--span-base) / span var(--span-base);
}

@media (width >= 64rem) { /* md */
   .ez-layout-col {
      grid-column: span var(--span-md) / span var(--span-md);
   }
}

@media (width >= 90rem) { /* lg */
   .ez-layout-col {
      grid-column: span var(--span-lg) / span var(--span-lg);
   }
}

@media (width < 64rem) { /* below md */
   .ez-layout-col--first-below-md {
      order: -1;
   }
}
</style>
