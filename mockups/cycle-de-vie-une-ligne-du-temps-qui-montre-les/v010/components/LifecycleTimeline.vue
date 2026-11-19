<template>
   <!--
      A vertical frieze, one row per event. The signature is dated from the sending (J0, J60); the retention
      is counted from the closing of the folder (F, F+180).
      Every reminder is a small hollow dot, and so is the early completion: a condition, explained
      in the same bubble as a reminder. The daily reminders fold into one quiet dash.
   -->
   <ol class="rail">
      <li
         v-for="(theRow, index) in rows"
         :key="index"
         class="rail__row"
         :class="[`rail__row--${theRow.kind}`, `rail__row--in-${index ? rows[index - 1].line : 'none'}`, `rail__row--out-${theRow.line}`, theRow.tone ? `rail__row--${theRow.tone}` : '']"
         :style="theRow.span ? { '--rail-span': theRow.span } : undefined"
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
import { gettext } from "@ez";
import { computed } from "vue";
import { type FolderTypeLifecycle, reminderDaysOf, rhythmOf } from "../mocks";
import EzTooltip from "./EzTooltip.vue";

const props = defineProps<{
	lifecycle: FolderTypeLifecycle;
}>();

/** The line that leaves a row toward the next one */
type Line = "solid" | "dashed" | "quiet" | "negative" | "none";

interface Row {
	/** major: a step of the lifecycle; minor: a reminder; gap: a folded run, no dot */
	kind: "major" | "minor" | "gap";
	code: string;
	label: string;
	/** What the event is, said when the pointer or the keyboard is on its dot */
	tooltip: string;
	note: string;
	tone: "" | "closed" | "archive" | "negative";
	line: Line;
	/** Min height of a gap, when a long wait should not look like the next step */
	span?: string;
}

const days = (count: number) =>
	gettext(count > 1 ? "%{count} jours" : "%{count} jour", { count });

/** Shared height of the long quiet dashes. A long wait still reads, without filling the card. */
function longSpan(daysCount: number): string {
	const rem = 1.5 + Math.sqrt(daysCount) / 2.6;
	return `${rem.toFixed(2)}rem`;
}

function row(
	kind: Row["kind"],
	day: number | string | null,
	label: string,
	tooltip: string,
	note = "",
	line: Line = "solid",
	tone: Row["tone"] = "",
): Row {
	return {
		kind,
		code: typeof day === "number" ? `J${day}` : (day ?? ""),
		label,
		tooltip,
		note,
		tone,
		line,
	};
}

/**
 * Two counts, one under the other: the signature is counted from the sending (J0 to the deadline), the retention
 * from the closing of the folder. The closing has no day of its own: it happens as soon as everything is signed,
 * or at the automatic early completion, after the deadline.
 */
const rows = computed(() => {
	const {
		signatureDays,
		reminders,
		earlyCompletionDays,
		archiveDays,
		eliminationDays,
	} = props.lifecycle;
	const list: Row[] = [
		row(
			"major",
			0,
			gettext("Envoi du dossier"),
			gettext(
				"Le dossier est envoyé aux signataires. Le compte des jours commence ici.",
			),
		),
	];

	// The reminders shown one by one: the first two, then the last one; the others are folded
	const reminderDays = reminderDaysOf(props.lifecycle);
	const lastReminder = reminderDays[reminderDays.length - 1];
	const folded = reminderDays.length - 3;
	const shown =
		folded > 0
			? [reminderDays[0], reminderDays[1], lastReminder]
			: reminderDays;
	const span = longSpan(archiveDays);
	for (const day of shown) {
		if (folded > 0 && day === lastReminder) {
			list[list.length - 1].line = "quiet";
			const fold = row(
				"gap",
				null,
				gettext("...%{count} autres rappels, %{rhythm}", {
					count: folded,
					rhythm: rhythmOf(props.lifecycle),
				}),
				"",
				"",
				"quiet",
			);
			fold.span = span;
			list.push(fold);
		}
		if (day === reminderDays[0])
			list.push(
				row(
					"minor",
					day,
					gettext("Premier rappel"),
					gettext(
						"Envoyé %{delay} après l’envoi, puis un rappel %{rhythm} tant que le dossier n’est pas signé.",
						{
							delay: days(reminders?.firstAfterDays ?? 0),
							rhythm: rhythmOf(props.lifecycle),
						},
					),
				),
			);
		else if (day === lastReminder)
			list.push(
				row(
					"minor",
					day,
					gettext("Dernier rappel"),
					gettext("Le dernier rappel avant la date limite de signature."),
				),
			);
		else
			list.push(
				row(
					"minor",
					day,
					gettext("Rappel"),
					gettext("Rappel envoyé aux signataires qui n’ont pas encore signé."),
				),
			);
	}

	list.push(
		row(
			"major",
			signatureDays,
			gettext("Date limite de signature"),
			gettext(
				"Valeur par défaut à la création; elle peut être modifiée ensuite sur le dossier.",
			),
			days(signatureDays),
			"quiet",
		),
	);

	// Only a folder nobody signed reaches this: a hollow dot, like a reminder, with the condition in the bubble.
	const early =
		earlyCompletionDays === null
			? null
			: {
					delay: days(earlyCompletionDays),
					day: signatureDays + earlyCompletionDays,
				};
	if (early) {
		list.push(
			row(
				"minor",
				early.day,
				gettext("Achèvement prématuré"),
				gettext(
					"Si le dossier n’est pas signé, il est fermé automatiquement %{delay} après la date limite.",
					early,
				),
				gettext("si non signé"),
				"quiet",
			),
		);
	}
	const closing = gettext(
		"Le dossier se ferme dès que tout est signé, n’importe quand avant la date limite.",
	);
	const otherwise = early
		? gettext(
				"Sinon, l’achèvement prématuré le ferme %{delay} après la date limite (J%{day}).",
				early,
			)
		: gettext("Sinon, l’achèvement prématuré se fait à la main.");
	list.push(
		row(
			"major",
			"F",
			gettext("Fermeture du dossier"),
			`${closing} ${otherwise}`,
			"",
			"quiet",
			"closed",
		),
	);

	// The quiet dash grows with the retention. The duration is written on it; the tooltip of Archivage repeats it.
	const wait = row(
		"gap",
		null,
		gettext("...%{duration} après la fermeture", {
			duration: days(archiveDays),
		}),
		"",
		"",
		"quiet",
	);
	wait.span = span;
	list.push(wait);
	list.push(
		row(
			"major",
			`F+${archiveDays}`,
			gettext("Archivage"),
			gettext("Le dossier est archivé %{duration} après sa fermeture.", {
				duration: days(archiveDays),
			}),
			"",
			eliminationDays === null ? "none" : "negative",
			"archive",
		),
	);
	if (eliminationDays !== null) {
		list.push(
			row(
				"gap",
				null,
				gettext("...%{duration} après l’archivage", {
					duration: days(eliminationDays),
				}),
				"",
				"",
				"negative",
			),
		);
		list.push(
			row(
				"major",
				`F+${archiveDays + eliminationDays}`,
				gettext("Élimination automatique"),
				gettext("Les données sont éliminées %{duration} après l’archivage.", {
					duration: days(eliminationDays),
				}),
				"",
				"none",
				"negative",
			),
		);
	}
	return list;
});
</script>

<style scoped>
.rail {
   --rail-dot: 1rem;

   margin: 0;
   padding: var(--space-inset-md) var(--space-inset-md) var(--space-inset-md) var(--space-inset-sm);
   border: 1px solid var(--color-border-muted);
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
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

/* A folded run takes more room than an event: time passes. A long retention sets --rail-span. */
.rail__row--gap {
   min-height: var(--rail-span, 4.5rem);
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
}

.rail__code {
   color: var(--color-foreground-muted);
   font-family: var(--font-mono);
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
.rail__row--in-dashed { --rail-in: 2px dashed var(--color-foreground); }
.rail__row--in-quiet { --rail-in: 2px dashed var(--color-accent); }
.rail__row--in-negative { --rail-in: 2px solid var(--color-negative); }
.rail__row--out-solid { --rail-out: 2px solid var(--color-foreground); }
.rail__row--out-dashed { --rail-out: 2px dashed var(--color-foreground); }
.rail__row--out-quiet { --rail-out: 2px dashed var(--color-accent); }
.rail__row--out-negative { --rail-out: 2px solid var(--color-negative); }

/* A border dash stretches on a long run. Same 2 px stroke as the solid lines; a 2 px mark and a 3 px gap. */
.rail__row--in-dashed.rail__row--out-dashed .rail__track,
.rail__row--in-quiet.rail__row--out-quiet .rail__track {
   background-repeat: no-repeat;
   background-position: center top;
   background-size: 2px 100%;
}

.rail__row--in-dashed.rail__row--out-dashed .rail__track {
   background-image: repeating-linear-gradient(to bottom, var(--color-foreground) 0 2px, transparent 2px 5px);
}

.rail__row--in-quiet.rail__row--out-quiet .rail__track {
   background-image: repeating-linear-gradient(to bottom, var(--color-accent) 0 2px, transparent 2px 5px);
}

.rail__row--in-dashed.rail__row--out-dashed .rail__track::before,
.rail__row--in-dashed.rail__row--out-dashed .rail__track::after,
.rail__row--in-quiet.rail__row--out-quiet .rail__track::before,
.rail__row--in-quiet.rail__row--out-quiet .rail__track::after {
   border-left-style: none;
}

.rail__row--in-dashed:not(.rail__row--out-dashed) .rail__track::before,
.rail__row--out-dashed:not(.rail__row--in-dashed) .rail__track::after,
.rail__row--in-quiet:not(.rail__row--out-quiet) .rail__track::before,
.rail__row--out-quiet:not(.rail__row--in-quiet) .rail__track::after {
   border-left: 0;
   width: 2px;
   background-image: repeating-linear-gradient(to bottom, var(--rail-dash, var(--color-foreground)) 0 2px, transparent 2px 5px);
}

.rail__row--in-quiet:not(.rail__row--out-quiet) .rail__track::before,
.rail__row--out-quiet:not(.rail__row--in-quiet) .rail__track::after {
   --rail-dash: var(--color-accent);
}

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
   line-height: var(--text-xs--line-height);
}

.rail__row--negative .rail__text strong {
   color: var(--color-foreground-negative);
}
</style>
