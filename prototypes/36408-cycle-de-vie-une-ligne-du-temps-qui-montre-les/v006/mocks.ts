import { defineScenarios } from '@ez'

/**
 * The delays of a folder type, as on its detail page. They run on two clocks:
 * the signature is counted from the sending of the folder, the retention from its closing.
 */
export interface FolderTypeLifecycle {
   name: string
   /** Days the signers have to sign, counted from the day the folder is sent */
   signatureDays: number
   /** First reminder after `firstAfterDays`, then one every `everyDays`; null = no reminders */
   reminders: { firstAfterDays: number, everyDays: number } | null
   /** How the documents of a folder are finalized */
   finalizationRule: string
   /** Days after the signature deadline before the documents are completed early, automatically; null = by hand */
   earlyCompletionDays: number | null
   /** Days between the closing of the folder and its archiving */
   archiveDays: number
   /** Days between the archiving and the elimination of the data; null = eliminated by hand */
   eliminationDays: number | null
}

export type StepKey = 'sent' | 'first-reminder' | 'reminder' | 'last-reminder' | 'deadline' | 'early-completion' | 'closed' | 'archive' | 'elimination'

/** A step of the lifecycle, with the stretch of line that leads to it. */
export interface LifecycleStep {
   key: StepKey
   /** « Date limite » */
   label: string
   /** « Date limite de signature » */
   longLabel: string
   /** Where the step falls: « J+60 » counted from the sending, « F+180 » from the closing */
   code: string
   /** A condition said under the label: « si non signé » */
   note: string
   /** The stretch before the step: what is written on it, and what it is; null for the first step. A folded stretch explains what it holds */
   lead: { text: string, kind: 'signature' | 'folded' | 'unsigned' | 'retention' | 'elimination', tooltip?: { title: string, text: string } } | null
   /** What the step is, said when the pointer or the keyboard is on its dot */
   tooltip: { title: string, text: string }
}

/** « chaque jour », « tous les 2 jours » */
export function rhythmOf(lifecycle: FolderTypeLifecycle): string {
   if (!lifecycle.reminders) return ''
   return lifecycle.reminders.everyDays === 1 ? 'chaque jour' : `tous les ${lifecycle.reminders.everyDays} jours`
}

/** The days a reminder goes out, from the first one to the day before the signature deadline. */
export function reminderDaysOf(lifecycle: FolderTypeLifecycle): number[] {
   if (!lifecycle.reminders) return []
   const days: number[] = []
   for (let day = lifecycle.reminders.firstAfterDays; day < lifecycle.signatureDays; day += lifecycle.reminders.everyDays) days.push(day)
   return days
}

/** The longest a folder can live when everything is counted end to end from the sending. */
export function maxDurationOf(lifecycle: FolderTypeLifecycle): number {
   return lifecycle.signatureDays + lifecycle.archiveDays + (lifecycle.eliminationDays ?? 0)
}

/**
 * The steps of the lifecycle, in order: sending, the reminders, signature deadline, closing, archiving, elimination.
 * The reminders are shown one by one: the first two, then the last one; the others are folded into one stretch.
 * The automatic early completion is the closing of a folder nobody signed: it is a condition on the stretch that
 * leads to the closing, or a step of its own with `earlyCompletionAsStep`. Steps a folder type does not have are left out.
 */
export function stepsOf(lifecycle: FolderTypeLifecycle, earlyCompletionAsStep = false): LifecycleStep[] {
   const { signatureDays, reminders, earlyCompletionDays, archiveDays, eliminationDays } = lifecycle
   const hasEarlyCompletion = earlyCompletionDays !== null
   const days = (count: number) => `${count} jour${count > 1 ? 's' : ''}`

   const steps: Omit<LifecycleStep, 'tooltip'>[] = [{ key: 'sent', label: 'Envoi', longLabel: 'Envoi du dossier', code: 'J0', note: '', lead: null }]
   const reminderDays = reminderDaysOf(lifecycle)
   const lastReminder = reminderDays[reminderDays.length - 1] ?? 0
   const folded = reminderDays.length - 3
   const shown = folded > 0 ? [reminderDays[0], reminderDays[1], lastReminder] : reminderDays
   shown.forEach((day, index) => {
      const sincePrevious = `${day - (shown[index - 1] ?? 0)} j`
      if (index === 0) steps.push({ key: 'first-reminder', label: '1er rappel', longLabel: 'Premier rappel', code: `J+${day}`, note: '', lead: { text: sincePrevious, kind: 'signature' } })
      else if (day !== lastReminder) steps.push({ key: 'reminder', label: 'Rappel', longLabel: 'Rappel', code: `J+${day}`, note: '', lead: { text: sincePrevious, kind: 'signature' } })
      else if (folded > 0) steps.push({ key: 'last-reminder', label: 'Dernier rappel', longLabel: 'Dernier rappel', code: `J+${day}`, note: '', lead: { text: `+${folded} rappels`, kind: 'folded', tooltip: { title: `${folded} autres rappels`, text: `Un rappel ${rhythmOf(lifecycle)}, de J+${reminderDays[2]} à J+${reminderDays[reminderDays.length - 2]}, tant que le dossier n’est pas signé.` } } })
      else steps.push({ key: 'last-reminder', label: 'Dernier rappel', longLabel: 'Dernier rappel', code: `J+${day}`, note: '', lead: { text: sincePrevious, kind: 'signature' } })
   })
   steps.push({ key: 'deadline', label: 'Date limite', longLabel: 'Date limite de signature', code: `J+${signatureDays}`, note: '', lead: { text: `${signatureDays - lastReminder} j`, kind: 'signature' } })
   if (hasEarlyCompletion && earlyCompletionAsStep) {
      steps.push({ key: 'early-completion', label: 'Achèvement prématuré', longLabel: 'Achèvement prématuré', code: `J+${signatureDays + earlyCompletionDays}`, note: 'si non signé', lead: { text: `+${earlyCompletionDays} j`, kind: 'unsigned' } })
   }
   steps.push({
      key: 'closed',
      label: 'Fermeture',
      longLabel: 'Fermeture du dossier',
      code: 'F',
      note: '',
      lead: { text: hasEarlyCompletion && !earlyCompletionAsStep ? `+${earlyCompletionDays} j si non signé` : '', kind: 'unsigned' },
   })
   steps.push({ key: 'archive', label: 'Archivage', longLabel: 'Archivage', code: `F+${archiveDays}`, note: '', lead: { text: `${archiveDays} j`, kind: 'retention' } })
   if (eliminationDays !== null) {
      steps.push({ key: 'elimination', label: 'Élimination', longLabel: 'Élimination automatique', code: `F+${archiveDays + eliminationDays}`, note: '', lead: { text: `+${eliminationDays} j`, kind: 'elimination' } })
   }

   // What the tooltip of each step explains
   const texts: Record<StepKey, string> = {
      'sent': 'Le dossier est envoyé aux signataires. Le compte des jours commence ici.',
      'first-reminder': reminders ? `Envoyé ${days(reminders.firstAfterDays)} après l’envoi, puis un rappel ${rhythmOf(lifecycle)} tant que le dossier n’est pas signé.` : '',
      'reminder': 'Rappel envoyé aux signataires qui n’ont pas encore signé.',
      'last-reminder': 'Le dernier rappel avant la date limite de signature.',
      'deadline': 'Valeur par défaut à la création; elle peut être modifiée ensuite sur le dossier.',
      'early-completion': hasEarlyCompletion ? `Si le dossier n’est pas signé, il est fermé automatiquement ${days(earlyCompletionDays)} après la date limite.` : '',
      'closed': `Le dossier se ferme dès que tout est signé, n’importe quand avant la date limite. ${hasEarlyCompletion ? `Sinon, l’achèvement prématuré le ferme ${days(earlyCompletionDays)} après la date limite (J+${signatureDays + earlyCompletionDays}).` : 'Sinon, l’achèvement prématuré se fait à la main.'}`,
      'archive': `Le dossier est archivé ${days(archiveDays)} après sa fermeture.`,
      'elimination': eliminationDays === null ? '' : `Les données sont éliminées ${days(eliminationDays)} après l’archivage.`,
   }
   return steps.map((step) => {
      // The mark of the title: the F marks only where the line shows them, J everywhere else; none on the closing
      const mark = earlyCompletionAsStep ? step.code : step.code.replace('F', 'J')
      return { ...step, tooltip: { title: step.key === 'closed' ? step.longLabel : `${mark} · ${step.longLabel}`, text: texts[step.key] } }
   })
}

export const scenarios = defineScenarios({
   // The settings of the production screenshot
   'custom-reminders': () => ({
      lifecycle: {
         name: 'Dossier Mikhael Aubut',
         signatureDays: 60,
         reminders: { firstAfterDays: 2, everyDays: 1 },
         finalizationRule: 'Signatures de tous les documents complétées, avec étapes synchronisées',
         earlyCompletionDays: 4,
         archiveDays: 180,
         eliminationDays: 5,
      } as FolderTypeLifecycle,
   }),
   // Edge: a short signature, spaced reminders, everything within a few weeks
   'short-delays': () => ({
      lifecycle: {
         name: 'Entente express',
         signatureDays: 7,
         reminders: { firstAfterDays: 2, everyDays: 2 },
         finalizationRule: 'Signatures de tous les documents complétées',
         earlyCompletionDays: 2,
         archiveDays: 14,
         eliminationDays: 7,
      } as FolderTypeLifecycle,
   }),
   // Edge: no reminders, the documents and the data are handled by hand
   'no-reminders-manual': () => ({
      lifecycle: {
         name: 'Contrat conservé',
         signatureDays: 30,
         reminders: null,
         finalizationRule: 'Signatures de tous les documents complétées',
         earlyCompletionDays: null,
         archiveDays: 365,
         eliminationDays: null,
      } as FolderTypeLifecycle,
   }),
})
