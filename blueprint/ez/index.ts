import type { App } from 'vue'
import { components } from './components.generated'
import { icons } from './icons'
import { gettext } from './i18n'

/**
 * Every ez- component, registered globally. The list is generated from the files in
 * primitives/ and domain/ by `pnpm proto catalog` (components.generated.ts): never by hand.
 */
export { components }

/** Mirrors production's global `ez` helper (icons for now). */
export const ez = { icons }

/** Registers every ez- component globally, plus `$gettext` and `ez`, like production. */
export const EzPlugin = {
   install(app: App) {
      for (const [name, component] of Object.entries(components)) app.component(name, component)
      app.config.globalProperties.$gettext = gettext
      app.config.globalProperties.ez = ez
   },
}

export { gettext } from './i18n'
export { icons, type IconName } from './icons'
export { defineScenarios, useScenario, scenarioKey, type Scenarios } from './scenario'
export { formatDate, formatDateTime, formatRelative } from './format'
export { PROTO_TODAY, protoToday } from './today'
export type { EzTableColumn } from './primitives/EzTable.vue'
export type { EzFieldOption } from './primitives/EzField.vue'
export type { EzInfoItem } from './primitives/EzInfoList.vue'
