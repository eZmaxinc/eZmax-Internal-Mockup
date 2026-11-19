/**
 * The mockups' « today »: a fixed date, so a scenario always shows the same dates and delays
 * (« dans 3 jours ») whatever day it is opened. Mock dates (daysFromToday) and formatRelative use it.
 */
export const MOCKUP_TODAY = new Date('2026-11-06T10:00:00')

/** A copy of MOCKUP_TODAY, safe to mutate */
export function mockupToday(): Date {
   return new Date(MOCKUP_TODAY.getTime())
}
