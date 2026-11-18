<template>
   <div class="overflow-x-auto rounded-sm border border-border bg-surface-muted px-5 py-4">
      <ol class="sale-timeline">
         <li v-for="theStep in steps" :key="theStep.step" class="sale-timeline__step">
            <span class="sale-timeline__dot" :class="{ 'sale-timeline__dot--done': theStep.isDone }">
               <ez-icon v-if="theStep.isDone" name="check" :size="14" />
            </span>
            <span class="mt-2 text-xs font-medium tracking-wide text-foreground-muted uppercase">{{ theStep.step }}</span>
            <span class="text-sm font-semibold whitespace-nowrap" :class="{ 'text-foreground-subtle': !theStep.date }">{{ formatDate(theStep.date) }}</span>
         </li>
      </ol>
   </div>
</template>

<script setup lang="ts">
import { formatDate } from '@ez'
import type { TimelineStep } from '../mocks'

defineProps<{ steps: TimelineStep[] }>()
</script>

<style scoped>
.sale-timeline {
   --sale-timeline-dot: 1.25rem;

   position: relative;
   display: grid;
   grid-auto-flow: column;
   grid-auto-columns: minmax(0, 1fr);
   gap: var(--space-gap-sm);
   min-width: 32rem;
}

/* The line behind the dots */
.sale-timeline::before {
   content: "";
   position: absolute;
   top: calc(var(--sale-timeline-dot) / 2 - 1px);
   right: var(--space-gap-sm);
   left: var(--space-gap-sm);
   height: 2px;
   background: var(--color-border-strong);
}

.sale-timeline__step {
   position: relative;
   display: flex;
   flex-direction: column;
   align-items: center;
   text-align: center;
}

.sale-timeline__step:first-child {
   align-items: flex-start;
   text-align: left;
}

.sale-timeline__step:last-child {
   align-items: flex-end;
   text-align: right;
}

.sale-timeline__dot {
   display: flex;
   align-items: center;
   justify-content: center;
   width: var(--sale-timeline-dot);
   height: var(--sale-timeline-dot);
   border-radius: var(--radius-full);
   background: var(--color-border-strong);
   color: var(--color-accent-foreground);
   box-shadow: 0 0 0 3px var(--color-surface-muted);
}

.sale-timeline__dot--done {
   background: var(--color-accent);
}
</style>
