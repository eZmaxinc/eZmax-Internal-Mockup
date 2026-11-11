import { defineScenarios } from '@ez'
import { daysFromToday, makeFolder, makeSigner, type EzsignFolder, type EzsignSigner } from '@mocks'

export type FolderEventKind = 'created' | 'sent' | 'viewed' | 'reminded' | 'signed' | 'refused' | 'completed'

/** One thing that happened to the folder; `signer` is absent for what the owner or the system did. */
export interface FolderEvent {
   id: number
   kind: FolderEventKind
   at: Date
   signer?: EzsignSigner
}

/** A date `days` away from today, at a given hour, so events of the same day keep their order. */
function at(days: number, hour: number, minute = 0): Date {
   const date = daysFromToday(days)
   date.setHours(hour, minute, 0, 0)
   return date
}

function story(folder: EzsignFolder, steps: [FolderEventKind, Date, EzsignSigner?][]): { folder: EzsignFolder, events: FolderEvent[] } {
   return { folder, events: steps.map(([kind, date, signer], index) => ({ id: index + 1, kind, at: date, signer })) }
}

export const scenarios = defineScenarios({
   'some-pending': () => {
      const [anna, marc, lea] = [makeSigner(1, { state: 'signed' }), makeSigner(2, { state: 'viewed', remindersSent: 1 }), makeSigner(3, { state: 'pending', remindersSent: 1 })]
      const folder = makeFolder(1, { state: 'sent', createdAt: at(-6, 9), dueAt: daysFromToday(4), signers: [anna, marc, lea] })
      return story(folder, [
         ['created', at(-6, 9)],
         ['sent', at(-6, 9, 20)],
         ['viewed', at(-6, 11, 5), anna],
         ['signed', at(-6, 11, 12), anna],
         ['viewed', at(-4, 15, 40), marc],
         ['reminded', at(-1, 8), marc],
         ['reminded', at(-1, 8), lea],
      ])
   },
   'all-signed': () => {
      const [anna, marc] = [makeSigner(1, { state: 'signed' }), makeSigner(2, { state: 'signed' })]
      const folder = makeFolder(2, { state: 'completed', createdAt: at(-3, 10), dueAt: daysFromToday(7), signers: [anna, marc] })
      return story(folder, [
         ['created', at(-3, 10)],
         ['sent', at(-3, 10, 15)],
         ['viewed', at(-3, 13), anna],
         ['signed', at(-3, 13, 8), anna],
         ['viewed', at(-2, 9, 30), marc],
         ['signed', at(-2, 9, 41), marc],
         ['completed', at(-2, 9, 41)],
      ])
   },
   refused: () => {
      const [anna, marc] = [makeSigner(1, { state: 'signed' }), makeSigner(2, { state: 'refused' })]
      const folder = makeFolder(3, { state: 'refused', createdAt: at(-2, 14), dueAt: daysFromToday(5), signers: [anna, marc] })
      return story(folder, [
         ['created', at(-2, 14)],
         ['sent', at(-2, 14, 10)],
         ['signed', at(-1, 9), anna],
         ['viewed', at(-1, 16, 20), marc],
         ['refused', at(-1, 16, 25), marc],
      ])
   },
   'not-sent': () => story(makeFolder(4, { state: 'draft', createdAt: at(0, 9), dueAt: null }), []),
})
