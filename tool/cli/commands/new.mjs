/**
 * pnpm proto new [numéro] [lien] ["Titre"] [--from <patron>|vide] [--chrome none] [--owner "Nom"] [--slug <slug>]
 * Creates prototypes/<numéro>-<slug>/ with meta.json, README.md and v001.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
   GOODDAY_NUMBER, GOODDAY_URL, PATTERNS, PROTOTYPES, TEMPLATES,
   ask, choose, fail, flagString, gitUserName, isInteractive, listPatterns, listTasks, normalizeGoodDayUrl, notifyDevServer, parseArgs, slugify, today, writeMeta,
} from '../lib.mjs'

const USAGE = 'Usage: pnpm proto new <numéro GoodDay> <lien GoodDay> "Titre" [--from <patron>]'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)

   // Positional arguments in any order: the number, the link, the rest is the title
   let number = positional.map((arg) => arg.match(GOODDAY_NUMBER)?.[1]).find(Boolean)
   let url = positional.map(normalizeGoodDayUrl).find(Boolean)
   let title = positional.filter((arg) => !GOODDAY_NUMBER.test(arg) && !GOODDAY_URL.test(arg)).join(' ').trim()

   const missing = [!number && 'numéro GoodDay', !url && 'lien GoodDay', !title && 'titre'].filter(Boolean)
   if (missing.length && !isInteractive) fail(`Il manque: ${missing.join(', ')}.`, USAGE)

   if (!number) {
      number = (await ask('Numéro de la tâche GoodDay (ex. 49198)', {
         validate: (value) => GOODDAY_NUMBER.test(value) || 'Un nombre, avec ou sans #.',
      })).replace('#', '')
   }

   const existing = listTasks().find((task) => task.meta.goodday?.number === Number(number))
   if (existing) {
      const latest = existing.versions.at(-1) ?? 'aucune version'
      fail(
         `La tâche #${number} a déjà un prototype: prototypes/${existing.id} (dernière version: ${latest}).`,
         `Ne pas le recommencer. Demander quoi faire: retoucher ${latest} en place, ou une nouvelle version (pnpm proto iterate ${number} -m "…").`,
      )
   }

   if (!url) {
      url = normalizeGoodDayUrl(await ask('Lien de la tâche GoodDay (ex. https://www.goodday.work/t/M2nSjU)', {
         validate: (value) => GOODDAY_URL.test(value) || 'Format attendu: https://www.goodday.work/t/<id>',
      }))
   }

   if (!title) title = await ask('Titre (comme dans GoodDay)')

   const slug = flagString(flags, 'slug') ? slugify(flags.slug) : slugify(title)
   if (!slug) fail('Le titre ne donne aucun nom de dossier.', 'Préciser --slug <nom-court>')
   const taskId = `${number}-${slug}`
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
      goodday: { number: Number(number), url },
      status: 'draft',
      chosen: null,
      chrome: flags.chrome === 'none' ? 'none' : 'app',
      owner: flagString(flags, 'owner') ?? gitUserName(),
      tags: [],
      created: today(),
   })

   const brief = readFileSync(join(TEMPLATES, 'README.md'), 'utf8')
      .replace('{{title}}', title)
      .replace('{{goodday}}', `[#${number}](${url})`)
   writeFileSync(join(taskDir, 'README.md'), brief)

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
   console.log(`  GoodDay #${number}: ${url}`)
   console.log(`  Branche, si le travail continue dans le mono: feature/${taskId}`)
   console.log('')
   console.log('  Ensuite:')
   console.log(`   1. Le brief est la tâche GoodDay: n'ajouter à prototypes/${taskId}/README.md que les contraintes données`)
   console.log('   2. Construire v001/index.vue et v001/mocks.ts')
   console.log(`   3. pnpm proto check ${number}`)
   console.log(`   4. pnpm proto open ${number}`)
   await notifyDevServer(taskId)
}
