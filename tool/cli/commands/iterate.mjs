/**
 * yarn mockup iterate [tâche] [-m "Résumé"] [--from v001]
 *   default      → v(max+1), copied from the latest version
 *   --from v001  → copy that version instead of the latest (a variant: still v(max+1), notes.md says based_on)
 * Never edit a previous version: this copies it, the new folder is the one to change.
 */
import { cpSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROTOTYPES, VERSION_PATTERN, ask, fail, flagString, isInteractive, listVersions, notifyDevServer, parseArgs, resolveTask, today } from '../lib.mjs'

const USAGE = 'Usage: yarn mockup iterate <tâche> -m "Résumé" [--from v001]'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   const taskId = await resolveTask(positional[0], USAGE)
   const versions = listVersions(taskId)
   if (!versions.length) fail(`${taskId} n'a aucune version.`)

   if (flags.variant) fail('Plus de --variant: une variante est la version suivante, son résumé commence par « Variante: ».', 'yarn mockup iterate <tâche> -m "Variante: …" [--from vNNN]')

   const source = flagString(flags, 'from') ?? versions.at(-1)
   if (!versions.includes(source)) fail(`Version inconnue « ${source} ».`, `Versions: ${versions.join(', ')}`)

   let summary = flagString(flags, 'message') ?? positional[1]
   if (!summary && isInteractive) summary = await ask('Résumé du changement, en une phrase')
   summary ||= 'TODO: résumer le changement en une phrase.'

   const max = Math.max(...versions.map((version) => Number(version.match(VERSION_PATTERN)[1])))
   const target = `v${String(max + 1).padStart(3, '0')}`

   const targetDir = join(PROTOTYPES, taskId, target)
   cpSync(join(PROTOTYPES, taskId, source), targetDir, {
      recursive: true,
      filter: (path) => !path.endsWith('notes.md'),
   })

   writeFileSync(join(targetDir, 'notes.md'), [
      '---',
      `based_on: ${source}`,
      `date: ${today()}`,
      '---',
      summary,
      '',
   ].join('\n'))

   console.log(`✓ Version créée: prototypes/${taskId}/${target} (copie de ${source})`)
   console.log(`  Fichiers: ${readdirSync(targetDir).join(', ')}`)
   console.log('')
   console.log(`  Ensuite: modifier ${target}/ seulement (jamais ${source}/), tenir ${target}/notes.md à jour (résumé, signalements et questions nouveaux),`)
   console.log(`  puis yarn mockup check ${taskId}`)
   await notifyDevServer(`${taskId}/${target}`)
}
