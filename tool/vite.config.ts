import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
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

/**
 * GET /__proto/refresh?dir=<task>[/<version>] — called by `proto new` and `proto iterate` right after they
 * write files. On some drives (network, mapped or aliased ones) the watcher never hears about a new folder,
 * or hears it under another drive letter than the one Vite knows the files by. So this does not go through
 * the watcher: it drops the registry module, whose import.meta.glob lists are then rebuilt from the disk,
 * and reloads the pages. The new version shows up without restarting the server.
 */
function protoRefreshEndpoint(): Plugin {
   return {
      name: 'ez-proto-refresh-endpoint',
      apply: 'serve',
      configureServer(server) {
         server.middlewares.use('/__proto/refresh', (req, res) => {
            const dir = new URL(req.url ?? '', 'http://localhost').searchParams.get('dir') ?? ''

            res.setHeader('Content-Type', 'application/json')
            if (!/^[\w-]+(\/v\d{3}[a-z]?)?$/.test(dir) || !existsSync(join(PROTOTYPES, dir))) {
               res.statusCode = 400
               res.end('{"ok":false}')
               return
            }

            // Matched by the end of the path: the drive letter in a module id is not always the one of ROOT
            let dropped = 0
            for (const environment of Object.values(server.environments)) {
               for (const module of environment.moduleGraph.idToModuleMap.values()) {
                  if (!module.file?.endsWith('/tool/registry.ts')) continue
                  environment.moduleGraph.invalidateModule(module)
                  dropped++
               }
            }
            server.ws.send({ type: 'full-reload' })
            res.end(JSON.stringify({ ok: true, registry: dropped }))
         })
      },
   }
}

export default defineConfig({
   root: TOOL,
   plugins: [vue(), tailwindcss(), protoExportEndpoint(), protoRefreshEndpoint(), watchContentFolders()],
   resolve: { alias: aliases },
   server: {
      port: DEV_PORT,
      // One shell at a time: a second `pnpm dev` says the port is taken instead of starting on 5181,
      // where nobody looks (an agent then tests an old server, or starts a third one).
      strictPort: true,
      fs: { allow: [ROOT] },
      // PROTO_POLL=1 pnpm dev — for a drive that sends no file events at all (edits never show up)
      watch: process.env.PROTO_POLL ? { usePolling: true, interval: 300 } : undefined,
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
