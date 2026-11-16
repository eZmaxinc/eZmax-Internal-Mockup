/**
 * Exports one prototype version as a single self-contained, interactive HTML file.
 *   yarn proto export [tâche] [version] [--quiet]    (default version: the chosen one, else the latest)
 * Output: exports/<tâche>-<version>.html
 */
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { EXPORTS, PROTOTYPES, ROOT, TOOL, aliases, fail, listVersions, parseArgs, readMeta, resolveTask } from '../lib.mjs'

const USAGE = 'Usage: yarn proto export <tâche> [version]'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   const taskId = await resolveTask(positional[0], USAGE)
   const versions = listVersions(taskId)
   const meta = readMeta(taskId)
   const versionId = positional[1] ?? (versions.includes(meta.chosen) ? meta.chosen : versions.at(-1))

   if (!versions.includes(versionId)) fail(`Version inconnue « ${versionId} » pour ${taskId}.`, `Versions: ${versions.join(', ')}`)

   const folder = join(PROTOTYPES, taskId, versionId).replaceAll('\\', '/')
   const hasMocks = existsSync(join(folder, 'mocks.ts'))
   const label = `${meta.title} · ${versionId}`

   const VIRTUAL_ID = 'virtual:ez-proto-target'
   const targetPlugin = {
      name: 'ez-proto-target',
      resolveId: (id) => (id === VIRTUAL_ID ? `\0${VIRTUAL_ID}` : null),
      load: (id) => {
         if (id !== `\0${VIRTUAL_ID}`) return null
         return [
            `import component from ${JSON.stringify(`${folder}/index.vue`)}`,
            hasMocks
               ? `import { scenarios } from ${JSON.stringify(`${folder}/mocks.ts`)}`
               : 'const scenarios = { default: () => ({}) }',
            `export default { component, scenarios, chrome: ${JSON.stringify(meta.chrome ?? 'app')}, label: ${JSON.stringify(label)} }`,
         ].join('\n')
      },
   }

   const outDir = join(ROOT, 'node_modules', '.ez-proto-export')

   await build({
      configFile: false,
      root: TOOL,
      logLevel: flags.quiet ? 'silent' : 'warn',
      plugins: [vue(), tailwindcss(), viteSingleFile(), targetPlugin],
      resolve: { alias: aliases },
      build: {
         outDir,
         emptyOutDir: true,
         rollupOptions: { input: join(TOOL, 'export.html') },
      },
   })

   mkdirSync(EXPORTS, { recursive: true })
   const output = join(EXPORTS, `${taskId}-${versionId}.html`)
   copyFileSync(join(outDir, 'export.html'), output)

   if (!flags.quiet) console.log(`✓ Exporté: ${taskId}/${versionId}`)
   console.log(output)
}
