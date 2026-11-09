/** Small display helpers shared by prototypes (fr-CA). */

const dateFormatter = new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('fr-CA', {
   year: 'numeric',
   month: 'short',
   day: 'numeric',
   hour: '2-digit',
   minute: '2-digit',
})
const relativeFormatter = new Intl.RelativeTimeFormat('fr-CA', { numeric: 'auto' })

export function formatDate(value: Date | string | null | undefined): string {
   if (!value) return '—'
   return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: Date | string | null | undefined): string {
   if (!value) return '—'
   return dateTimeFormatter.format(new Date(value))
}

export function formatRelative(value: Date | string | null | undefined, now = new Date()): string {
   if (!value) return '—'
   const diffDays = Math.round((new Date(value).getTime() - now.getTime()) / 86_400_000)
   return relativeFormatter.format(diffDays, 'day')
}
