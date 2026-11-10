import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { spawnSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { BLUEPRINT, DEV_PORT, PROTOTYPES, ROOT, TOOL, aliases } from './paths.mjs'

/**
 * Dev-only endpoint used by the shell's "Export HTML" button.
 * GET /__proto/export?task=<task>&version=<version> → single-file HTML download.
 */
function protoExportEndpoint(): Plugin {
   return {
      name: 'ez-proto-export-endpoint',
      apply: 'serve',
      configureServer(server) {
         server.middlewares.use('/__proto/export', (req, res) => {
            const url = new URL(req.url ?? '', 'http://localhost')
            const task = url.searchParams.get('task') ?? ''
            const version = url.searchParams.get('version') ?? ''
            const valid = /^[\w-]+$/.test(task) && /^v\d{3}[a-z]?$/.test(version)

            if (!valid) {
               res.statusCode = 400
               res.end('Invalid task or version')
               return
            }

            const result = spawnSync(process.execPath, [join(TOOL, 'cli', 'proto.mjs'), 'export', task, version, '--quiet'], {
               cwd: ROOT,
               encoding: 'utf8',
            })
            const file = result.stdout.trim().split('\n').pop() ?? ''

            if (result.status !== 0 || !existsSync(file)) {
               res.statusCode = 500
               res.end(result.stderr || 'Export failed')
               return
            }

            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.setHeader('Content-Disposition', `attachment; filename="${basename(file)}"`)
            res.end(readFileSync(file))
         })
      },
   }
}

/**
 * Vite's root is tool/, so by default it only watches tool/. Without this, a prototype created while
 * the dev server runs (pnpm proto new / iterate) stays « Introuvable » until a restart: the registry's
 * import.meta.glob never hears about the new files.
 */
function watchContentFolders(): Plugin {
   return {
      name: 'ez-proto-watch-content',
      apply: 'serve',
      configureServer(server) {
         server.watcher.add([PROTOTYPES, BLUEPRINT])
      },
   }
}

export default defineConfig({
   root: TOOL,
   plugins: [vue(), tailwindcss(), protoExportEndpoint(), watchContentFolders()],
   resolve: { alias: aliases },
   server: {
      port: DEV_PORT,
      fs: { allow: [ROOT] },
   },
   build: {
      outDir: join(ROOT, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
         input: {
            shell: join(TOOL, 'index.html'),
            frame: join(TOOL, 'frame.html'),
         },
      },
   },
})
