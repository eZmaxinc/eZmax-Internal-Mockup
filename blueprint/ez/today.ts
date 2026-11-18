/**
 * The prototypes' « today »: a fixed date, so a scenario always shows the same dates and delays
 * (« dans 3 jours ») whatever day it is opened. Mock dates (daysFromToday) and formatRelative use it.
 */
export const PROTO_TODAY = new Date('2026-11-06T10:00:00')

/** A copy of PROTO_TODAY, safe to mutate */
export function protoToday(): Date {
   return new Date(PROTO_TODAY.getTime())
}
