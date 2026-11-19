import { inject, ref, watch, type InjectionKey, type Ref } from 'vue'

/** Provided by the frame: the scenario currently selected in the shell. */
export const scenarioKey: InjectionKey<Ref<string>> = Symbol('ez-mockup-scenario')

export type Scenarios<T> = Record<string, () => T>

/** Declares a version's data scenarios. The first key is the default. */
export function defineScenarios<T>(scenarios: Scenarios<T>): Scenarios<T> {
   return scenarios
}

/**
 * Returns the data of the scenario selected in the shell, as local state.
 * Mutating it (e.g. removing a row) is fine: switching scenario rebuilds it.
 */
export function useScenario<T>(scenarios: Scenarios<T>): Ref<T> {
   const theName = inject(scenarioKey, ref(Object.keys(scenarios)[0] ?? ''))
   const build = () => (scenarios[theName.value] ?? Object.values(scenarios)[0])()
   const theData = ref(build()) as Ref<T>

   watch(theName, () => {
      theData.value = build()
   })

   return theData
}
