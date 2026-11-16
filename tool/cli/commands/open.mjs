/**
 * yarn proto open [tâche] [version] [--scenario <nom>] [--print]
 *
 * In a terminal: opens the shell in the system browser, starting the dev server first if needed.
 * For an agent (no terminal, or --print): never starts anything, prints the URL to open in the agent's
 * own browser (Cursor's browser, Claude's browser pane…). It is the shell, the page the user looks at
 * too: the scenario, the theme and the width are parameters of its address.
 */
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { DEV_PORT, ROOT, fail, findTask, flagString, isInteractive, listVersions, parseArgs, readMeta, taskFromCwd } from '../lib.mjs'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   const taskId = positional[0] ? findTask(positional[0]) : taskFromCwd()
   const versions = taskId ? listVersions(taskId) : []
   const meta = taskId ? readMeta(taskId) : null
   const version = positional[1] ?? (taskId ? (versions.includes(meta.chosen) ? meta.chosen : versions.at(-1)) : undefined)
   const scenario = flagString(flags, 'scenario')

   if (taskId && !versions.includes(version)) fail(`Version inconnue « ${version} ».`, `Versions: ${versions.join(', ')}`)

   const origin = `http://localhost:${DEV_PORT}`
   const query = scenario ? `?scenario=${encodeURIComponent(scenario)}` : ''
   const shellPath = taskId ? `/#/p/${taskId}/${version}${query}` : '/'
   const serverUp = await isServerUp(origin)

   if (!isInteractive || flags.print) {
      console.log(`Shell: ${origin}${shellPath}`)
      if (taskId) console.log('       Paramètres de l\'adresse: ?scenario=<nom de mocks.ts>&theme=dark&width=mobile (ou tablet, desktop)')
      if (!serverUp) fail(`Le shell ne tourne pas sur ${origin}.`, 'Le lancer en arrière-plan: yarn dev')
      return
   }

   if (serverUp) {
      openBrowser(`${origin}${shellPath}`)
      console.log(`✓ Ouvert: ${origin}${shellPath}`)
      return
   }

   console.log(`Démarrage du shell sur ${origin} (Ctrl+C pour arrêter)…`)
   const vite = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
   const child = spawn(process.execPath, [vite, '--config', 'tool/vite.config.ts', '--open', shellPath], { cwd: ROOT, stdio: 'inherit' })
   child.on('exit', (code) => process.exit(code ?? 0))
}

async function isServerUp(origin) {
   try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(800) })
      return response.ok
   }
   catch {
      return false
   }
}

function openBrowser(url) {
   const [command, args] = process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '""', url.replaceAll('&', '^&')]]
      : [process.platform === 'darwin' ? 'open' : 'xdg-open', [url]]
   spawn(command, args, { stdio: 'ignore', detached: true }).unref()
}
