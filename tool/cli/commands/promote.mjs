/**
 * pnpm proto promote <tâche> <version> <Composant> [--object <objet>]
 * Moves a proposal into the blueprint, on a human decision only:
 *   domain    → blueprint/ez/domain/<object>/<Name>.vue
 *   primitive → blueprint/ez/primitives/<Name>.vue
 * The version keeps its own copy (versions are immutable); the next versions use the global one.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROTOTYPES, fail, findTask, flagString, listVersions, parseArgs, rel } from '../lib.mjs'
import { CATALOG_MD, DOMAIN_DIR, PRIMITIVES_DIR, PROPOSAL_HEADER, buildCatalog, catalogMap, readProposal, toKebab, toPascal, validateTier } from '../catalog-lib.mjs'
import { run as regenerateCatalog } from './catalog.mjs'

const USAGE = 'Usage: pnpm proto promote <tâche> <version> <Composant> [--object <objet>]'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   const [taskInput, version, componentInput] = positional
   if (!taskInput || !version || !componentInput) fail('Tâche, version et composant requis.', USAGE)

   const taskId = findTask(taskInput)
   if (!listVersions(taskId).includes(version)) fail(`Version inconnue « ${version} ».`, `Versions: ${listVersions(taskId).join(', ')}`)

   const name = componentInput.startsWith('ez-') ? toPascal(componentInput) : componentInput.replace(/\.vue$/, '')
   const source = join(PROTOTYPES, taskId, version, 'components', `${name}.vue`)
   if (!existsSync(source)) fail(`Proposition introuvable: ${rel(source)}`, 'Voir: pnpm proto proposals')

   const proposal = readProposal(source)
   if (!proposal) fail(`${rel(source)} n'a pas d'en-tête <!-- @proposal … -->.`)
   const object = flagString(flags, 'object') ?? proposal.object
   if (proposal.tier === 'domain' && !object) fail('Un composant métier a un objet.', `Ajouter --object folder (ou signer, template…)`)

   const tag = toKebab(name)
   if (catalogMap(buildCatalog()).has(tag)) fail(`<${tag}> existe déjà dans blueprint/ez.`)

   const problems = validateTier(source, proposal.tier)
   if (problems.length) fail(`La proposition ne respecte pas les règles du niveau ${proposal.tier}:\n  ${problems.map((problem) => problem.message).join('\n  ')}`)

   const targetDir = proposal.tier === 'domain' ? join(DOMAIN_DIR, object) : PRIMITIVES_DIR
   const target = join(targetDir, `${name}.vue`)

   // The header becomes the component's description (opening /** */ of its script)
   let content = readFileSync(source, 'utf8').replace(PROPOSAL_HEADER, '').replace(/^\s+/, '')
   const eol = content.includes('\r\n') ? '\r\n' : '\n'
   const scriptOpen = content.match(/<script setup[^>]*>\r?\n/)
   if (scriptOpen && !/^\s*\/\*\*/.test(content.slice(scriptOpen.index + scriptOpen[0].length))) {
      const at = scriptOpen.index + scriptOpen[0].length
      content = `${content.slice(0, at)}/**${eol} * ${proposal.reason}${eol} */${eol}${content.slice(at)}`
   }

   mkdirSync(targetDir, { recursive: true })
   writeFileSync(target, content)

   // A hand-written entry in CATALOG.md, before the helpers: when to use it
   const catalog = readFileSync(CATALOG_MD, 'utf8')
   const anchor = catalog.indexOf('## Helpers')
   const entry = `### \`${tag}\`${proposal.tier === 'domain' ? ` · ${object}` : ''}\n${proposal.reason} _(Promu depuis ${taskId}/${version}. Fiche à compléter: quand l'utiliser.)_\n\n`
   writeFileSync(CATALOG_MD, anchor >= 0 ? catalog.slice(0, anchor) + entry + catalog.slice(anchor) : `${catalog.trimEnd()}\n\n${entry}`)

   await regenerateCatalog()

   console.log(`✓ <${tag}> promu: ${rel(target)}`)
   console.log('')
   console.log('  Ensuite:')
   console.log('   1. Compléter sa fiche dans blueprint/ez/CATALOG.md (quand l\'utiliser)')
   console.log('   2. L\'ajouter à la galerie (tool/frame/GalleryPage.vue)')
   console.log(`   3. Les prochaines versions l'utilisent sans import; ${version} garde sa copie`)
   console.log('   4. pnpm proto check')
}
