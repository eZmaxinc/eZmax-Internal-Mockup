<template>
   <!--
      A vertical frieze, one row per event. The signature is dated from the sending (J0, J60); the retention
      is counted from the closing of the folder (F, F+180).
      Every reminder is a small hollow dot; the long runs (the daily reminders, the archiving) are folded
      into one dashed stretch that says what it holds.
   -->
   <ol class="rail">
      <li
         v-for="(theRow, index) in rows"
         :key="index"
         class="rail__row"
         :class="[`rail__row--${theRow.kind}`, `rail__row--in-${index ? rows[index - 1].line : 'none'}`, `rail__row--out-${theRow.line}`, theRow.tone ? `rail__row--${theRow.tone}` : '']"
      >
         <span class="rail__code">{{ theRow.code }}</span>
         <span class="rail__track">
            <ez-tooltip v-if="theRow.kind !== 'gap'" class="rail__step" :title="theRow.code ? `${theRow.code} · ${theRow.label}` : theRow.label" :text="theRow.tooltip">
               <span class="rail__dot" />
            </ez-tooltip>
         </span>
         <span class="rail__text">
            <strong v-if="theRow.kind === 'major'">{{ theRow.label }}</strong>
            <template v-else>{{ theRow.label }}</template>
            <small v-if="theRow.note">{{ theRow.note }}</small>
         </span>
      </li>
   </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { gettext } from '@ez'
import EzTooltip from './EzTooltip.vue'
import { reminderDaysOf, rhythmOf, type FolderTypeLifecycle } from '../mocks'

const props = defineProps<{
   lifecycle: FolderTypeLifecycle
}>()

/** The line that leaves a row toward the next one */
type Line = 'solid' | 'dashed' | 'quiet' | 'negative' | 'none'

interface Row {
   /** major: a step of the lifecycle; minor: a reminder; gap: a folded run, no dot */
   kind: 'major' | 'minor' | 'gap'
   code: string
   label: string
   /** What the event is, said when the pointer or the keyboard is on its dot */
   tooltip: string
   note: string
   tone: '' | 'closed' | 'archive' | 'negative'
   line: Line
}

const days = (count: number) => gettext(count > 1 ? '%{count} jours' : '%{count} jour', { count })

function row(kind: Row['kind'], day: number | string | null, label: string, tooltip: string, note = '', line: Line = 'solid', tone: Row['tone'] = ''): Row {
   return { kind, code: typeof day === 'number' ? `J${day}` : day ?? '', label, tooltip, note, tone, line }
}

/**
 * Two counts, one under the other: the signature is counted from the sending (J0 to the deadline), the retention
 * from the closing of the folder. The closing has no day of its own: it happens as soon as everything is signed,
 * or at the automatic early completion, after the deadline.
 */
const rows = computed(() => {
   const { signatureDays, reminders, earlyCompletionDays, archiveDays, eliminationDays } = props.lifecycle
   const list: Row[] = [row('major', 0, gettext('Envoi du dossier'), gettext('Le dossier est envoyé aux signataires. Le compte des jours commence ici.'))]

   // The reminders shown one by one: the first two, then the last one; the others are folded
   const reminderDays = reminderDaysOf(props.lifecycle)
   const lastReminder = reminderDays[reminderDays.length - 1]
   const folded = reminderDays.length - 3
   const shown = folded > 0 ? [reminderDays[0], reminderDays[1], lastReminder] : reminderDays
   for (const day of shown) {
      if (folded > 0 && day === lastReminder) {
         list[list.length - 1].line = 'dashed'
         list.push(row('gap', null, gettext('··· %{count} autres rappels, %{rhythm}', { count: folded, rhythm: rhythmOf(props.lifecycle) }), '', '', 'dashed'))
      }
      if (day === reminderDays[0]) list.push(row('minor', day, gettext('Premier rappel'), gettext('Envoyé %{delay} après l’envoi, puis un rappel %{rhythm} tant que le dossier n’est pas signé.', { delay: days(reminders?.firstAfterDays ?? 0), rhythm: rhythmOf(props.lifecycle) })))
      else if (day === lastReminder) list.push(row('minor', day, gettext('Dernier rappel'), gettext('Le dernier rappel avant la date limite de signature.')))
      else list.push(row('minor', day, gettext('Rappel'), gettext('Rappel envoyé aux signataires qui n’ont pas encore signé.')))
   }

   list.push(row('major', signatureDays, gettext('Date limite de signature'), gettext('Valeur par défaut à la création; elle peut être modifiée ensuite sur le dossier.'), days(signatureDays), 'dashed'))

   // After the deadline, only a folder nobody signed is still open: the early completion closes it
   const early = earlyCompletionDays === null ? null : { delay: days(earlyCompletionDays), day: signatureDays + earlyCompletionDays }
   list.push(row('gap', null, early ? gettext('Si non signé: achèvement prématuré %{delay} plus tard (J%{day})', early) : '', '', '', 'dashed'))
   const closing = gettext('Le dossier se ferme dès que tout est signé, n’importe quand avant la date limite.')
   const otherwise = early ? gettext('Sinon, l’achèvement prématuré le ferme %{delay} après la date limite (J%{day}).', early) : gettext('Sinon, l’achèvement prématuré se fait à la main.')
   list.push(row('major', 'F', gettext('Fermeture du dossier'), `${closing} ${otherwise}`, '', 'quiet', 'closed'))

   // From here the days are counted from the closing: F, F+180
   list.push(row('gap', null, gettext('%{duration} après la fermeture', { duration: days(archiveDays) }), '', '', 'quiet'))
   list.push(row('major', `F+${archiveDays}`, gettext('Archivage'), gettext('Le dossier est archivé %{duration} après sa fermeture.', { duration: days(archiveDays) }), '', eliminationDays === null ? 'none' : 'negative', 'archive'))
   if (eliminationDays !== null) {
      list.push(row('gap', null, gettext('%{duration} après l’archivage', { duration: days(eliminationDays) }), '', '', 'negative'))
      list.push(row('major', `F+${archiveDays + eliminationDays}`, gettext('Élimination automatique'), gettext('Les données sont éliminées %{duration} après l’archivage.', { duration: days(eliminationDays) }), '', 'none', 'negative'))
   }
   return list
})
</script>

<style scoped>
.rail {
   --rail-dot: 1rem;

   margin: 0;
   padding: 0;
   list-style: none;
}

/* A row: the day, the track with its dot, the event */
.rail__row {
   display: grid;
   grid-template-columns: 2.5rem var(--rail-dot) 1fr;
   align-items: center;
   column-gap: var(--space-gap-sm);
   min-height: 2.25rem;
}

/* A folded run takes more room than an event: time passes */
.rail__row--gap {
   min-height: 4.5rem;
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
}

.rail__code {
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   font-weight: 500;
   text-align: right;
}

/* The track draws the line in two halves: the one that arrives from the row above, the one that leaves */
.rail__track {
   position: relative;
   display: flex;
   align-items: center;
   align-self: stretch;
   justify-content: center;

   &::before,
   &::after {
      content: '';
      position: absolute;
      left: 50%;
      height: 50%;
      transform: translateX(-50%);
   }

   &::before {
      top: 0;
      border-left: var(--rail-in, none);
   }

   &::after {
      bottom: 0;
      border-left: var(--rail-out, none);
   }
}

.rail__row--in-solid { --rail-in: 2px solid var(--color-foreground); }
.rail__row--in-dashed { --rail-in: 1px dashed var(--color-foreground); }
.rail__row--in-quiet { --rail-in: 1px dashed var(--color-border-strong); }
.rail__row--in-negative { --rail-in: 2px solid var(--color-negative); }
.rail__row--out-solid { --rail-out: 2px solid var(--color-foreground); }
.rail__row--out-dashed { --rail-out: 1px dashed var(--color-foreground); }
.rail__row--out-quiet { --rail-out: 1px dashed var(--color-border-strong); }
.rail__row--out-negative { --rail-out: 2px solid var(--color-negative); }

/* The dot of an event, explained by a tooltip; drawn over the line */
.rail__step {
   position: relative;
   z-index: 1;
}

.rail__dot {
   width: var(--rail-dot);
   height: var(--rail-dot);
   border: 2px solid var(--color-foreground);
   border-radius: var(--radius-full);
   background: var(--color-foreground);
}

/* A reminder: smaller and hollow */
.rail__row--minor .rail__dot {
   width: 0.75rem;
   height: 0.75rem;
   background: var(--color-surface);
}

.rail__row--archive .rail__dot {
   border-color: var(--color-border-strong);
   background: var(--color-border-strong);
}

.rail__row--negative .rail__dot {
   border-color: var(--color-negative);
   background: var(--color-negative);
}

.rail__text {
   font-size: var(--text-sm);
   line-height: var(--text-sm--line-height);

   strong {
      font-size: var(--text-sm);
      font-weight: 600;
   }

   small {
      margin-left: var(--space-gap-sm);
      color: var(--color-foreground-muted);
      font-size: var(--text-xs);
   }
}

.rail__row--gap .rail__text {
   font-size: var(--text-xs);
}

.rail__row--negative .rail__text strong {
   color: var(--color-foreground-negative);
}
</style>
