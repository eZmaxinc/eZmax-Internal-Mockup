/**
 * pnpm proto diff [tâche] [avant] [après] [--stat]
 * Default: the latest version against the one it was based on (notes.md → based_on).
 */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { PROTOTYPES, fail, listVersions, parseArgs, readNotesHeader, rel, resolveTask } from '../lib.mjs'

const USAGE = 'Usage: pnpm proto diff <tâche> [avant] [après]'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   // "diff v001 v002" from inside the task folder: no task argument
   const startsWithVersion = /^v\d{3}[a-z]?$/.test(positional[0] ?? '')
   const taskId = await resolveTask(startsWithVersion ? undefined : positional[0], USAGE)
   const [before, after] = startsWithVersion ? positional : positional.slice(1)

   const versions = listVersions(taskId)
   const target = after ?? versions.at(-1)
   const basedOn = readNotesHeader(taskId, target).based_on
   const from = before ?? (versions.includes(basedOn) ? basedOn : versions[versions.indexOf(target) - 1])

   for (const version of [from, target]) {
      if (!versions.includes(version)) fail(`Version inconnue « ${version ?? '?'} ».`, `Versions: ${versions.join(', ')}`)
   }
   if (from === target) fail('Deux versions différentes requises.', USAGE)

   const [fromDir, toDir] = [from, target].map((version) => rel(join(PROTOTYPES, taskId, version)))
   console.log(`${taskId}: ${from} → ${target}\n`)

   const result = spawnSync('git', ['diff', '--no-index', '--color=auto', ...(flags.stat ? ['--stat'] : []), '--', fromDir, toDir], {
      cwd: join(PROTOTYPES, '..'),
      stdio: 'inherit',
   })
   if (result.error) fail('git est introuvable: il sert à afficher les différences.')
   // git diff --no-index exits with 1 when the folders differ
   if (result.status === 0) console.log('Aucune différence.')
}
