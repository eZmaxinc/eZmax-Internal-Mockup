/**
 * pnpm proto proposals [--all]
 * What prototypes ask of the blueprint, for the team to decide:
 *   - components proposed in prototypes (components/ of a version, with a @proposal header), most requested first
 *   - what the latest version of each task built by hand (local components, scoped styles)
 *   - reports written in notes.md: every bullet of the « Signalements » section (Bug primitive,
 *     Bug helper, Mock manquant, Composant manquant… or any other), plus those prefixes anywhere
 * --all also shows the components already promoted into blueprint/ez.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { PROTOTYPES, listDirs, listVersions, parseArgs } from '../lib.mjs'
import { buildCatalog, catalogMap, readProposal, toKebab } from '../catalog-lib.mjs'
import { groupProposals } from '../proposals-lib.mjs'

/** A report written anywhere in the notes with one of the known prefixes */
const REPORT = /^\s*[-*]?\s*(Bug primitive|Bug helper|Mock manquant|Composant manquant)\s*:\s*(.+)$/

/**
 * Every bullet of the « ## Signalements » section, whatever its prefix (an agent may write
 * « Helper: … »), plus known prefixes found elsewhere. Kind = the text before « : » when short.
 */
function readReports(markdown) {
   const reports = []
   let inSection = false
   for (const line of markdown.split(/\r?\n/)) {
      if (/^##\s/.test(line)) {
         inSection = /^##\s+Signalements\b/i.test(line)
         continue
      }
      const known = line.match(REPORT)
      if (known) {
         reports.push({ kind: known[1], text: known[2].trim() })
         continue
      }
      const bullet = inSection && line.match(/^\s*[-*]\s+(.*\S)\s*$/)
      if (!bullet) continue
      const prefixed = bullet[1].match(/^([^:]{2,30}):\s*(.+)$/)
      reports.push(prefixed ? { kind: prefixed[1].trim(), text: prefixed[2].trim() } : { kind: 'Autre', text: bullet[1] })
   }
   return reports
}

export async function run(argv) {
   const { flags } = parseArgs(argv)
   showComponents(Boolean(flags.all))
   showLocalVisuals()
   showReports()
}

/**
 * What the latest version of each task built by hand: its local components and the files with a style of
 * their own. Nobody declares it; it is where the blueprint is missing something.
 */
function showLocalVisuals() {
   console.log('Créé ou rehaussé dans les prototypes (dernière version de chaque tâche)\n')
   const known = catalogMap(buildCatalog())
   let found = false
   for (const taskId of listDirs(PROTOTYPES)) {
      const version = listVersions(taskId).at(-1)
      if (!version) continue
      const versionDir = join(PROTOTYPES, taskId, version)
      const componentsDir = join(versionDir, 'components')
      const components = existsSync(componentsDir) ? readdirSync(componentsDir).filter((name) => name.endsWith('.vue')).map((name) => join(componentsDir, name)) : []
      const items = []
      for (const file of [join(versionDir, 'index.vue'), ...components]) {
         if (!existsSync(file) || readProposal(file)) continue
         const styleLines = [...readFileSync(file, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].reduce((total, match) => total + match[1].trim().split('\n').length, 0)
         const isLocalComponent = file !== join(versionDir, 'index.vue')
         if (!styleLines && !isLocalComponent) continue
         // Same name as a blueprint component: an enhanced copy, to compare with the original
         const original = isLocalComponent ? known.get(toKebab(basename(file, '.vue'))) : null
         const kind = original ? ` (rehausse ${original.file})` : isLocalComponent ? ' (créé)' : ''
         items.push(`${basename(file)}${kind}${styleLines ? `: ${styleLines} ligne(s) de style` : ''}`)
      }
      if (!items.length) continue
      found = true
      console.log(`${taskId}/${version}`)
      for (const item of items) console.log(`   - ${item}`)
      console.log('')
   }
   if (!found) console.log('  Aucun.\n')
}

function showComponents(all) {
   const known = catalogMap(buildCatalog())
   const groups = groupProposals()
      .map((group) => ({ ...group, promoted: known.has(group.tag) }))
      .filter((group) => all || !group.promoted)
      .sort((a, b) => b.tasks.length - a.tasks.length || a.tag.localeCompare(b.tag))

   console.log('Composants proposés\n')
   if (!groups.length) {
      console.log(all ? '  Aucun.\n' : '  Aucun en attente. (--all pour voir aussi ceux déjà promus)\n')
      return
   }

   for (const group of groups) {
      const tier = group.header ? `${group.header.tier}${group.header.object ? ` · ${group.header.object}` : ''}` : 'sans en-tête'
      const status = group.promoted ? ' (déjà dans blueprint/ez)' : ''
      console.log(`<${group.tag}>  ${tier}  ·  ${group.tasks.length} tâche(s)${status}`)
      if (group.header?.reason) console.log(`   ${group.header.reason}`)
      for (const occurrence of group.occurrences) console.log(`   - ${occurrence.taskId}/${occurrence.version}`)
      const latest = group.occurrences.at(-1)
      if (!group.promoted) console.log(`   Promouvoir: pnpm proto promote ${latest.taskId} ${latest.version} ${group.name}`)
      console.log('')
   }
}

/** « Signalements » of every version's notes.md, grouped by kind. */
function showReports() {
   const reports = new Map()
   for (const taskId of listDirs(PROTOTYPES)) {
      for (const version of listVersions(taskId)) {
         const file = join(PROTOTYPES, taskId, version, 'notes.md')
         if (!existsSync(file)) continue
         for (const { kind, text } of readReports(readFileSync(file, 'utf8'))) {
            const list = reports.get(kind) ?? []
            list.push(`${text}  (${taskId}/${version})`)
            reports.set(kind, list)
         }
      }
   }

   console.log('Signalements (notes.md)\n')
   if (!reports.size) {
      console.log('  Aucun.')
      return
   }
   for (const [kind, items] of reports) {
      console.log(`${kind}`)
      for (const item of items) console.log(`   - ${item}`)
      console.log('')
   }
}
