<template>
   <ol class="timeline">
      <li v-for="theDay in days" :key="theDay.label" class="timeline__day">
         <h3 class="timeline__date">{{ theDay.label }}</h3>
         <ol class="timeline__events">
            <li v-for="theEvent in theDay.events" :key="theEvent.id" class="timeline__event" :class="`timeline__event--${tone(theEvent.kind)}`">
               <span class="timeline__dot">
                  <ez-icon :name="icon(theEvent.kind)" :size="14" />
               </span>
               <div class="timeline__body">
                  <span class="timeline__text">{{ text(theEvent) }}</span>
                  <span class="timeline__time">{{ time(theEvent.at) }}</span>
               </div>
            </li>
         </ol>
      </li>
   </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, gettext } from '@ez'
import type { FolderEvent, FolderEventKind } from '../mocks'

const props = defineProps<{
   events: FolderEvent[]
}>()

type Tone = 'neutral' | 'info' | 'positive' | 'warning' | 'negative'

const KINDS: Record<FolderEventKind, { tone: Tone, icon: 'file' | 'send' | 'eye' | 'mail' | 'signature' | 'close' | 'check', text: string }> = {
   created: { tone: 'neutral', icon: 'file', text: gettext('Dossier créé') },
   sent: { tone: 'info', icon: 'send', text: gettext('Dossier envoyé aux signataires') },
   viewed: { tone: 'neutral', icon: 'eye', text: gettext('%{name} a consulté le dossier') },
   reminded: { tone: 'warning', icon: 'mail', text: gettext('Rappel envoyé à %{name}') },
   signed: { tone: 'positive', icon: 'signature', text: gettext('%{name} a signé') },
   refused: { tone: 'negative', icon: 'close', text: gettext('%{name} a refusé de signer') },
   completed: { tone: 'positive', icon: 'check', text: gettext('Dossier complété') },
}

const tone = (kind: FolderEventKind) => KINDS[kind].tone
const icon = (kind: FolderEventKind) => KINDS[kind].icon
const text = (event: FolderEvent) => gettext(KINDS[event.kind].text, { name: event.signer?.fullName ?? '' })
const time = (date: Date) => `${date.getHours()} h ${String(date.getMinutes()).padStart(2, '0')}`

/** Newest day first, and inside a day the newest event first. */
const days = computed(() => {
   const groups = new Map<string, FolderEvent[]>()
   for (const event of [...props.events].sort((a, b) => b.at.getTime() - a.at.getTime() || b.id - a.id)) {
      const label = formatDate(event.at)
      groups.set(label, [...(groups.get(label) ?? []), event])
   }
   return [...groups].map(([label, events]) => ({ label, events }))
})
</script>

<style scoped>
.timeline,
.timeline__events {
   margin: 0;
   padding: 0;
   list-style: none;
}

.timeline {
   display: flex;
   flex-direction: column;
   gap: var(--space-gap-lg);
}

.timeline__date {
   margin: 0 0 var(--space-gap-sm);
   font-size: var(--text-xs);
   font-weight: 600;
   color: var(--color-foreground-subtle);
   text-transform: uppercase;
}

.timeline__event {
   --timeline-dot: var(--size-control-sm);

   position: relative;
   display: flex;
   gap: var(--space-gap-md);
   padding-bottom: var(--space-gap-md);

   /* The line that links an event to the next one */
   &:not(:last-child)::before {
      content: '';
      position: absolute;
      top: var(--timeline-dot);
      bottom: 0;
      left: calc(var(--timeline-dot) / 2);
      border-left: 1px solid var(--color-border);
   }

   &:last-child {
      padding-bottom: 0;
   }
}

.timeline__dot {
   flex: none;
   display: grid;
   place-items: center;
   width: var(--timeline-dot);
   height: var(--timeline-dot);
   border-radius: var(--radius-full);
   background: var(--color-surface-muted);
   color: var(--color-foreground-muted);
}

.timeline__event--info .timeline__dot {
   background: var(--color-surface-info);
   color: var(--color-foreground-info);
}

.timeline__event--positive .timeline__dot {
   background: var(--color-surface-positive);
   color: var(--color-foreground-positive);
}

.timeline__event--warning .timeline__dot {
   background: var(--color-surface-warning);
   color: var(--color-foreground-warning);
}

.timeline__event--negative .timeline__dot {
   background: var(--color-surface-negative);
   color: var(--color-foreground-negative);
}

.timeline__body {
   flex: 1;
   display: flex;
   flex-wrap: wrap;
   align-items: baseline;
   justify-content: space-between;
   gap: 0 var(--space-gap-md);
   min-height: var(--timeline-dot);
   align-content: center;
}

.timeline__time {
   font-size: var(--text-sm);
   color: var(--color-foreground-subtle);
}
</style>
