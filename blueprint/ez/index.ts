import type { App } from 'vue'
import { components } from './components.generated'
import { icons } from './icons'
import { gettext } from './i18n'

/**
 * Every ez- component, registered globally. The list is generated from the files in
 * components/ by `yarn mockup catalog` (components.generated.ts): never by hand.
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
export { useAppShell } from './components/app-shell/app-shell'
export type { EzTableColumn } from './components/table/ez-table.vue'
export type { EzFieldOption } from './components/field/ez-field.vue'
/** The items of the former ez-info-list (removed: ez-info replaces it); kept for the versions that import the type */
export interface EzInfoItem {
   label: string
   value?: string | number | null
   key?: string
}
export { defineLayoutComposition, type ILayoutCol, type ILayoutSection, type TLayoutColumns, type TLayoutDirection, type TLayoutGap, type TLayoutSpan } from './components/layout/layout'
export { infoToComposition, type IInfoCategory, type IInfoCategoryItems, type IInfoMetric, type IInfoValue, type TInfoCol, type TInfoEntry, type TInfoTone } from './components/info/info'
