import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync } from 'node:fs'
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
            const valid = /^[\w-]+$/.test(task) && /^v\d{3}$/.test(version)

            if (!valid) {
               res.statusCode = 400
               res.end('Invalid task or version')
               return
            }

            const result = spawnSync(process.execPath, [join(TOOL, 'cli', 'mockup.mjs'), 'export', task, version, '--quiet'], {
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
 * the dev server runs (yarn mockup new / iterate) stays « Introuvable » until a restart: the registry's
 * import.meta.glob never hears about the new files.
 */
function watchContentFolders(): Plugin {
   return {
      name: 'ez-proto-watch-content',
      apply: 'serve',
      configureServer(server) {
         server.watcher.add([PROTOTYPES, BLUEPRINT])
      },
      /**
       * Tailwind does not scan a folder created after the server started: a utility used for the first
       * time in a new prototype (mt-6) generated nothing until a restart. Rebuilding the stylesheet with
       * every saved .vue of prototypes/ makes it look again.
       */
      handleHotUpdate({ file, modules, server }) {
         if (!file.endsWith('.vue') || !file.includes('/prototypes/')) return
         const styles = [...server.moduleGraph.idToModuleMap.values()].filter((module) => module.file?.endsWith('/tool/app.css'))
         return styles.length ? [...modules, ...styles] : undefined
      },
   }
}

/** Drops the registry module, whose import.meta.glob lists are then rebuilt from the disk, and reloads the pages. */
function reloadRegistry(server: ViteDevServer): number {
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
   return dropped
}

/**
 * POST /__proto/status?task=<task>&status=<status>[&version=<version>] — the shell's « Retenir cette version »
 * button. The team decision is a click of the human, not a request to the agent: it runs `mockup status`, which
 * writes meta.json, then reloads the shell.
 */
function protoStatusEndpoint(): Plugin {
   return {
      name: 'ez-proto-status-endpoint',
      apply: 'serve',
      configureServer(server) {
         server.middlewares.use('/__proto/status', (req, res) => {
            const url = new URL(req.url ?? '', 'http://localhost')
            const task = url.searchParams.get('task') ?? ''
            const status = url.searchParams.get('status') ?? ''
            const version = url.searchParams.get('version') ?? ''
            const valid = req.method === 'POST' && /^[\w-]+$/.test(task) && /^(draft|review|chosen|archived)$/.test(status) && /^(v\d{3})?$/.test(version)

            if (!valid) {
               res.statusCode = 400
               res.end('Invalid task, status or version')
               return
            }

            const result = spawnSync(process.execPath, [join(TOOL, 'cli', 'mockup.mjs'), 'status', task, status, ...(version ? [version] : [])], {
               cwd: ROOT,
               encoding: 'utf8',
            })
            if (result.status !== 0) {
               res.statusCode = 500
               res.end(result.stderr || result.stdout || 'Status failed')
               return
            }

            reloadRegistry(server)
            res.end(result.stdout)
         })
      },
   }
}

/**
 * GET /__proto/refresh?dir=<task>[/<version>] — called by `mockup new` and `mockup iterate` right after they
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
            if (!/^[\w-]+(\/v\d{3})?$/.test(dir) || !existsSync(join(PROTOTYPES, dir))) {
               res.statusCode = 400
               res.end('{"ok":false}')
               return
            }

            res.end(JSON.stringify({ ok: true, registry: reloadRegistry(server) }))
         })
      },
   }
}

/**
 * GitHub Pages serves 404.html on unknown paths: copying index.html lets HTML5 history routes
 * (/mockup/<slug>, /p/<task>/<version>, /?home=true) load directly without `#` in the URL.
 */
function spaFallback404(): Plugin {
   return {
      name: 'ez-proto-spa-404',
      closeBundle() {
         const outDir = join(ROOT, 'dist')
         const indexFile = join(outDir, 'index.html')
         if (existsSync(indexFile)) {
            copyFileSync(indexFile, join(outDir, '404.html'))
         }
      },
   }
}

const rawBasePath = process.env.VITE_BASE_PATH?.trim()
const basePath = rawBasePath ? (rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`) : '/'

export default defineConfig({
   root: TOOL,
   base: basePath,
   plugins: [vue(), tailwindcss(), protoExportEndpoint(), protoRefreshEndpoint(), protoStatusEndpoint(), watchContentFolders(), spaFallback404()],
   resolve: { alias: aliases },
   server: {
      port: DEV_PORT,
      // One shell at a time: a second `yarn dev` says the port is taken instead of starting on 5181,
      // where nobody looks (an agent then tests an old server, or starts a third one).
      strictPort: true,
      fs: { allow: [ROOT] },
      // PROTO_POLL=1 yarn dev — for a drive that sends no file events at all (edits never show up)
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
