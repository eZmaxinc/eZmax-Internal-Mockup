/**
 * pnpm proto proposals [--all]
 * What prototypes ask of the blueprint, for the team to decide:
 *   - components proposed in prototypes (components/ of a version), most requested first
 *   - reports written in notes.md: « Bug primitive: … », « Mock manquant: … », « Composant manquant: … »
 * --all also shows the components already promoted into blueprint/ez.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROTOTYPES, listDirs, listVersions, parseArgs } from '../lib.mjs'
import { buildCatalog, catalogMap } from '../catalog-lib.mjs'
import { groupProposals } from '../proposals-lib.mjs'

const REPORT = /^\s*[-*]?\s*(Bug primitive|Mock manquant|Composant manquant)\s*:\s*(.+)$/

export async function run(argv) {
   const { flags } = parseArgs(argv)
   showComponents(Boolean(flags.all))
   showReports()
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
         for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
            const match = line.match(REPORT)
            if (!match) continue
            const list = reports.get(match[1]) ?? []
            list.push(`${match[2].trim()}  (${taskId}/${version})`)
            reports.set(match[1], list)
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
