/** Seeded PRNG so a scenario renders the same data every time. */
export function createRandom(seed = 42) {
   let state = seed >>> 0

   const next = () => {
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
   }

   return {
      next,
      int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
      pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
   }
}

export const firstNames = ['Marie', 'Jean', 'Sophie', 'Louis', 'Camille', 'Olivier', 'Julie', 'Mathieu', 'Émilie', 'Alexandre'] as const
export const lastNames = ['Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie', 'Fortin', 'Gagné'] as const
export const folderNames = [
   'Offre d\'achat — 123 rue Principale',
   'Contrat de service 2027',
   'Bail commercial — Local 204',
   'Entente de confidentialité',
   'Mandat de courtage',
   'Promesse d\'achat — Terrebonne',
   'Contrat d\'emploi — Analyste',
   'Avenant au contrat',
] as const

/** Days offset from a fixed "today" so screenshots stay stable. */
export const MOCK_TODAY = new Date('2026-11-06T10:00:00')

export function daysFromToday(days: number): Date {
   return new Date(MOCK_TODAY.getTime() + days * 86_400_000)
}
