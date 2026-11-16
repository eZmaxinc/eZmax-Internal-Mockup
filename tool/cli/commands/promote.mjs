/**
 * yarn proto promote <tâche> <version> <Composant> [--tier primitive|domain] [--object <objet>] [-m "pourquoi"]
 * Moves a component of a version into the blueprint, on a human decision only:
 *   enhanced (same name as a blueprint component) → replaces the original, where it is
 *   created or suggested, domain                  → blueprint/ez/domain/<object>/<Name>.vue
 *   created or suggested, primitive               → blueprint/ez/primitives/<Name>.vue
 * A @proposal header gives the tier, the object and the reason; without one, the flags do (primitive by default).
 * The version keeps its own copy (a version stays self-contained); the next versions use the global one.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROTOTYPES, ROOT, fail, findTask, flagString, listVersions, parseArgs, rel } from '../lib.mjs'
import { CATALOG_MD, DOMAIN_DIR, PRIMITIVES_DIR, PROPOSAL_HEADER, buildCatalog, catalogMap, readProposal, toKebab, toPascal, validateTier } from '../catalog-lib.mjs'
import { run as regenerateCatalog } from './catalog.mjs'

const USAGE = 'Usage: yarn proto promote <tâche> <version> <Composant> [--tier primitive|domain] [--object <objet>] [-m "pourquoi"]'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   const [taskInput, version, componentInput] = positional
   if (!taskInput || !version || !componentInput) fail('Tâche, version et composant requis.', USAGE)

   const taskId = findTask(taskInput)
   if (!listVersions(taskId).includes(version)) fail(`Version inconnue « ${version} ».`, `Versions: ${listVersions(taskId).join(', ')}`)

   const sourceName = componentInput.startsWith('ez-') ? toPascal(componentInput) : componentInput.replace(/\.vue$/, '')
   const source = join(PROTOTYPES, taskId, version, 'components', `${sourceName}.vue`)
   if (!existsSync(source)) fail(`Composant introuvable: ${rel(source)}`, 'Voir: yarn proto proposals')

   // In the blueprint every component is an ez- one: FolderTimeline becomes EzFolderTimeline
   const name = sourceName.startsWith('Ez') ? sourceName : `Ez${sourceName}`
   const tag = toKebab(name)
   const original = catalogMap(buildCatalog()).get(tag)
   const proposal = readProposal(source)

   // A blueprint component cannot read the files of a version
   const versionImport = readFileSync(source, 'utf8').match(/from\s+['"](\.\.?\/[^'"]+)['"]/)
   if (versionImport) fail(`${rel(source)} importe « ${versionImport[1]} », un fichier de la version.`, 'Le rendre autonome d\'abord: passer les données par des props, ou déplacer le type dans blueprint/mocks.')

   const tier = original?.tier ?? proposal?.tier ?? flagString(flags, 'tier') ?? 'primitive'
   if (!['primitive', 'domain'].includes(tier)) fail(`Niveau inconnu « ${tier} ».`, USAGE)
   const object = original?.object ?? flagString(flags, 'object') ?? proposal?.object
   if (tier === 'domain' && !object) fail('Un composant métier a un objet.', 'Ajouter --object folder (ou signer, template…)')
   const reason = flagString(flags, 'message') ?? proposal?.reason ?? ''

   const problems = validateTier(source, tier)
   if (problems.length) fail(`Le composant ne respecte pas les règles du niveau ${tier}:\n  ${problems.map((problem) => problem.message).join('\n  ')}`, tier === 'primitive' ? 'Un composant qui connaît un objet métier: --tier domain --object <objet>' : 'Un composant qui a son propre visuel: --tier primitive')

   const targetDir = tier === 'domain' ? join(DOMAIN_DIR, object) : PRIMITIVES_DIR
   const target = original ? join(ROOT, original.file) : join(targetDir, `${name}.vue`)

   // The reason becomes the component's description (opening /** */ of its script)
   let content = readFileSync(source, 'utf8').replace(PROPOSAL_HEADER, '').replace(/^\s+/, '')
   const eol = content.includes('\r\n') ? '\r\n' : '\n'
   const scriptOpen = content.match(/<script setup[^>]*>\r?\n/)
   if (reason && scriptOpen && !/^\s*\/\*\*/.test(content.slice(scriptOpen.index + scriptOpen[0].length))) {
      const at = scriptOpen.index + scriptOpen[0].length
      content = `${content.slice(0, at)}/**${eol} * ${reason}${eol} */${eol}${content.slice(at)}`
   }

   mkdirSync(original ? join(target, '..') : targetDir, { recursive: true })
   writeFileSync(target, content)

   if (!original) {
      // A hand-written entry in CATALOG.md, before the helpers: when to use it
      const catalog = readFileSync(CATALOG_MD, 'utf8')
      const anchor = catalog.indexOf('## Helpers')
      const entry = `### \`${tag}\`${tier === 'domain' ? ` · ${object}` : ''}\n${reason ? `${reason} ` : ''}_(Promu depuis ${taskId}/${version}. Fiche à compléter: quand l'utiliser.)_\n\n`
      writeFileSync(CATALOG_MD, anchor >= 0 ? catalog.slice(0, anchor) + entry + catalog.slice(anchor) : `${catalog.trimEnd()}\n\n${entry}`)
   }

   await regenerateCatalog()

   console.log(original ? `✓ <${tag}> remplacé par la copie rehaussée: ${rel(target)}` : `✓ <${tag}> promu: ${rel(target)}`)
   console.log('')
   console.log('  Ensuite:')
   if (original) {
      console.log(`   1. Relire le changement: git diff ${rel(target)}`)
      console.log('   2. Mettre sa fiche à jour dans blueprint/ez/CATALOG.md si son usage change')
      console.log('   3. Les autres prototypes l\'utilisent maintenant: les regarder dans le shell')
   }
   else {
      console.log('   1. Compléter sa fiche dans blueprint/ez/CATALOG.md (quand l\'utiliser)')
      console.log('   2. L\'ajouter à la galerie (tool/frame/GalleryPage.vue)')
      console.log(`   3. Les prochaines versions l'utilisent sans import; ${version} garde sa copie`)
   }
   console.log('   4. yarn proto check')
}
