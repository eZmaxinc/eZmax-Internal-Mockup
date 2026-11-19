/**
 * yarn mockup promote <tâche> <version> <Composant> [-m "pourquoi"]
 * Moves a primitive of a version into the blueprint, on a human decision only:
 *   enhanced (same name as a blueprint primitive) → replaces the original, where it is
 *   created or suggested                          → blueprint/ez/components/<name>/ez-<name>.vue (+ ez-<name>.example.vue)
 * Business (domain) components are never promoted: they are built in the app (ezmax-library-quasar),
 * and blueprint/ez/domain/ only mirrors what the app already has.
 * The version keeps its own copy (a version stays self-contained); the next versions use the global one.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { MOCKUPS, ROOT, fail, findTask, flagString, listVersions, parseArgs, rel } from '../lib.mjs'
import { CATALOG_MD, COMPONENTS_DIR, PROPOSAL_HEADER, buildCatalog, catalogMap, readProposal, toKebab, toPascal, validateTier } from '../catalog-lib.mjs'
import { run as regenerateCatalog } from './catalog.mjs'

const USAGE = 'Usage: yarn mockup promote <tâche> <version> <Composant> [-m "pourquoi"]'

export async function run(argv) {
   const { positional, flags } = parseArgs(argv)
   const [taskInput, version, componentInput] = positional
   if (!taskInput || !version || !componentInput) fail('Tâche, version et composant requis.', USAGE)

   const taskId = findTask(taskInput)
   if (!listVersions(taskId).includes(version)) fail(`Version inconnue « ${version} ».`, `Versions: ${listVersions(taskId).join(', ')}`)

   const sourceName = componentInput.startsWith('ez-') ? toPascal(componentInput) : componentInput.replace(/\.vue$/, '')
   const source = join(MOCKUPS, taskId, version, 'components', `${sourceName}.vue`)
   if (!existsSync(source)) fail(`Composant introuvable: ${rel(source)}`, 'Voir: yarn mockup proposals')

   // In the blueprint every component is an ez- one: FolderTimeline becomes EzFolderTimeline
   const name = sourceName.startsWith('Ez') ? sourceName : `Ez${sourceName}`
   const tag = toKebab(name)
   const original = catalogMap(buildCatalog()).get(tag)
   const proposal = readProposal(source)

   // A blueprint component cannot read the files of a version
   const versionImport = readFileSync(source, 'utf8').match(/from\s+['"](\.\.?\/[^'"]+)['"]/)
   if (versionImport) fail(`${rel(source)} importe « ${versionImport[1]} », un fichier de la version.`, 'Le rendre autonome d\'abord: passer les données par des props, ou déplacer le type dans blueprint/mocks.')

   const tier = original?.tier ?? proposal?.tier ?? 'primitive'
   if (tier === 'domain') {
      fail(
         `<${tag}> est un composant métier: il se construit dans l'app (ezmax-library-quasar), pas dans le blueprint.`,
         'Le garder local à la version et l\'écrire dans notes.md, sous « Signalements »: Composant métier manquant: …',
      )
   }
   const reason = flagString(flags, 'message') ?? proposal?.reason ?? ''

   const problems = validateTier(source, tier)
   if (problems.length) fail(`Le composant ne respecte pas les règles d'une primitive:\n  ${problems.map((problem) => problem.message).join('\n  ')}`, 'Un composant qui connaît un objet métier se construit dans l\'app: le garder local et le signaler dans notes.md.')

   // Like the app (ezmax-library-quasar): one folder per component, kebab-case file (components/reveal/ez-reveal.vue)
   const targetDir = join(COMPONENTS_DIR, tag.replace(/^ez-/, ''))
   const target = original ? join(ROOT, original.file) : join(targetDir, `${tag}.vue`)

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
      // A hand-written entry in CATALOG.md (when to use it), with the other primitives
      const catalog = readFileSync(CATALOG_MD, 'utf8')
      const anchor = catalog.indexOf('## Composants métier')
      const entry = `### \`${tag}\`\n${reason ? `${reason} ` : ''}_(Promu depuis ${taskId}/${version}. Fiche à compléter: quand l'utiliser.)_\n\n`
      writeFileSync(CATALOG_MD, anchor >= 0 ? catalog.slice(0, anchor) + entry + catalog.slice(anchor) : `${catalog.trimEnd()}\n\n${entry}`)

      // An example for the gallery, which shows it on its own (section « Autres composants »)
      const example = join(targetDir, `${tag}.example.vue`)
      const api = catalogMap(buildCatalog()).get(tag)
      if (api && !existsSync(example)) writeFileSync(example, exampleFor(api))

      // Like the app: the folder's index.ts default-exports the component
      const index = join(targetDir, 'index.ts')
      if (!existsSync(index)) writeFileSync(index, `import ${name} from './${tag}.vue'\n\nexport default ${name}\n`)
   }

   await regenerateCatalog()

   console.log(original ? `✓ <${tag}> remplacé par la copie rehaussée: ${rel(target)}` : `✓ <${tag}> promu: ${rel(target)}`)
   console.log('')
   console.log('  Ensuite:')
   if (original) {
      console.log(`   1. Relire le changement: git diff ${rel(target)}`)
      console.log('   2. Mettre sa fiche à jour dans blueprint/ez/CATALOG.md si son usage change')
      console.log('   3. Les autres mockups l\'utilisent maintenant: les regarder dans le shell')
   }
   else {
      console.log('   0. Le relire selon « Composants du blueprint » dans AGENTS.md (conventions de l\'app: prop `as`, is/has, on…)')
      if (!catalogMap(buildCatalog()).get(tag)?.props.some((prop) => prop.name === 'as')) console.log('      ⚠ pas de prop `as`: un composant partagé doit pouvoir se rendre comme un autre élément')
      console.log('   1. Compléter sa fiche dans blueprint/ez/CATALOG.md (quand l\'utiliser)')
      console.log(`   2. Il est dans la galerie (Autres composants); ajuster son exemple: ${rel(join(targetDir, `${tag}.example.vue`))}`)
      console.log(`   3. Les prochaines versions l'utilisent sans import; ${version} garde sa copie`)
   }
   console.log('   4. yarn mockup check')
}


/** A first gallery example from the component's API: required props filled in, sample text in the default slot. */
function exampleFor(component) {
   const attributes = component.props.filter((prop) => prop.required).map((prop) => {
      if (prop.values?.length) return `${prop.attr}="${prop.values[0]}"`
      if (prop.type === 'string') return `${prop.attr}="Exemple"`
      if (prop.type === 'boolean') return prop.attr
      if (prop.type === 'number') return `:${prop.attr}="1"`
      return `:${prop.attr}="undefined /* TODO: ${prop.type} */"`
   })
   const open = [component.tag, ...attributes].join(' ')
   const body = component.slots.includes('default')
      ? [
         `   <${open}>`,
         '      <p class="m-0">Le dossier « Bail commercial » a été envoyé à trois signataires le 4 novembre. Deux ont signé; le troisième a reçu deux rappels.</p>',
         '      <p class="m-0">La date limite est le 30 novembre. Après la fermeture, le dossier est archivé puis éliminé selon les délais du type de dossiers.</p>',
         `   </${component.tag}>`,
      ]
      : [`   <${open} />`]
   return [
      '<!-- Exemple de la galerie, généré par mockup promote: à ajuster pour montrer les cas utiles. -->',
      '<template>',
      ...body,
      '</template>',
      '',
   ].join('\n')
}
