/**
 * pnpm proto status <tâche> <draft|review|chosen|archived> [version]
 * `chosen` needs the retained version: pnpm proto status 49198 chosen v002
 * `draft` and `review` take the decision back: the task has no retained version any more.
 */
import { STATUSES, STATUS_LABELS, fail, findTask, listVersions, parseArgs, readMeta, writeMeta } from '../lib.mjs'

const USAGE = `Usage: pnpm proto status <tâche> <${STATUSES.join('|')}> [version]`

export async function run(argv) {
   const { positional } = parseArgs(argv)
   const [taskInput, status, version] = positional
   if (!taskInput || !status) fail('Tâche et statut requis.', USAGE)
   if (!STATUSES.includes(status)) fail(`Statut inconnu « ${status} ».`, USAGE)

   const taskId = findTask(taskInput)
   const meta = readMeta(taskId)
   const versions = listVersions(taskId)

   if (status === 'chosen' && !version) fail('Indiquer la version retenue.', `Ex.: pnpm proto status ${taskInput} chosen ${versions.at(-1) ?? 'v001'}`)
   if (version && !versions.includes(version)) fail(`Version inconnue « ${version} ».`, `Versions: ${versions.join(', ')}`)

   meta.status = status
   if (version) meta.chosen = version
   // Back to draft or to review, the decision is taken back: no version is retained any more
   else if (status === 'draft' || status === 'review') meta.chosen = null
   writeMeta(taskId, meta)

   console.log(`✓ ${taskId}: ${STATUS_LABELS[status]}${meta.chosen ? `, version retenue ${meta.chosen}` : ''}`)
}
