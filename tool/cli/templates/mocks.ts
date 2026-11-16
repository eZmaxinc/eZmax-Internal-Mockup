import { defineScenarios } from '@ez'

/** Data scenarios for this version. The first key is the default. */
export const scenarios = defineScenarios({
   full: () => ({
      message: 'Remplacer ce contenu par le prototype.',
   }),
   empty: () => ({
      message: '',
   }),
})
