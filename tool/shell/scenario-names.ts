import { ref, watch, type Ref } from 'vue'
import { loadScenarioNames } from '@/registry'

/** Scenario names of the folder (version or pattern) currently shown; loaded on demand. */
export function useScenarioNames(folder: () => string | undefined): Ref<string[]> {
   const theNames = ref<string[]>([])

   watch(folder, async (path) => {
      const names = path ? await loadScenarioNames(path) : []
      if (folder() === path) theNames.value = names
   }, { immediate: true })

   return theNames
}
