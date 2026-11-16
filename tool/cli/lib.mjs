/**
 * Shared helpers for the `proto` CLI: paths, arguments, prompts, task lookup.
 * Code in English; everything the user reads is in French.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { DEV_PORT, PATTERNS, PROTOTYPES, ROOT } from '../paths.mjs'

export * from '../paths.mjs'

export const VERSION_PATTERN = /^v(\d{3})([a-z]?)$/
export const STATUSES = ['draft', 'review', 'chosen', 'archived']
export const STATUS_LABELS = { draft: 'brouillon', review: 'en revue', chosen: 'retenu', archived: 'archivé' }
export const GOODDAY_URL = /^https?:\/\/(?:www\.)?goodday\.work\/t\/([A-Za-z0-9]+)\/?$/
export const GOODDAY_NUMBER = /^#?(\d+)$/
/** Task folder: GoodDay number + slug, like the branch (feature/49198-la-tache → 49198-la-tache) */
export const TASK_FOLDER = /^(\d+)-[a-z0-9]+(?:-[a-z0-9]+)*$/
export const DEMO_FOLDER = /^demo-[a-z0-9]+(?:-[a-z0-9]+)*$/

/* ───────────── Output ───────────── */

export function fail(message, hint) {
   console.error(`✗ ${message}`)
   if (hint) console.error(`  ${hint}`)
   process.exit(1)
}

export const rel = (path) => relative(ROOT, path).replaceAll('\\', '/')

/* ───────────── Arguments ───────────── */

const SHORT_FLAGS = { m: 'message', h: 'help' }

/** `a b --flag value --bool -m "msg" --key=value` → { positional, flags } */
export function parseArgs(argv) {
   const positional = []
   const flags = {}
   for (let index = 0; index < argv.length; index++) {
      const arg = argv[index]
      const short = arg.match(/^-([a-z])$/)
      if (arg.startsWith('--') || short) {
         let key = short ? SHORT_FLAGS[short[1]] ?? short[1] : arg.slice(2)
         let value
         if (key.includes('=')) [key, value] = [key.slice(0, key.indexOf('=')), key.slice(key.indexOf('=') + 1)]
         else if (argv[index + 1] !== undefined && !argv[index + 1].startsWith('-')) value = argv[++index]
         flags[key] = value ?? true
      }
      else positional.push(arg)
   }
   return { positional, flags }
}

export const flagString = (flags, key) => (typeof flags[key] === 'string' ? flags[key] : undefined)

/* ───────────── Prompts (only in an interactive terminal) ───────────── */

export const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY)

/** Asks until `validate` returns true (or a string → error message). Returns the default on empty input. */
export async function ask(question, { initial, validate } = {}) {
   const readline = createInterface({ input: process.stdin, output: process.stdout })
   try {
      for (;;) {
         const answer = (await readline.question(`? ${question}${initial ? ` (${initial})` : ''}: `)).trim() || initial || ''
         const verdict = validate ? validate(answer) : Boolean(answer)
         if (verdict === true) return answer
         console.log(`  ${typeof verdict === 'string' ? verdict : 'Réponse requise.'}`)
      }
   }
   finally {
      readline.close()
   }
}

/** Numbered choice. options: [{ value, label }] */
export async function choose(question, options, initialIndex = 0) {
   console.log(`? ${question}`)
   options.forEach((option, index) => console.log(`  ${index + 1}. ${option.label}`))
   const answer = await ask('Numéro', {
      initial: String(initialIndex + 1),
      validate: (value) => (Number(value) >= 1 && Number(value) <= options.length) || `Entre 1 et ${options.length}.`,
   })
   return options[Number(answer) - 1].value
}

/* ───────────── Files ───────────── */

export function listDirs(path) {
   if (!existsSync(path)) return []
   return readdirSync(path).filter((name) => statSync(join(path, name)).isDirectory()).sort()
}

export function listVersions(taskId) {
   return listDirs(join(PROTOTYPES, taskId)).filter((name) => VERSION_PATTERN.test(name))
}

export const listPatterns = () => listDirs(PATTERNS)

export function readMeta(taskId) {
   return JSON.parse(readFileSync(join(PROTOTYPES, taskId, 'meta.json'), 'utf8'))
}

export function writeMeta(taskId, meta) {
   writeFileSync(join(PROTOTYPES, taskId, 'meta.json'), `${JSON.stringify(meta, null, 3)}\n`)
}

/** All tasks with a readable meta.json, most recent first. */
export function listTasks() {
   return listDirs(PROTOTYPES)
      .map((id) => {
         try {
            return { id, meta: readMeta(id), versions: listVersions(id) }
         }
         catch {
            return null
         }
      })
      .filter(Boolean)
      .sort((a, b) => (b.meta.created ?? '').localeCompare(a.meta.created ?? '') || (b.meta.goodday?.number ?? 0) - (a.meta.goodday?.number ?? 0))
}

/** Reads the `--- key: value ---` header of a notes.md. */
export function readNotesHeader(taskId, versionId) {
   const file = join(PROTOTYPES, taskId, versionId, 'notes.md')
   if (!existsSync(file)) return {}
   const match = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)
   return Object.fromEntries((match?.[1] ?? '').split(/\r?\n/).map((line) => {
      const index = line.indexOf(':')
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
   }).filter(([key]) => key))
}

/* ───────────── Task lookup ───────────── */

/** Task folder containing the directory the command was launched from (yarn sets INIT_CWD). */
export function taskFromCwd() {
   const cwd = process.env.INIT_CWD ?? process.cwd()
   const path = relative(PROTOTYPES, cwd)
   if (!path || path.startsWith('..')) return null
   const [taskId] = path.split(sep)
   return existsSync(join(PROTOTYPES, taskId, 'meta.json')) ? taskId : null
}

/**
 * Finds a task from what a person would type: the folder name, the GoodDay number (49198 or #49198),
 * the GoodDay link or its short id (M2nSjU), or a unique part of the folder name.
 */
export function findTask(input) {
   const tasks = listTasks()
   const value = input.trim()
   if (tasks.some((task) => task.id === value)) return value

   const number = value.match(GOODDAY_NUMBER)?.[1]
   const shortId = value.match(GOODDAY_URL)?.[1] ?? (/^[A-Za-z0-9]{5,8}$/.test(value) ? value : null)

   let matches = []
   if (number) matches = tasks.filter((task) => task.meta.goodday?.number === Number(number) || task.id.startsWith(`${number}-`))
   if (!matches.length && shortId) matches = tasks.filter((task) => task.meta.goodday?.url?.match(GOODDAY_URL)?.[1] === shortId)
   if (!matches.length) matches = tasks.filter((task) => task.id.includes(value.toLowerCase()))

   if (matches.length === 1) return matches[0].id
   if (matches.length > 1) fail(`« ${value} » correspond à plusieurs tâches: ${matches.map((task) => task.id).join(', ')}`)
   fail(`Aucune tâche ne correspond à « ${value} ».`, 'Voir les tâches: yarn proto list')
}

/** Task from the argument, else from the current folder, else asked (interactive), else an error. */
export async function resolveTask(input, usage) {
   if (input) return findTask(input)
   const fromCwd = taskFromCwd()
   if (fromCwd) return fromCwd

   const tasks = listTasks().filter((task) => task.meta.status !== 'archived')
   if (!tasks.length) fail('Aucune tâche.', 'Créer: yarn proto new')
   if (!isInteractive) fail('Tâche manquante.', usage)

   return choose('Quelle tâche?', tasks.slice(0, 15).map((task) => ({ value: task.id, label: taskLabel(task) })))
}

export function taskLabel(task) {
   const ref = task.meta.goodday ? `#${task.meta.goodday.number}` : 'démo'
   return `${ref.padEnd(7)} ${task.meta.title} (${task.versions.at(-1) ?? 'aucune version'})`
}

/* ───────────── Misc ───────────── */

export function slugify(text, maxLength = 48) {
   const slug = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
   if (slug.length <= maxLength) return slug
   return slug.slice(0, maxLength).replace(/-[^-]*$/, '')
}

export function today() {
   const now = new Date()
   const pad = (value) => String(value).padStart(2, '0')
   return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function gitUserName() {
   const result = spawnSync('git', ['config', 'user.name'], { encoding: 'utf8' })
   return (result.status === 0 && result.stdout.trim()) || process.env.USERNAME || process.env.USER || ''
}

export function normalizeGoodDayUrl(value) {
   const id = value.match(GOODDAY_URL)?.[1]
   return id ? `https://www.goodday.work/t/${id}` : null
}

/**
 * Tells the running shell that files were just written under prototypes/<dir>, so they show up without a
 * restart even where the file watcher is deaf. Silent when no shell runs; says so when the shell that
 * answers is too old to know the endpoint (started before an update: it must be restarted).
 */
export async function notifyDevServer(dir) {
   const origin = `http://localhost:${DEV_PORT}`
   try {
      const response = await fetch(`${origin}/__proto/refresh?dir=${encodeURIComponent(dir)}`, { signal: AbortSignal.timeout(1500) })
      const answer = response.ok ? await response.json().catch(() => null) : null
      if (answer?.ok) console.log(`  Shell prévenu (${origin}): la version est visible sans le relancer.`)
      else console.log(`  ⚠ Le shell sur ${origin} date d'avant une mise à jour: l'arrêter et relancer yarn dev.`)
   }
   catch {
      // No shell running: nothing to tell
   }
}
