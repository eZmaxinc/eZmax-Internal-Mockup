<template>
   <!--
      One line from the sending to the elimination. A step is a dot with its name under it; the duration of a
      stretch is written above the line, and the line says what the stretch is (dashed: only if nobody signed;
      grey: the folder is kept; red: before the elimination).
   -->
   <div class="line">
      <div class="line__grid" :style="{ gridTemplateColumns: columns }">
         <template v-for="(theStep, index) in steps" :key="theStep.key">
            <span v-if="theStep.lead" class="line__stretch" :class="`line__stretch--${theStep.lead.kind}`" :style="{ gridColumn: index * 2 }">
               <span v-if="theStep.lead.text" class="line__duration">{{ theStep.lead.text }}</span>
               <span class="line__rule" />
            </span>
            <ez-tooltip class="line__step" :title="theStep.tooltip.title" :text="theStep.tooltip.text" :style="{ gridColumn: index * 2 + 1 }">
               <span class="line__dot" :class="`line__dot--${theStep.key}`" />
            </ez-tooltip>
            <span
               class="line__label"
               :class="[`line__label--${theStep.key}`, { 'line__label--first': index === 0, 'line__label--last': index === steps.length - 1 }]"
               :style="{ gridColumn: index * 2 + 1 }"
            >
               {{ theStep.label }}
               <small v-if="theStep.note">{{ theStep.note }}</small>
            </span>
         </template>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EzTooltip from './EzTooltip.vue'
import { stepsOf, type FolderTypeLifecycle } from '../mocks'

const props = defineProps<{
   lifecycle: FolderTypeLifecycle
}>()

const steps = computed(() => stepsOf(props.lifecycle))

/** A narrow column per dot, and between two dots a stretch that takes the room left, never less than its text. */
const columns = computed(() => steps.value.map((step, index) => (index ? 'minmax(max-content, 1fr) var(--line-dot)' : 'var(--line-dot)')).join(' '))
</script>

<style scoped>
.line {
   --line-dot: 0.875rem;

   /* A little less at the bottom: the names of the steps carry more leading than the durations on top */
   padding: var(--space-inset-lg) var(--space-inset-md) var(--space-inset-md);
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
   overflow-x: auto;
}

.line__grid {
   display: grid;
   align-items: center;
   row-gap: var(--space-gap-sm);
   min-width: 44rem;
}

/* A stretch: what it lasts, above an unbroken line that meets the dots at their middle */
.line__stretch {
   display: flex;
   grid-row: 1;
   flex-direction: column;
   align-self: end;
   gap: var(--space-gap-sm);
   padding-bottom: calc(var(--line-dot) / 2 - 1px);
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   line-height: var(--text-xs--line-height);
   text-align: center;
   white-space: nowrap;
}

.line__duration {
   padding: 0 var(--space-gap-sm);
}

.line__rule {
   border-top: 2px solid var(--color-foreground);
}

/* Only if nobody signed */
.line__stretch--unsigned .line__rule {
   border-top: 2px dashed var(--color-foreground-muted);
}

/* The folder is closed and kept */
.line__stretch--retention .line__rule {
   border-top-color: var(--color-border-strong);
}

.line__stretch--elimination .line__rule {
   border-top-color: var(--color-negative);
}

/* A step: its dot, explained by a tooltip */
.line__step {
   grid-row: 1;
   align-self: end;
}

.line__dot {
   width: var(--line-dot);
   height: var(--line-dot);
   border: 2px solid var(--color-foreground);
   border-radius: var(--radius-full);
   background: var(--color-foreground);
}

/* A reminder is a step of the signature, not an end: a hollow dot */
.line__dot--first-reminder {
   background: var(--color-surface);
}

.line__dot--archive {
   border-color: var(--color-border-strong);
   background: var(--color-border-strong);
}

.line__dot--elimination {
   border-color: var(--color-negative);
   background: var(--color-negative);
}

/* A label is centered under its dot and wider than the dot's column; the first and the last open toward the inside */
.line__label {
   display: flex;
   grid-row: 2;
   flex-direction: column;
   align-items: center;
   align-self: start;
   justify-self: center;
   width: max-content;
   font-size: var(--text-sm);
   line-height: var(--text-sm--line-height);
   white-space: nowrap;

   small {
      color: var(--color-foreground-muted);
      font-size: var(--text-xs);
      font-weight: 400;
   }
}

.line__label--first {
   align-items: flex-start;
   justify-self: start;
}

.line__label--last {
   align-items: flex-end;
   justify-self: end;
}

.line__label--closed {
   font-weight: 600;
}

.line__label--elimination {
   color: var(--color-foreground-negative);
}
</style>
