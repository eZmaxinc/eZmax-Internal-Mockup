import { defineScenarios } from '@ez'
import { makeFolder } from '@mocks'

/** The access levels of a folder, as production lists them in the « FULL » menu */
export const ACCESS_LEVELS = ['FULL', 'LIMITED', 'READONLY'] as const
export type AccessLevel = (typeof ACCESS_LEVELS)[number]

export const scenarios = defineScenarios({
   'dossier-complete': () => ({
      folder: makeFolder(1, { name: 'BackupPolicy - 2026-11-20 (09:40:10)', state: 'completed' }),
      access: 'FULL' as AccessLevel,
      isArchived: false,
      hasDevAccess: true,
   }),
   // edge: archived, and a user without the developer access (no access menu)
   'dossier-archive': () => ({
      folder: makeFolder(2, { name: 'Bail commercial - Dupuis', state: 'completed' }),
      access: 'READONLY' as AccessLevel,
      isArchived: true,
      hasDevAccess: false,
   }),
})
