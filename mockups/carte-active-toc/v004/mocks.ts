import { defineScenarios } from '@ez'
import { daysFromToday, EzsignDocument, makeFolder, makeSigner } from '@mocks'

/** A line of the folder's journal: who did what, when */
export interface JournalEntry {
   id: number
   at: Date
   who: string
   what: string
}

/** Enough content for the page to scroll well past the first screen: four sections, a dozen cards */
const LONG_DOCUMENTS = [
   new EzsignDocument(301, 'Bail commercial.pdf', 12, 3, 1),
   new EzsignDocument(302, 'Annexe A - Plan des lieux.pdf', 4, 3, 1),
   new EzsignDocument(303, 'Annexe B - Règlements.pdf', 6, 3, 0),
   new EzsignDocument(304, 'Garantie personnelle.pdf', 2, 1, 1),
   new EzsignDocument(305, 'Formulaire de dépôt direct.pdf', 1, 1, 0),
]

const LONG_JOURNAL: JournalEntry[] = [
   { id: 1, at: daysFromToday(-6), who: 'Julie Fortin', what: 'Dossier créé' },
   { id: 2, at: daysFromToday(-6), who: 'Julie Fortin', what: 'Dossier envoyé à 3 signataires' },
   { id: 3, at: daysFromToday(-5), who: 'Marc Gagnon', what: 'A consulté Bail commercial.pdf' },
   { id: 4, at: daysFromToday(-4), who: 'Marc Gagnon', what: 'A signé Bail commercial.pdf' },
   { id: 5, at: daysFromToday(-4), who: 'Système', what: 'Rappel envoyé à Sophie Roy' },
   { id: 6, at: daysFromToday(-2), who: 'Système', what: 'Rappel envoyé à Sophie Roy' },
   { id: 7, at: daysFromToday(-1), who: 'Sophie Roy', what: 'A consulté Annexe A - Plan des lieux.pdf' },
]

export const scenarios = defineScenarios({
   'long-page': () => ({
      folder: makeFolder(3, {
         state: 'sent',
         dueAt: daysFromToday(2),
         signers: [
            makeSigner(31, { state: 'signed' }),
            makeSigner(32, { state: 'viewed' }),
            makeSigner(33, { state: 'pending' }),
         ],
         documents: LONG_DOCUMENTS,
      }),
      journal: LONG_JOURNAL,
   }),
   // Edge: a short page, the last cards reached before it can scroll far
   'short-page': () => ({
      folder: makeFolder(5, {
         state: 'completed',
         signers: [makeSigner(51, { state: 'signed' }), makeSigner(52, { state: 'signed' })],
         documents: [new EzsignDocument(501, 'Entente.pdf', 3, 2, 2)],
      }),
      journal: LONG_JOURNAL.slice(0, 2),
   }),
})
