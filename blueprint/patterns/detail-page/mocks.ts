import { defineScenarios } from '@ez'
import { daysFromToday, makeFolder, makeSigner } from '@mocks'

export const scenarios = defineScenarios({
   'in-progress': () => ({
      folder: makeFolder(3, {
         state: 'sent',
         dueAt: daysFromToday(2),
         signers: [
            makeSigner(31, { state: 'signed' }),
            makeSigner(32, { state: 'viewed' }),
            makeSigner(33, { state: 'pending' }),
         ],
      }),
   }),
   completed: () => ({
      folder: makeFolder(5, {
         state: 'completed',
         signers: [makeSigner(51, { state: 'signed' }), makeSigner(52, { state: 'signed' })],
      }),
   }),
})
