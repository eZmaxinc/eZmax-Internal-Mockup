import { defineScenarios } from '@ez'
import { makeFolders } from '@mocks'

export const scenarios = defineScenarios({
   full: () => ({ loading: false, folders: makeFolders(12) }),
   empty: () => ({ loading: false, folders: [] }),
   loading: () => ({ loading: true, folders: [] }),
})
