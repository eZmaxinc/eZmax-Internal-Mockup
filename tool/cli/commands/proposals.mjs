/**
 * pnpm proto proposals [--all]
 * Components proposed in prototypes (components/ of a version), most requested first.
 * --all also shows the ones already promoted into blueprint/ez.
 */
import { parseArgs } from '../lib.mjs'
import { buildCatalog, catalogMap } from '../catalog-lib.mjs'
import { groupProposals } from '../proposals-lib.mjs'

export async function run(argv) {
   const { flags } = parseArgs(argv)
   const known = catalogMap(buildCatalog())
   const groups = groupProposals()
      .map((group) => ({ ...group, promoted: known.has(group.tag) }))
      .filter((group) => flags.all || !group.promoted)
      .sort((a, b) => b.tasks.length - a.tasks.length || a.tag.localeCompare(b.tag))

   if (!groups.length) {
      console.log(flags.all ? 'Aucune proposition.' : 'Aucune proposition en attente. (--all pour voir aussi celles déjà promues)')
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
