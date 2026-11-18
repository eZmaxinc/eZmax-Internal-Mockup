/**
 * yarn mockup tokens                                       version, last change, how to copy into the mono
 * yarn mockup tokens bump <patch|minor|major> -m "…"       new version: header of ez-tokens.css + CHANGELOG entry
 * yarn mockup tokens migrate                               rewrites old token names (tool/cli/token-renames.mjs)
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BLUEPRINT, PATTERNS, PROTOTYPES, TOOL, fail, flagString, parseArgs, rel, today } from '../lib.mjs'
import { migrate } from '../token-renames.mjs'
import { CHANGELOG_FILE, HEADER, SHARED_FILE, readVersion } from '../tokens-lib.mjs'

const LEVELS = ['patch', 'minor', 'major']

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   const [action, level] = positional

   if (!action) return show()
   if (action === 'bump') return bump(level, flagString(flags, 'message'))
   if (action === 'migrate') return migrateAll()
   fail(`Action inconnue « ${action} ».`, 'Usage: yarn mockup tokens [bump <patch|minor|major> -m "…" | migrate]')
}

function show() {
   const version = readVersion()
   const changelog = readFileSync(CHANGELOG_FILE, 'utf8')
   const lastEntry = changelog.match(/^## .+$[\s\S]*?(?=^## |(?![\s\S]))/m)?.[0].trim() ?? '(aucune entrée)'

   console.log(`ez-tokens ${version?.text ?? '?'} (${version?.date ?? 'date inconnue'})`)
   console.log(`Fichier à copier dans le mono: ${rel(SHARED_FILE)}`)
   console.log('Procédure: blueprint/tokens/COPY.md\n')
   console.log(lastEntry.split('\n').slice(0, 12).join('\n'))
}

function bump(level, message) {
   if (!LEVELS.includes(level)) fail('Niveau requis: patch (une valeur), minor (un ajout) ou major (un renommage ou un retrait).', 'Usage: yarn mockup tokens bump <patch|minor|major> -m "Ce qui change"')
   if (!message) fail('Décrire le changement avec -m "…": il va dans le CHANGELOG.')

   const source = readFileSync(SHARED_FILE, 'utf8')
   const current = readVersion(source)
   if (!current) fail(`En-tête « ez-tokens X.Y.Z — AAAA-MM-JJ » introuvable dans ${rel(SHARED_FILE)}`)

   const next = level === 'major' ? `${current.major + 1}.0.0`
      : level === 'minor' ? `${current.major}.${current.minor + 1}.0`
         : `${current.major}.${current.minor}.${current.patch + 1}`
   const date = today()

   writeFileSync(SHARED_FILE, source.replace(HEADER, `ez-tokens ${next} — ${date}`))

   const changelog = readFileSync(CHANGELOG_FILE, 'utf8')
   const firstEntry = changelog.search(/^## /m)
   const entry = `## ${next} — ${date}\n\n- ${message}\n${level === 'major' ? '\nRenommés ou retirés: compléter ici, et dans tool/cli/token-renames.mjs.\n' : ''}\n`
   writeFileSync(CHANGELOG_FILE, firstEntry < 0 ? `${changelog.trimEnd()}\n\n${entry}` : changelog.slice(0, firstEntry) + entry + changelog.slice(firstEntry))

   console.log(`✓ ez-tokens ${current.text} → ${next}`)
   console.log(`  ${rel(SHARED_FILE)} (en-tête) et ${rel(CHANGELOG_FILE)} mis à jour`)
   console.log('')
   console.log('  Ensuite: yarn mockup check, puis copier dans le mono (blueprint/tokens/COPY.md)')
}

function migrateAll() {
   const roots = [join(BLUEPRINT, 'ez'), PATTERNS, PROTOTYPES, TOOL]
   const files = roots.flatMap(walk).filter((file) => /\.(vue|ts|css)$/.test(file))
   const changed = []

   for (const file of files) {
      const before = readFileSync(file, 'utf8')
      const after = migrate(before)
      if (after !== before) {
         writeFileSync(file, after)
         changed.push(rel(file))
      }
   }

   if (!changed.length) {
      console.log('✓ Aucun ancien nom de token.')
      return
   }
   console.log(`✓ ${changed.length} fichier(s) migré(s):`)
   changed.forEach((file) => console.log(`  ${file}`))
   if (changed.some((file) => file.startsWith('prototypes/'))) {
      console.log('\n  Des versions existantes ont été réécrites: seulement les noms de tokens, pour qu\'elles s\'affichent encore.')
   }
}

function walk(dir) {
   return readdirSync(dir).flatMap((name) => {
      if (name === 'node_modules') return []
      const path = join(dir, name)
      return statSync(path).isDirectory() ? walk(path) : [path]
   })
}
