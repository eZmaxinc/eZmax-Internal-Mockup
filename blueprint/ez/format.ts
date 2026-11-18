/** Small display helpers shared by prototypes (fr-CA). */
import { PROTO_TODAY } from './today'

const dateFormatter = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('fr-CA', {
   year: 'numeric',
   month: 'short',
   day: 'numeric',
   hour: '2-digit',
   minute: '2-digit',
})
const relativeFormatter = new Intl.RelativeTimeFormat('fr-CA', { numeric: 'auto' })

/** « 6 nov. 2026 »; « — » when empty */
export function formatDate(value: Date | string | null | undefined): string {
   if (!value) return '—'
   return dateFormatter.format(new Date(value))
}

/** « 6 nov. 2026, 10 h 00 »; « — » when empty */
export function formatDateTime(value: Date | string | null | undefined): string {
   if (!value) return '—'
   return dateTimeFormatter.format(new Date(value))
}

/** « dans 3 jours », « hier », counted from the prototypes' today (PROTO_TODAY); « — » when empty */
export function formatRelative(value: Date | string | null | undefined, now: Date = PROTO_TODAY): string {
   if (!value) return '—'
   const diffDays = Math.round((new Date(value).getTime() - now.getTime()) / 86_400_000)
   return relativeFormatter.format(diffDays, 'day')
}
