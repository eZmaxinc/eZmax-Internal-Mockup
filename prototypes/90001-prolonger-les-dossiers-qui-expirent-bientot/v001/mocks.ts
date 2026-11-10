import { defineScenarios } from '@ez'
import { daysFromToday, makeFolder, makeSigner, type EzsignFolder } from '@mocks'

export const scenarios = defineScenarios({
   'due-soon': () => ({
      loading: false,
      folders: [
         makeFolder(1, {
            state: 'sent',
            dueAt: daysFromToday(1),
            signers: [
               makeSigner(11, { state: 'signed' }),
               makeSigner(12, { state: 'pending' }),
            ],
         }),
         makeFolder(2, {
            state: 'sent',
            dueAt: daysFromToday(3),
            signers: [
               makeSigner(21, { state: 'viewed' }),
               makeSigner(22, { state: 'pending' }),
               makeSigner(23, { state: 'signed' }),
            ],
         }),
         makeFolder(3, {
            state: 'sent',
            dueAt: daysFromToday(6),
            signers: [
               makeSigner(31, { state: 'pending' }),
               makeSigner(32, { state: 'pending' }),
            ],
         }),
         makeFolder(4, {
            state: 'sent',
            dueAt: daysFromToday(18),
         }),
         makeFolder(5, {
            state: 'completed',
            dueAt: daysFromToday(2),
         }),
         makeFolder(6, {
            state: 'refused',
            dueAt: daysFromToday(4),
         }),
         makeFolder(7, {
            state: 'expired',
            dueAt: daysFromToday(-2),
         }),
      ],
   }),
   'none-due-soon': () => ({
      loading: false,
      folders: [
         makeFolder(10, { state: 'sent', dueAt: daysFromToday(14) }),
         makeFolder(11, { state: 'sent', dueAt: daysFromToday(21) }),
         makeFolder(12, { state: 'completed', dueAt: daysFromToday(2) }),
         makeFolder(13, { state: 'refused', dueAt: daysFromToday(5) }),
      ],
   }),
   empty: () => ({
      loading: false,
      folders: [] as EzsignFolder[],
   }),
})
