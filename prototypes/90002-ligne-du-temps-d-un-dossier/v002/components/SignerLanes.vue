<template>
   <ul class="lanes">
      <li v-for="theLane in lanes" :key="theLane.signer.id" class="lanes__lane">
         <div class="lanes__who">
            <span class="lanes__name">{{ theLane.signer.fullName }}</span>
            <ez-badge-signer-state :signer="theLane.signer" dot />
         </div>
         <ol class="lanes__steps">
            <li v-for="theStep in theLane.steps" :key="theStep.label" class="lanes__step" :class="{ 'lanes__step--done': theStep.at, 'lanes__step--refused': theStep.refused }">
               <span class="lanes__mark" />
               <span class="lanes__label">{{ theStep.label }}</span>
               <span class="lanes__when">{{ theStep.at ? formatDate(theStep.at) : '—' }}</span>
            </li>
         </ol>
      </li>
   </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, gettext } from '@ez'
import type { EzsignSigner } from '@mocks'
import type { FolderEvent, FolderEventKind } from '../mocks'

const props = defineProps<{
   signers: EzsignSigner[]
   events: FolderEvent[]
}>()

/** One lane per signer: sent → viewed → signed (or refused), each with the date it happened. */
const lanes = computed(() => props.signers.map((signer) => {
   const when = (kind: FolderEventKind) => props.events.find((event) => event.kind === kind && (!event.signer || event.signer.id === signer.id))?.at ?? null
   const refusedAt = when('refused')
   const endAt = refusedAt ?? when('signed')
   return {
      signer,
      steps: [
         { label: gettext('Envoyé'), at: when('sent'), refused: false },
         // A signature without a recorded visit still means the folder was opened
         { label: gettext('Consulté'), at: when('viewed') ?? endAt, refused: false },
         { label: refusedAt ? gettext('Refusé') : gettext('Signé'), at: endAt, refused: Boolean(refusedAt) },
      ],
   }
}))
</script>

<style scoped>
.lanes,
.lanes__steps {
   margin: 0;
   padding: 0;
   list-style: none;
}

.lanes__lane {
   display: grid;
   grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
   align-items: center;
   gap: var(--space-gap-md);
   padding: var(--space-inset-md) 0;

   & + & {
      border-top: 1px solid var(--color-border-muted);
   }

   &:first-child {
      padding-top: 0;
   }

   &:last-child {
      padding-bottom: 0;
   }
}

.lanes__who {
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   gap: var(--space-gap-sm);
   min-width: 0;
}

.lanes__name {
   font-weight: 600;
}

.lanes__steps {
   display: grid;
   grid-template-columns: repeat(3, minmax(0, 1fr));
}

.lanes__step {
   --lanes-mark: var(--space-inset-md);

   position: relative;
   display: flex;
   flex-direction: column;
   gap: var(--space-gap-sm);
   color: var(--color-foreground-subtle);

   /* The segment that links a step to the next one */
   &:not(:last-child)::before {
      content: '';
      position: absolute;
      top: calc(var(--lanes-mark) / 2);
      left: var(--lanes-mark);
      right: 0;
      border-top: 1px solid var(--color-border);
   }
}

.lanes__mark {
   width: var(--lanes-mark);
   height: var(--lanes-mark);
   border: 1px solid var(--color-border-strong);
   border-radius: var(--radius-full);
   background: var(--color-surface);
}

.lanes__label {
   font-size: var(--text-sm);
   font-weight: 600;
}

.lanes__when {
   font-size: var(--text-xs);
}

.lanes__step--done {
   color: var(--color-foreground);

   .lanes__mark {
      border-color: var(--color-positive);
      background: var(--color-positive);
   }

   .lanes__when {
      color: var(--color-foreground-muted);
   }
}

.lanes__step--refused .lanes__mark {
   border-color: var(--color-negative);
   background: var(--color-negative);
}

/* Narrow: the steps go under the name */
@media (max-width: 599px) {
   .lanes__lane {
      grid-template-columns: minmax(0, 1fr);
   }
}
</style>
