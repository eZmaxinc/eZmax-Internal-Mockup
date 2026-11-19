<template>
   <!--
      The single line, on two zones: what is counted from the sending, and what is counted from the closing.
      The closing sits between the two, on the page itself: it ends one zone and starts the other.
   -->
   <div class="line">
      <div class="line__grid" :style="{ gridTemplateColumns: columns }">
         <!-- The zones are drawn behind the line: from the first step to the stretch before the closing, then from the stretch after it -->
         <span class="line__zone line__zone--signature" :style="{ gridColumn: `1 / ${closedIndex * 2 + 1}` }">{{ $gettext('Envoi et signature') }}</span>
         <span class="line__zone line__zone--retention" :style="{ gridColumn: `${closedIndex * 2 + 2} / -1` }">{{ $gettext('Conservation') }}</span>

         <template v-for="(theStep, index) in steps" :key="theStep.key">
            <span
               v-if="theStep.lead"
               class="line__stretch"
               :class="[`line__stretch--${theStep.lead.kind}`, { 'line__stretch--before-closed': index === closedIndex, 'line__stretch--after-closed': index === closedIndex + 1 }]"
               :style="{ gridColumn: index * 2 }"
            >
               <span class="line__rule" />
               <span v-if="theStep.lead.text">{{ theStep.lead.text }}</span>
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
const closedIndex = computed(() => steps.value.findIndex((step) => step.key === 'closed'))

/** A narrow column per dot, and between two dots a stretch that takes the room left, never less than its text. */
const columns = computed(() => steps.value.map((step, index) => (index ? 'minmax(max-content, 1fr) var(--line-dot)' : 'var(--line-dot)')).join(' '))
</script>

<style scoped>
.line {
   --line-dot: 0.875rem;
   /* How far from the closing a zone stops */
   --line-zone-gap: 4.5rem;

   overflow-x: auto;
}

/* Three rows: the titles of the zones, the line, the names of the steps */
.line__grid {
   display: grid;
   grid-template-rows: 1.5rem auto auto;
   align-items: center;
   row-gap: var(--space-gap-sm);
   min-width: 48rem;
   padding: var(--space-inset-md);
}

/* A zone: a tinted box behind the three rows, wider than its columns by the padding of the grid */
.line__zone {
   grid-row: 1 / -1;
   align-self: stretch;
   margin: calc(var(--space-inset-md) * -1);
   padding: var(--space-inset-md);
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   font-weight: 500;
   letter-spacing: 0.08em;
   line-height: 1.5rem;
   text-transform: uppercase;
   white-space: nowrap;
}

.line__zone--signature {
   margin-right: var(--line-zone-gap);
}

.line__zone--retention {
   margin-left: var(--line-zone-gap);
}

/* Everything else is drawn over the zones */
.line__stretch,
.line__step,
.line__label {
   position: relative;
}

/* Around the closing, the line crosses the gap between the zones: its text stays inside its zone */
.line__stretch--before-closed .line__rule:first-child,
.line__stretch--after-closed .line__rule:last-child {
   flex: 1;
}

.line__stretch--before-closed .line__rule:last-child,
.line__stretch--after-closed .line__rule:first-child {
   flex: 0 0 calc(var(--line-zone-gap) + var(--space-gap-sm));
}

/* A stretch: line, what it lasts, line */
.line__stretch {
   display: flex;
   grid-row: 2;
   align-items: center;
   gap: var(--space-gap-sm);
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   line-height: var(--text-xs--line-height);
   white-space: nowrap;
}

.line__rule {
   flex: 1;
   min-width: 0.75rem;
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
   grid-row: 2;
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
   grid-row: 3;
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
