/**
 * pnpm proto list [--status review] [--mine] [--all]
 * Archived tasks are hidden unless --all or --status archived.
 */
import { STATUSES, STATUS_LABELS, fail, flagString, gitUserName, listTasks, parseArgs } from '../lib.mjs'

export async function run(argv) {
   const { flags } = parseArgs(argv)
   const status = flagString(flags, 'status')
   if (status && !STATUSES.includes(status)) fail(`Statut inconnu « ${status} ».`, `Statuts: ${STATUSES.join(', ')}`)

   const me = flags.mine ? gitUserName() : null
   const tasks = listTasks().filter((task) => (status ? task.meta.status === status : flags.all || task.meta.status !== 'archived'))
      .filter((task) => !me || task.meta.owner === me)

   if (!tasks.length) {
      console.log('Aucune tâche.')
      return
   }

   const rows = tasks.map((task) => [
      task.meta.goodday ? `#${task.meta.goodday.number}` : 'démo',
      STATUS_LABELS[task.meta.status] ?? task.meta.status ?? '?',
      task.versions.at(-1) ?? '—',
      task.meta.chosen ?? '—',
      task.meta.owner || '—',
      task.meta.title,
      task.id,
   ])
   const header = ['GoodDay', 'Statut', 'Dernière', 'Retenue', 'Responsable', 'Titre', 'Dossier']
   const widths = header.map((title, index) => Math.max(title.length, ...rows.map((row) => row[index].length)))
   const line = (cells) => cells.map((cell, index) => (index === cells.length - 1 ? cell : cell.padEnd(widths[index]))).join('  ')

   console.log(line(header))
   console.log(line(widths.map((width) => '─'.repeat(width))))
   rows.forEach((row) => console.log(line(row)))
}
