/**
 * yarn mockup new "Titre" [numéro GoodDay] [lien GoodDay] [--from <patron>|vide] [--chrome none] [--owner "Nom"] [--slug <slug>]
 * Creates prototypes/<slug>/ with meta.json and v001. GoodDay is optional: kept in meta.json when given.
 */
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
   GOODDAY_NUMBER, GOODDAY_URL, PATTERNS, PROTOTYPES, TEMPLATES,
   ask, choose, fail, flagString, gitUserName, isInteractive, listPatterns, listTasks, normalizeGoodDayUrl, notifyDevServer, parseArgs, slugify, today, writeMeta,
} from '../lib.mjs'

const USAGE = 'Usage: yarn mockup new "Titre" [numéro GoodDay] [lien GoodDay] [--from <patron>] [--slug <nom-court>]'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)

   // Positional arguments in any order: an optional GoodDay number and link, the rest is the title
   let number = positional.map((arg) => arg.match(GOODDAY_NUMBER)?.[1]).find(Boolean)
   let url = positional.map(normalizeGoodDayUrl).find(Boolean)
   let title = positional.filter((arg) => !GOODDAY_NUMBER.test(arg) && !GOODDAY_URL.test(arg)).join(' ').trim()

   if (!title && !isInteractive) fail('Il manque le titre.', USAGE)
   if (!title) title = await ask('Titre du prototype')

   // GoodDay: nice to have, never required
   if (!number && !url && isInteractive) {
      const answer = await ask('Tâche GoodDay, numéro ou lien (facultatif, Entrée pour passer)', {
         validate: (value) => !value || GOODDAY_NUMBER.test(value) || GOODDAY_URL.test(value) || 'Un numéro (49198) ou un lien https://www.goodday.work/t/<id>, ou rien.',
      })
      number = answer.match(GOODDAY_NUMBER)?.[1]
      url = normalizeGoodDayUrl(answer)
   }

   const slug = flagString(flags, 'slug') ? slugify(flags.slug) : slugify(title)
   if (!slug) fail('Le titre ne donne aucun nom de dossier.', 'Préciser --slug <nom-court>')

   const existing = listTasks().find((task) => task.id === slug || (number && task.meta.goodday?.number === Number(number)))
   if (existing) {
      const latest = existing.versions.at(-1) ?? 'aucune version'
      fail(
         `Cette tâche a déjà un prototype: prototypes/${existing.id} (dernière version: ${latest}).`,
         `Ne pas le recommencer. Demander quoi faire: retoucher ${latest} en place, ou une nouvelle version (yarn mockup iterate ${existing.id} -m "…"). Un autre sujet: --slug <autre-nom>.`,
      )
   }

   const taskId = slug
   const taskDir = join(PROTOTYPES, taskId)
   const versionDir = join(taskDir, 'v001')
   if (existsSync(taskDir)) fail(`prototypes/${taskId} existe déjà.`)

   // Starting point: a reference pattern or the blank template
   const patterns = listPatterns()
   let from = flagString(flags, 'from')
   if (!from && isInteractive) {
      from = await choose('Point de départ', [
         { value: 'vide', label: 'Page vide (gabarit minimal)' },
         ...patterns.map((pattern) => ({ value: pattern, label: `Patron ${pattern}` })),
      ])
   }
   from ??= 'vide'
   if (from !== 'vide' && !patterns.includes(from)) fail(`Patron inconnu « ${from} ».`, `Patrons: ${patterns.join(', ')}, ou vide`)

   mkdirSync(versionDir, { recursive: true })

   writeMeta(taskId, {
      title,
      goodday: number || url ? { number: number ? Number(number) : null, url: url ?? null } : null,
      status: 'draft',
      chosen: null,
      chrome: flags.chrome === 'none' ? 'none' : 'app',
      owner: flagString(flags, 'owner') ?? gitUserName(),
      tags: [],
      created: today(),
   })

   const source = from === 'vide' ? TEMPLATES : join(PATTERNS, from)
   cpSync(join(source, 'index.vue'), join(versionDir, 'index.vue'))
   cpSync(join(source, 'mocks.ts'), join(versionDir, 'mocks.ts'))

   writeFileSync(join(versionDir, 'notes.md'), [
      '---',
      'based_on: —',
      `date: ${today()}`,
      '---',
      'Première version.',
      '',
   ].join('\n'))

   console.log(`✓ Prototype créé: prototypes/${taskId}/v001 (départ: ${from})`)
   if (number || url) console.log(`  GoodDay: ${[number && `#${number}`, url].filter(Boolean).join(' ')}`)
   console.log('')
   console.log('  Ensuite:')
   console.log(`   1. Des contraintes ont été données? Les écrire dans prototypes/${taskId}/README.md (sinon, pas de README)`)
   console.log('   2. Construire v001/index.vue et v001/mocks.ts')
   console.log(`   3. yarn mockup check ${taskId}`)
   console.log(`   4. yarn mockup open ${taskId}`)
   await notifyDevServer(taskId)
}
