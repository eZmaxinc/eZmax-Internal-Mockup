import { defineScenarios } from '@ez'
import { daysFromToday, makeFolder, makeSigner } from '@mocks'

export const scenarios = defineScenarios({
   'some-pending': () => ({
      folder: makeFolder(3, {
         state: 'sent',
         dueAt: daysFromToday(2),
         signers: [
            makeSigner(31, { state: 'signed', remindersSent: 0 }),
            makeSigner(32, { state: 'viewed', remindersSent: 1 }),
            makeSigner(33, { state: 'pending', remindersSent: 0 }),
         ],
      }),
   }),
   'all-signed': () => ({
      folder: makeFolder(5, {
         state: 'completed',
         signers: [makeSigner(51, { state: 'signed' }), makeSigner(52, { state: 'signed' })],
      }),
   }),
})
