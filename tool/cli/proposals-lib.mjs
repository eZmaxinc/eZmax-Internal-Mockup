/**
 * Component proposals: mockups/<task>/<version>/components/Ez*.vue with a header
 *   <!-- @proposal domain folder: why it exists -->
 */
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { MOCKUPS, listDirs, listVersions } from './lib.mjs'
import { readProposal, toKebab } from './catalog-lib.mjs'

/** Every proposal file, with its task, version and header. */
export function listProposalFiles() {
   const proposals = []
   for (const taskId of listDirs(MOCKUPS)) {
      for (const version of listVersions(taskId)) {
         const dir = join(MOCKUPS, taskId, version, 'components')
         if (!existsSync(dir)) continue
         for (const name of readdirSync(dir).filter((file) => file.endsWith('.vue'))) {
            const file = join(dir, name)
            const name_ = name.replace(/\.vue$/, '')
            proposals.push({ taskId, version, file, name: name_, tag: toKebab(name_), header: readProposal(file) })
         }
      }
   }
   return proposals
}

/** Grouped by component tag: where it is proposed, and the latest header. */
export function groupProposals(files = listProposalFiles()) {
   const groups = new Map()
   for (const proposal of files) {
      const group = groups.get(proposal.tag) ?? { tag: proposal.tag, name: proposal.name, occurrences: [], header: null }
      group.occurrences.push({ taskId: proposal.taskId, version: proposal.version, file: proposal.file })
      group.header = proposal.header ?? group.header
      groups.set(proposal.tag, group)
   }
   return [...groups.values()].map((group) => ({ ...group, tasks: [...new Set(group.occurrences.map((item) => item.taskId))] }))
}
