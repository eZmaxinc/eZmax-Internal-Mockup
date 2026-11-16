/**
 * Shared mock domain for prototypes: typed business objects with methods,
 * like production (e.g. folder.isStateClosed()). Extend here, not in prototypes,
 * when a concept is reused by more than one task.
 */
export * from './ezsign'
export { createRandom, daysFromToday, MOCK_TODAY } from './random'
