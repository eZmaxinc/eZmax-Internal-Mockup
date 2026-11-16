<template>
   <!--
      The single line with a mark under every step: J+60 is counted from the sending, F+180 from the closing.
      A bracket on top says which count each part of the line belongs to, and an arc shows the shortcut:
      once everything is signed, the folder closes without waiting for the deadline.
   -->
   <div class="line">
      <div class="line__grid" :style="{ gridTemplateColumns: columns }">
         <span class="line__scope line__scope--sent" :style="{ gridColumn: `1 / ${closedIndex * 2 + 1}` }">{{ scopes.sent }}</span>
         <span class="line__scope" :style="{ gridColumn: `${closedIndex * 2 + 1} / -1` }">{{ scopes.closed }}</span>

         <span class="line__signed" :style="{ gridColumn: `${deadlineIndex * 2 + 1} / ${closedIndex * 2 + 2}` }">
            <span>{{ $gettext('Tout est signé') }}</span>
         </span>

         <template v-for="(theStep, index) in steps" :key="theStep.key">
            <span
               v-if="theStep.lead"
               class="line__stretch"
               :class="[`line__stretch--${theStep.lead.kind}`, { 'line__stretch--before-deadline': index === deadlineIndex }]"
               :style="{ gridColumn: index * 2 }"
            >
               <span class="line__rule" />
               <span v-if="theStep.lead.text">{{ theStep.lead.text }}</span>
               <span class="line__rule" />
            </span>
            <ez-tooltip class="line__step" :title="theStep.tooltip.title" :text="theStep.tooltip.text" :style="{ gridColumn: index * 2 + 1 }">
               <span class="line__dot" :class="`line__dot--${theStep.key}`" />
            </ez-tooltip>
            <span class="line__label" :class="`line__label--${theStep.key}`" :style="{ gridColumn: index * 2 + 1 }">
               <strong>{{ theStep.code }}</strong>
               {{ theStep.longLabel }}
               <small v-if="theStep.note">{{ theStep.note }}</small>
            </span>
         </template>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EzTooltip from './EzTooltip.vue'
import { gettext } from '@ez'
import { stepsOf, type FolderTypeLifecycle } from '../mocks'

const props = defineProps<{
   lifecycle: FolderTypeLifecycle
}>()

// The early completion is a step of its own here: it has its own day (J+64)
const steps = computed(() => stepsOf(props.lifecycle, true))
const deadlineIndex = computed(() => steps.value.findIndex((step) => step.key === 'deadline'))
const closedIndex = computed(() => steps.value.findIndex((step) => step.key === 'closed'))

const scopes = { sent: gettext('Compté depuis l\'envoi (J)'), closed: gettext('Compté depuis la fermeture (F)') }

/** A narrow column per dot, and between two dots a stretch that takes the room left, never less than its text. */
const columns = computed(() => steps.value.map((step, index) => (index ? 'minmax(max-content, 1fr) var(--line-dot)' : 'var(--line-dot)')).join(' '))
</script>

<style scoped>
.line {
   --line-dot: 0.875rem;
   /* The height of the row of the line: the arc comes down to its middle */
   --line-row: 1.25rem;
   --line-label: 5.75rem;

   border: 1px solid var(--color-border-muted);
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
   overflow-x: auto;
}

/* Four rows: the counts, the arc, the line, the steps. The side padding holds half a label, centered under the end dots */
.line__grid {
   display: grid;
   align-items: center;
   min-width: 46rem;
   padding: var(--space-inset-md) calc(var(--line-label) / 2 + var(--space-gap-sm)) var(--space-inset-lg);
}

/* Which count this part of the line belongs to: a caption over a bracket */
.line__scope {
   grid-row: 1;
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   font-weight: 500;
   letter-spacing: 0.08em;
   line-height: var(--text-xs--line-height);
   text-transform: uppercase;
   white-space: nowrap;

   &::after {
      content: '';
      display: block;
      height: 6px;
      margin-top: 4px;
      border: 1px solid var(--color-border-strong);
      border-bottom: none;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
   }
}

.line__scope--sent {
   margin-right: var(--space-gap-md);
}

/* The shortcut: leaves the line just before the deadline, lands on the closing */
.line__signed {
   position: relative;
   grid-row: 2;
   align-self: end;
   height: calc(2.25rem + var(--line-row) / 2);
   margin: var(--space-inset-md) calc(var(--line-dot) / 2 - 1px) calc(var(--line-row) / -2) -1.5rem;
   border: 2px solid var(--color-foreground-muted);
   border-bottom: none;
   border-radius: var(--radius-md) var(--radius-md) 0 0;

   span {
      position: absolute;
      top: 0;
      left: 50%;
      padding: 0 var(--space-gap-sm);
      background: var(--color-surface-muted);
      font-size: var(--text-sm);
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      transform: translate(-50%, -50%);
   }
}

/* A stretch: line, what it lasts, line */
.line__stretch {
   display: flex;
   grid-row: 3;
   align-items: center;
   gap: var(--space-gap-sm);
   height: var(--line-row);
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   white-space: nowrap;
}

.line__rule {
   flex: 1;
   min-width: 0.75rem;
   border-top: 2px solid var(--color-foreground);
}

/* Room for the arc to land on the line, after the text */
.line__stretch--before-deadline .line__rule:last-child {
   min-width: 2.25rem;
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
   position: relative;
   grid-row: 3;
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

/* Happens only if nobody signed: a dashed, hollow dot */
.line__dot--early-completion {
   border: 2px dashed var(--color-foreground-muted);
   background: var(--color-surface-muted);
}

.line__dot--archive {
   border-color: var(--color-border-strong);
   background: var(--color-border-strong);
}

.line__dot--elimination {
   border-color: var(--color-negative);
   background: var(--color-negative);
}

/* A label is centered under its dot and wider than the dot's column; its width is fixed so two neighbours never touch */
.line__label {
   display: flex;
   grid-row: 4;
   flex-direction: column;
   align-items: center;
   align-self: start;
   justify-self: center;
   width: var(--line-label);
   margin-top: var(--space-gap-md);
   font-size: var(--text-xs);
   line-height: var(--text-xs--line-height);
   text-align: center;

   strong {
      font-size: var(--text-sm);
      font-weight: 600;
      line-height: var(--text-sm--line-height);
   }

   small {
      color: var(--color-foreground-muted);
      font-size: var(--text-xs);
   }
}

.line__label--elimination strong {
   color: var(--color-foreground-negative);
}
</style>
