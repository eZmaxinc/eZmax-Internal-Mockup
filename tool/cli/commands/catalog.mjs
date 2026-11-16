/**
 * yarn mockup catalog
 * Rebuilds what is generated from the ez- components (blueprint/ez/primitives, blueprint/ez/domain):
 *   catalog.json             the API of every component (read by mockup check and by agents)
 *   components.generated.ts  global registration + types (no hand-written list anymore)
 *   CATALOG.md               the API section, between the api:start / api:end markers
 * Run it after adding, renaming or changing the props of a component. mockup check fails when it is stale.
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { rel } from '../lib.mjs'
import { buildCatalog, expectedFiles } from '../catalog-lib.mjs'

export async function run() {
   const catalog = buildCatalog()
   const changed = []

   for (const { file, content } of expectedFiles(catalog)) {
      if (existsSync(file) && readFileSync(file, 'utf8') === content) continue
      writeFileSync(file, content)
      changed.push(rel(file))
   }

   const primitives = catalog.components.filter((component) => component.tier === 'primitive').length
   const domain = catalog.components.length - primitives
   console.log(`✓ Catalogue: ${primitives} primitive(s), ${domain} composant(s) métier`)
   console.log(changed.length ? `  Mis à jour: ${changed.join(', ')}` : '  Déjà à jour.')
}
