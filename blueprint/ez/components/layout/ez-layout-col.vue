<template>
   <div
      class="ez-layout-col"
      :class="{ 'ez-layout-col--first-below-md': firstBelowMd }"
      :style="{
         '--ez-layout-col-span-base': theSpanBase,
         '--ez-layout-col-span-md': theSpan.md ?? theSpanBase,
         '--ez-layout-col-span-lg': theSpan.lg ?? theSpan.md ?? theSpanBase,
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

const theSpan = computed(() => (typeof props.cols === 'number' ? { base: props.cols } : props.cols))
const theSpanBase = computed(() => theSpan.value.base ?? 12)
</script>

<style scoped>
/* Self-contained: copies into the mono as is, with ez-layout.vue. Override the gap with --card-gap. */
.ez-layout-col {
   /* Variables first: the gap here, the spans from the cols prop (inline) */
   --ez-layout-col-gap: var(--card-gap, var(--space-gap-md));

   display: flex;
   flex-direction: column;
   gap: var(--ez-layout-col-gap);
   min-width: 0;
   grid-column: span var(--ez-layout-col-span-base) / span var(--ez-layout-col-span-base);
}

@media (width >= 64rem) { /* md */
   .ez-layout-col {
      grid-column: span var(--ez-layout-col-span-md) / span var(--ez-layout-col-span-md);
   }
}

@media (width >= 90rem) { /* lg */
   .ez-layout-col {
      grid-column: span var(--ez-layout-col-span-lg) / span var(--ez-layout-col-span-lg);
   }
}

@media (width < 64rem) { /* below md */
   .ez-layout-col--first-below-md {
      order: -1;
   }
}
</style>
