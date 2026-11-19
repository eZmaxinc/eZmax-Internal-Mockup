/**
 * Icon registry. Keys are what prototypes use through `ez.icons.<key>` (or `icon="<key>"`).
 *
 * The glyphs are production's: the same package (@quasar/extras), the same family (Material Symbols Outlined,
 * MDI where the app uses MDI), and for each key the glyph production's useIcons() gives the same use.
 * The keys are ez-proto's own; to add one, import the symbol production uses (its `useIcons()` names it).
 * A value is Quasar's SVG format: `path|viewBox` (viewBox 0 0 24 24 when absent), several paths joined by `&&`.
 */
import {
   symOutlinedAdd,
   symOutlinedArrowBack,
   symOutlinedCached,
   symOutlinedCalendarToday,
   symOutlinedCheck,
   symOutlinedCheckCircle,
   symOutlinedChevronRight,
   symOutlinedClose,
   symOutlinedDataTable,
   symOutlinedDelete,
   symOutlinedDescription,
   symOutlinedDownload,
   symOutlinedEdit,
   symOutlinedError,
   symOutlinedFilterList,
   symOutlinedFolder,
   symOutlinedGroup,
   symOutlinedInbox,
   symOutlinedInfo,
   symOutlinedKeyboardArrowDown,
   symOutlinedLayers,
   symOutlinedMail,
   symOutlinedMenu,
   symOutlinedMoreHoriz,
   symOutlinedNotifications,
   symOutlinedPalette,
   symOutlinedPerson,
   symOutlinedSchedule,
   symOutlinedSearch,
   symOutlinedSettings,
   symOutlinedSignature,
   symOutlinedTune,
   symOutlinedVisibility,
   symOutlinedWarning,
   symOutlinedWidgets,
} from '@quasar/extras/material-symbols-outlined'
import { mdiHome, mdiSend, mdiShieldLock } from '@quasar/extras/mdi-v7'

export const iconPaths = {
   add: symOutlinedAdd,
   back: symOutlinedArrowBack, // production: arrowBack
   calendar: symOutlinedCalendarToday, // calendarToday
   check: symOutlinedCheck,
   chevronDown: symOutlinedKeyboardArrowDown, // expandMore
   chevronRight: symOutlinedChevronRight,
   clock: symOutlinedSchedule, // schedule
   close: symOutlinedClose,
   dataTable: symOutlinedDataTable,
   delete: symOutlinedDelete,
   download: symOutlinedDownload,
   edit: symOutlinedEdit,
   error: symOutlinedError,
   eye: symOutlinedVisibility, // visibility
   file: symOutlinedDescription, // ezsigndocument
   filter: symOutlinedFilterList, // filterList
   folder: symOutlinedFolder,
   home: mdiHome, // MDI, as production
   inbox: symOutlinedInbox,
   info: symOutlinedInfo,
   layers: symOutlinedLayers,
   mail: symOutlinedMail, // email
   menu: symOutlinedMenu,
   more: symOutlinedMoreHoriz, // moreHoriz
   notifications: symOutlinedNotifications,
   palette: symOutlinedPalette,
   refresh: symOutlinedCached, // cached: the refresh of the page header
   search: symOutlinedSearch,
   send: mdiSend, // MDI, as production
   settings: symOutlinedSettings,
   shieldLock: mdiShieldLock, // MDI, as production
   signature: symOutlinedSignature,
   success: symOutlinedCheckCircle, // checkCircle
   tune: symOutlinedTune,
   user: symOutlinedPerson, // person
   users: symOutlinedGroup, // group
   warning: symOutlinedWarning,
   widgets: symOutlinedWidgets,
} as const

export type IconName = keyof typeof iconPaths

/** `ez.icons.add === 'add'` — mirrors production usage (`:icon="ez.icons.add"`). */
export const icons = Object.fromEntries(
   Object.keys(iconPaths).map((key) => [key, key]),
) as { readonly [K in IconName]: K }

/** The paths and viewBox of a glyph in Quasar's format: `d@@style&&d|viewBox` */
export function parseIcon(value: string): { viewBox: string, paths: { d: string, style?: string }[] } {
   const [def, viewBox = '0 0 24 24'] = value.split('|')
   const paths = def.split('&&').map((path) => {
      const [d, style] = path.split('@@')
      return { d, style: style || undefined }
   })
   return { viewBox, paths }
}
