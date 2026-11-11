/**
 * Guardrails for prototypes. Run before declaring a version done.
 *   pnpm proto check [tâche] [--no-types]
 * Errors (✗) fail the run; warnings (⚠) are printed only.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import {
   BLUEPRINT, DEMO_FOLDER, GOODDAY_URL, PATTERNS, PROTOTYPES, ROOT, STATUSES, STATUS_LABELS, TASK_FOLDER, TOOL, VERSION_PATTERN,
   findTask, listDirs, listVersions, parseArgs, readMeta, rel, taskFromCwd,
} from '../lib.mjs'
import { ALL_RENAMES, REMOVED_HINTS, renamePattern } from '../token-renames.mjs'
import { CHANGELOG_FILE, COMPONENT_FILE, SHARED_FILE, checkComponents, checkShared, definedColors } from '../tokens-lib.mjs'
import { buildCatalog, catalogMap, expectedFiles, extractComponent, readProposal, validateTemplate, validateTier } from '../catalog-lib.mjs'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   const onlyTask = positional[0] ? findTask(positional[0]) : taskFromCwd()

   const errors = []
   const warnings = []

   checkStructure(onlyTask, errors, warnings)
   checkTokenFiles(errors)

   const roots = onlyTask ? [join(PROTOTYPES, onlyTask)] : [PROTOTYPES, PATTERNS]
   const files = roots.flatMap(walk).filter((file) => /\.(vue|ts)$/.test(file))
   checkContent(files, errors, warnings)

   // Token names everywhere they are read: prototypes, patterns, ez- components, the tool
   const tokenRoots = onlyTask ? [join(PROTOTYPES, onlyTask)] : [PROTOTYPES, PATTERNS, join(BLUEPRINT, 'ez'), TOOL]
   const tokenFiles = tokenRoots.flatMap(walk).filter((file) => /\.(vue|ts|css)$/.test(file) && !file.includes(`${sep}blueprint${sep}tokens${sep}`) && !file.endsWith('palette-reset.css'))
   checkTokenNames(tokenFiles, errors)

   checkComponentsAndTemplates(onlyTask, errors, warnings)
   checkBlueprintUntouched(warnings)
   checkCommittedVersionsUntouched(onlyTask, warnings)

   for (const warning of warnings) console.warn(`⚠ ${warning}`)
   for (const error of errors) console.error(`✗ ${error}`)

   if (errors.length) {
      console.error(`\n✗ proto check: ${errors.length} erreur(s), ${warnings.length} avertissement(s)`)
      process.exit(1)
   }

   console.log(`✓ Règles: ${files.length} fichier(s) vérifié(s), ${warnings.length} avertissement(s)`)

   if (!flags['no-types']) {
      const vueTsc = join(ROOT, 'node_modules', 'vue-tsc', 'bin', 'vue-tsc.js')
      const result = spawnSync(process.execPath, [vueTsc, '--noEmit', '-p', 'tsconfig.json'], { cwd: ROOT, stdio: 'inherit' })
      if (result.status !== 0) {
         console.error('✗ Types: vue-tsc a échoué')
         process.exit(1)
      }
      console.log('✓ Types')
   }
}

/* ───────────── Structure ───────────── */

function checkStructure(onlyTask, errors, warnings) {
   const numbers = new Map()

   for (const taskId of listDirs(PROTOTYPES)) {
      const taskDir = join(PROTOTYPES, taskId)
      const where = rel(taskDir)

      let meta = null
      try {
         meta = JSON.parse(readFileSync(join(taskDir, 'meta.json'), 'utf8'))
      }
      catch (error) {
         errors.push(`${where}/meta.json: absent ou JSON invalide (${error.message})`)
         continue
      }

      // GoodDay numbers must be unique across all tasks, even when checking only one
      if (meta.goodday?.number) numbers.set(meta.goodday.number, [...(numbers.get(meta.goodday.number) ?? []), taskId])
      if (onlyTask && taskId !== onlyTask) continue

      if (meta.demo) {
         if (!DEMO_FOLDER.test(taskId)) errors.push(`${where}: une tâche de démo se nomme demo-<slug>`)
      }
      else {
         const folderNumber = taskId.match(TASK_FOLDER)?.[1]
         if (!folderNumber) errors.push(`${where}: le dossier se nomme <numéro GoodDay>-<slug>, comme la branche (ex. 49198-relance-signataires)`)

         if (!meta.goodday) errors.push(`${where}/meta.json: "goodday" est requis: { "number": 49198, "url": "https://www.goodday.work/t/…" }`)
         else {
            if (!Number.isInteger(meta.goodday.number)) errors.push(`${where}/meta.json: "goodday.number" doit être un nombre (49198, sans #)`)
            else if (folderNumber && Number(folderNumber) !== meta.goodday.number) errors.push(`${where}: le dossier commence par ${folderNumber} mais goodday.number vaut ${meta.goodday.number}`)
            if (!GOODDAY_URL.test(meta.goodday.url ?? '')) errors.push(`${where}/meta.json: "goodday.url" doit être un lien https://www.goodday.work/t/<id>`)
         }
      }

      if (!meta.title) errors.push(`${where}/meta.json: "title" est requis`)
      if (!STATUSES.includes(meta.status)) errors.push(`${where}/meta.json: "status" doit valoir ${STATUSES.join(', ')}`)
      if (meta.chosen && !listVersions(taskId).includes(meta.chosen)) errors.push(`${where}/meta.json: "chosen" pointe vers ${meta.chosen}, qui n'existe pas`)
      if (meta.status === 'chosen' && !meta.chosen) warnings.push(`${where}/meta.json: statut « chosen » sans version retenue (pnpm proto status ${taskId} chosen vXXX)`)

      for (const entry of listDirs(taskDir)) {
         if (!VERSION_PATTERN.test(entry)) {
            errors.push(`${rel(join(taskDir, entry))}: les versions se nomment v001, v002, v002b…`)
            continue
         }
         for (const file of ['index.vue', 'mocks.ts', 'notes.md']) {
            if (!existsSync(join(taskDir, entry, file))) errors.push(`${rel(join(taskDir, entry))}: ${file} est absent`)
         }
      }
   }

   for (const [number, taskIds] of numbers) {
      if (taskIds.length > 1 && (!onlyTask || taskIds.includes(onlyTask))) errors.push(`GoodDay #${number} est utilisé par plusieurs tâches: ${taskIds.join(', ')}`)
   }
}

/* ───────────── blueprint/ changed while prototyping ───────────── */

/**
 * A prototype never needs blueprint/ to change. Uncommitted changes there are flagged so a human
 * decides: keep them (it was asked) or restore them (an agent "fixed" a primitive on its own).
 */
function checkBlueprintUntouched(warnings) {
   const result = spawnSync('git', ['status', '--porcelain', '--', 'blueprint'], { cwd: ROOT, encoding: 'utf8' })
   if (result.status !== 0 || result.error) return // not a git checkout: nothing to compare with
   const files = result.stdout.split('\n').map((line) => line.slice(3).trim()).filter(Boolean)
   if (!files.length) return
   warnings.push(`blueprint/ a des changements non commités: ${files.join(', ')}. Demandé? Sinon: git restore blueprint/ (et git clean -fd blueprint/). Un bug de primitive ou un mock manquant s'écrit dans notes.md, sous « Signalements ».`)
}

/**
 * Only the working version changes: the latest one of a draft task. Uncommitted edits to tracked files
 * of a frozen version are flagged: an older version, the chosen one, or any version of a task that left
 * draft (teammates have looked at it).
 */
function checkCommittedVersionsUntouched(onlyTask, warnings) {
   const result = spawnSync('git', ['status', '--porcelain', '--', 'prototypes'], { cwd: ROOT, encoding: 'utf8' })
   if (result.status !== 0 || result.error) return
   const touched = new Map()
   for (const line of result.stdout.split('\n')) {
      if (!line.trim() || line.startsWith('??')) continue
      const path = line.slice(3).trim().replace(/^"|"$/g, '').split(' -> ').pop()
      const match = path.match(/^prototypes\/([^/]+)\/(v\d{3}[a-z]?)\//)
      if (!match || (onlyTask && match[1] !== onlyTask)) continue
      const key = `prototypes/${match[1]}/${match[2]}`
      touched.set(key, [...(touched.get(key) ?? []), path.split('/').pop()])
   }
   for (const [version, files] of touched) {
      const [, taskId, versionId] = version.split('/')
      const reason = frozenReason(taskId, versionId)
      if (reason) warnings.push(`${version} est figée (${reason}) et a été modifiée (${files.join(', ')}). Demandé? Sinon: git restore ${version}, puis pnpm proto iterate pour une nouvelle version.`)
   }
}

/** Why a version must not change any more, or '' for the working version (the latest of a draft task). */
function frozenReason(taskId, versionId) {
   let meta = {}
   try {
      meta = readMeta(taskId)
   }
   catch {
      // unreadable meta.json: checkStructure reports it
   }
   if (meta.chosen === versionId) return 'version retenue'
   if (meta.status && meta.status !== 'draft') return `la tâche n'est plus un brouillon: ${STATUS_LABELS[meta.status] ?? meta.status}`
   const latest = listVersions(taskId).at(-1)
   if (latest !== versionId) return `${latest} existe`
   return ''
}

/* ───────────── Components: catalog, tiers, templates, proposals ───────────── */

function checkComponentsAndTemplates(onlyTask, errors, warnings) {
   const catalog = buildCatalog()
   const known = catalogMap(catalog)
   const report = (target, file) => (problem) => target.push(`${rel(file)}:${problem.line}: ${problem.message}`)

   // Generated files must match the components
   for (const { file, content } of expectedFiles(catalog)) {
      if (!existsSync(file) || readFileSync(file, 'utf8') !== content) errors.push(`${rel(file)}: pas à jour avec les composants: pnpm proto catalog`)
   }

   if (!onlyTask) {
      // Unique tags across tiers
      const seen = new Map()
      for (const component of catalog.components) {
         if (seen.has(component.tag)) errors.push(`${component.file}: <${component.tag}> existe aussi dans ${seen.get(component.tag)}`)
         seen.set(component.tag, component.file)
      }

      for (const component of catalog.components) {
         const file = join(ROOT, component.file)
         validateTier(file, component.tier).forEach(report(errors, file))
         if (component.tier === 'domain') {
            const naming = namingWarning(component, known)
            if (naming) warnings.push(`${component.file}: ${naming}`)
            const { errors: templateErrors, warnings: templateWarnings } = validateTemplate(file, catalog)
            templateErrors.forEach(report(errors, file))
            templateWarnings.forEach(report(warnings, file))
         }
      }

      for (const pattern of listDirs(PATTERNS)) {
         const file = join(PATTERNS, pattern, 'index.vue')
         if (!existsSync(file)) continue
         const { errors: templateErrors, warnings: templateWarnings } = validateTemplate(file, catalog)
         templateErrors.forEach(report(errors, file))
         templateWarnings.forEach(report(warnings, file))
      }
   }

   for (const taskId of listDirs(PROTOTYPES)) {
      if (onlyTask && taskId !== onlyTask) continue
      for (const version of listVersions(taskId)) {
         const versionDir = join(PROTOTYPES, taskId, version)
         const componentsDir = join(versionDir, 'components')
         const proposalFiles = existsSync(componentsDir) ? readdirSync(componentsDir).filter((name) => name.endsWith('.vue')).map((name) => join(componentsDir, name)) : []

         // Components of this version: local pieces (no header) and proposals (header, tier rules, collisions)
         const locals = new Map()
         for (const file of proposalFiles) {
            const proposal = readProposal(file)
            if (!proposal) {
               // No header: a local piece of this version, free in its markup and style (tokens only)
               const component = extractComponent(file, { tier: 'local' })
               locals.set(component.tag, component)
               continue
            }
            // What a proposal lacks to enter the blueprint never blocks the prototype: it matters at promotion
            if (proposal.tier === 'domain' && !proposal.object) warnings.push(`${rel(file)}: une proposition métier nomme son objet: <!-- @proposal domain folder: … -->`)
            const component = extractComponent(file, { tier: proposal.tier, object: proposal.object })
            locals.set(component.tag, component)
            validateTier(file, proposal.tier).forEach(report(warnings, file))
            if (known.has(component.tag)) warnings.push(`${rel(file)}: <${component.tag}> existe déjà dans blueprint/ez (promu ou doublon): les nouvelles versions utilisent celui de @ez`)
            else warnings.push(`${rel(file)}: proposition ${proposal.tier}${proposal.object ? ` · ${proposal.object}` : ''} <${component.tag}>: ${proposal.reason}`)
         }

         for (const file of [join(versionDir, 'index.vue'), ...proposalFiles]) {
            if (!existsSync(file)) continue
            const { errors: templateErrors, warnings: templateWarnings } = validateTemplate(file, catalog, { locals })
            templateErrors.forEach(report(errors, file))
            templateWarnings.forEach(report(warnings, file))
         }
      }
   }
}

/** Domain names: ez-{primitive}-{intention} (ez-btn-submit-folder) or ez-{object}-{thing} (ez-signer-list). */
function namingWarning(component, known) {
   const primitives = [...known.values()].filter((item) => item.tier === 'primitive').map((item) => item.tag)
   const fromPrimitive = primitives.some((tag) => component.tag.startsWith(`${tag}-`))
   const fromObject = component.object && component.tag.startsWith(`ez-${component.object}-`)
   return fromPrimitive || fromObject ? null : `nom <${component.tag}>: viser ez-{primitive}-{intention} (ez-btn-submit-folder) ou ez-${component.object ?? '{objet}'}-{chose}`
}

/* ───────────── Tokens ───────────── */

function checkTokenFiles(errors) {
   const shared = readFileSync(SHARED_FILE, 'utf8')
   const changelog = existsSync(CHANGELOG_FILE) ? readFileSync(CHANGELOG_FILE, 'utf8') : ''
   for (const problem of checkShared(shared, changelog)) errors.push(`${rel(SHARED_FILE)}:${problem.line}: ${problem.message}`)
   for (const problem of checkComponents(readFileSync(COMPONENT_FILE, 'utf8'))) errors.push(`${rel(COMPONENT_FILE)}:${problem.line}: ${problem.message}`)
}

/** Old names (renamed: Tailwind would silently generate nothing), unknown --color-*, primitives outside the tokens. */
function checkTokenNames(files, errors) {
   const known = new Set(definedColors())
   const oldNames = renamePattern()

   for (const file of files) {
      const code = stripCodeComments(readFileSync(file, 'utf8'))
      const where = (index) => `${rel(file)}:${lineOf(code, index)}`

      for (const match of code.matchAll(oldNames)) {
         const [, prefix, name] = match
         const next = ALL_RENAMES[name]
         const hint = next ? `renommé en ${prefix}${next}` : `retiré: ${REMOVED_HINTS[name]}`
         errors.push(`${where(match.index)}: ${match[0]}: ${hint} (pnpm proto tokens migrate)`)
      }

      for (const match of code.matchAll(/var\(--color-([a-z-]+)/g)) {
         if (!known.has(match[1]) && !(match[1] in ALL_RENAMES)) errors.push(`${where(match.index)}: --color-${match[1]}: token inconnu (voir blueprint/tokens/ez-tokens.css)`)
      }

      for (const match of code.matchAll(/--prim-[\w-]+/g)) {
         errors.push(`${where(match.index)}: ${match[0]}: une primitive ne se lit que dans les tokens; utiliser un token sémantique`)
      }
   }
}

function stripCodeComments(source) {
   return source.replace(/<!--[\s\S]*?-->/g, (match) => ' '.repeat(match.length))
      .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
      .replace(/(^|[^:])\/\/.*$/gm, (match, prefix) => prefix + ' '.repeat(match.length - prefix.length))
}

/* ───────────── Content rules ───────────── */

const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white'
const UTILITY_PREFIX = 'bg|text|border|ring|fill|stroke|from|to|via|outline|divide|shadow|accent|caret|decoration|placeholder'

const rules = [
   {
      level: 'error',
      pattern: /#[0-9a-fA-F]{3,8}(?=[\s;)'",])/g,
      message: 'couleur hex brute: utiliser un token sémantique (var(--color-…) ou bg-surface, text-fg-muted…)',
   },
   {
      level: 'error',
      pattern: /\b(?:rgba?|hsla?|oklch|oklab|hwb)\(/g,
      message: 'fonction de couleur brute: utiliser un token sémantique',
   },
   {
      level: 'error',
      pattern: /\b(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|border|outline|fill|stroke)\s*:[^;"]*\b(?:red|blue|green|yellow|orange|purple|pink|gray|grey|black|white|navy|teal)\b/g,
      message: 'couleur CSS nommée: utiliser un token sémantique',
   },
   {
      level: 'error',
      pattern: /--prim-[\w-]+/g,
      message: 'token primitif: un prototype n\'utilise que les tokens sémantiques',
   },
   {
      level: 'error',
      pattern: new RegExp(`\\b(?:${UTILITY_PREFIX})-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?\\b`, 'g'),
      message: 'couleur de la palette Tailwind: elle est désactivée, utiliser les utilitaires sémantiques (bg-surface, text-fg-muted, border-line…)',
   },
   {
      level: 'error',
      pattern: /-\[(?:#|rgb|hsl|var\(--prim)/g,
      message: 'valeur de couleur arbitraire: utiliser un token sémantique',
   },
   {
      level: 'warning',
      pattern: /\b[\w-]+-\[\d+(?:\.\d+)?px\]/g,
      message: 'valeur en pixels arbitraire: préférer l\'échelle Tailwind ou un token de composant',
   },
   {
      level: 'warning',
      pattern: /\sstyle="/g,
      message: 'style en ligne: préférer les utilitaires ou les props des composants ez-',
   },
]

const ALLOWED_IMPORTS = [/^vue$/, /^@ez$/, /^@mocks(\/.*)?$/, /^\.\/[\w./-]+$/]

function checkContent(files, errors, warnings) {
   for (const file of files) {
      const source = readFileSync(file, 'utf8')
      // Ignore comments for content rules
      const code = stripCodeComments(source)

      for (const rule of rules) {
         for (const match of code.matchAll(rule.pattern)) {
            const target = rule.level === 'error' ? errors : warnings
            target.push(`${rel(file)}:${lineOf(code, match.index)}: ${match[0].trim()}: ${rule.message}`)
         }
      }

      for (const match of code.matchAll(/\bfrom\s+['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|^\s*import\s+['"]([^'"]+)['"]/gm)) {
         const specifier = match[1] ?? match[2] ?? match[3]
         // A component of the version (vNNN/components/X.vue) may read the version's own files: ../mocks
         const ownVersionFile = /[\\/]v\d{3}[a-z]?[\\/]components[\\/][^\\/]+$/.test(file) && /^\.\.\/[\w.-]+$/.test(specifier)
         if (!ownVersionFile && !ALLOWED_IMPORTS.some((allowed) => allowed.test(specifier))) {
            errors.push(`${rel(file)}:${lineOf(code, match.index)}: import "${specifier}": un prototype n'importe que vue, @ez, @mocks ou les fichiers de sa propre version (jamais ../ une autre version)`)
         }
      }

      if (file.endsWith('.vue') && /<style(?![^>]*scoped)[^>]*>/.test(code)) {
         warnings.push(`${rel(file)}: <style> sans scoped`)
      }
   }
}

function walk(dir) {
   if (!existsSync(dir)) return []
   return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? walk(path) : [path]
   })
}

function lineOf(source, index) {
   return source.slice(0, index).split('\n').length
}
