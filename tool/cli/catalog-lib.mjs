/**
 * The ez- component catalog, read from the components themselves (never written by hand):
 *   blueprint/ez/primitives/*.vue        tier "primitive": generic, visual props, owns the styles
 *   blueprint/ez/domain/<object>/*.vue   tier "domain": knows a business object, composes primitives
 * Each component's API (props, allowed values, defaults, emits, slots) comes from its
 * defineProps / defineEmits types and its template.
 *
 * Generated from it: blueprint/ez/catalog.json, blueprint/ez/components.generated.ts (global
 * registration + types) and the API section of blueprint/ez/CATALOG.md.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import ts from 'typescript'
import { parse as parseSfc } from 'vue/compiler-sfc'
import { BLUEPRINT } from '../paths.mjs'

export const EZ_DIR = join(BLUEPRINT, 'ez')
export const PRIMITIVES_DIR = join(EZ_DIR, 'primitives')
export const DOMAIN_DIR = join(EZ_DIR, 'domain')
export const CATALOG_JSON = join(EZ_DIR, 'catalog.json')
export const REGISTRATION_FILE = join(EZ_DIR, 'components.generated.ts')
export const CATALOG_MD = join(EZ_DIR, 'CATALOG.md')
export const API_START = '<!-- api:start — généré par pnpm proto catalog, ne pas modifier à la main -->'
export const API_END = '<!-- api:end -->'

/** Attributes any component accepts without declaring them. */
const FALLTHROUGH = new Set(['class', 'style', 'id', 'key', 'ref', 'title', 'role', 'tabindex', 'slot', 'is'])

export const toKebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
export const toCamel = (name) => name.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())
export const toPascal = (name) => toCamel(name).replace(/^./, (char) => char.toUpperCase())

/* ───────────── Reading one component ───────────── */

export function readSfc(file) {
   const source = readFileSync(file, 'utf8')
   const { descriptor, errors } = parseSfc(source, { filename: file })
   return { source, descriptor, errors }
}

/** Extracts the API of one .vue file. */
export function extractComponent(file, { tier, object } = {}) {
   const { descriptor } = readSfc(file)
   const script = descriptor.scriptSetup?.content ?? descriptor.script?.content ?? ''
   const sourceFile = ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

   let propsType = null
   let emitsType = null
   let defaults = {}

   const visit = (node) => {
      if (ts.isCallExpression(node)) {
         const callee = node.expression.getText(sourceFile)
         if (callee === 'defineProps' && node.typeArguments?.[0]) propsType = node.typeArguments[0]
         if (callee === 'defineEmits' && node.typeArguments?.[0]) emitsType = node.typeArguments[0]
         if (callee === 'withDefaults' && node.arguments[1] && ts.isObjectLiteralExpression(node.arguments[1])) {
            defaults = Object.fromEntries(node.arguments[1].properties
               .filter((property) => property.name)
               .map((property) => [property.name.getText(sourceFile), ts.isPropertyAssignment(property) ? property.initializer.getText(sourceFile) : '…']))
         }
      }
      ts.forEachChild(node, visit)
   }
   visit(sourceFile)

   const props = membersOf(propsType, sourceFile)
      .filter((member) => ts.isPropertySignature(member) && member.name)
      .map((member) => {
         const name = member.name.getText(sourceFile).replace(/['"]/g, '')
         return {
            name,
            attr: toKebab(name),
            type: member.type ? member.type.getText(sourceFile).replace(/\s+/g, ' ') : 'unknown',
            required: !member.questionToken,
            values: literalValues(member.type, sourceFile),
            default: defaults[name] ?? null,
            doc: jsDocOf(member),
         }
      })

   const emits = membersOf(emitsType, sourceFile).flatMap((member) => {
      if (ts.isPropertySignature(member) && member.name) {
         return [{ name: member.name.getText(sourceFile).replace(/['"]/g, ''), args: member.type?.getText(sourceFile) ?? '', doc: jsDocOf(member) }]
      }
      if (ts.isCallSignatureDeclaration(member)) {
         const first = member.parameters[0]?.type
         const names = literalValues(first, sourceFile) ?? []
         return names.map((name) => ({ name, args: member.parameters.slice(1).map((param) => param.getText(sourceFile)).join(', '), doc: jsDocOf(member) }))
      }
      return []
   })

   const slots = new Set()
   const uses = new Set()
   walkTemplate(descriptor.template?.ast, (node) => {
      if (node.tag === 'slot') {
         const nameAttr = node.props.find((prop) => prop.type === 6 && prop.name === 'name')
         const boundName = node.props.find((prop) => prop.type === 7 && prop.name === 'bind' && prop.arg?.content === 'name')
         // Dynamic names (`cell-${column.key}`) are documented as cell-<…>
         const dynamic = boundName?.exp?.content.trim().replace(/^`|`$/g, '').replace(/\$\{[^}]+\}/g, '<…>')
         slots.add(nameAttr?.value?.content ?? dynamic ?? 'default')
      }
      else if (/^(ez-|Ez[A-Z])/.test(node.tag)) uses.add(toKebab(node.tag))
   })
   // Components imported in the script (e.g. EzIcon inside EzBtn) are used too
   for (const match of script.matchAll(/import\s+(Ez\w+)\s+from\s+['"]\.{1,2}\//g)) uses.add(toKebab(match[1]))

   const name = basename(file, '.vue')
   return {
      tag: toKebab(name),
      name,
      tier,
      ...(object ? { object } : {}),
      file: relative(join(BLUEPRINT, '..'), file).replaceAll('\\', '/'),
      description: descriptionOf(script),
      props,
      emits,
      slots: [...slots],
      uses: [...uses].filter((tag) => tag !== toKebab(name)).sort(),
   }
}

function membersOf(typeNode, sourceFile) {
   if (!typeNode) return []
   if (ts.isTypeLiteralNode(typeNode)) return [...typeNode.members]
   if (ts.isTypeReferenceNode(typeNode)) {
      const target = typeNode.typeName.getText(sourceFile)
      for (const statement of sourceFile.statements) {
         if (ts.isInterfaceDeclaration(statement) && statement.name.text === target) return [...statement.members]
         if (ts.isTypeAliasDeclaration(statement) && statement.name.text === target) return membersOf(statement.type, sourceFile)
      }
   }
   return []
}

/** 'a' | 'b' | 'c' → ['a', 'b', 'c']; anything else → null */
function literalValues(typeNode, sourceFile) {
   if (!typeNode) return null
   const parts = ts.isUnionTypeNode(typeNode) ? typeNode.types : [typeNode]
   const values = []
   for (const part of parts) {
      if (ts.isLiteralTypeNode(part) && ts.isStringLiteral(part.literal)) values.push(part.literal.text)
      else return null
   }
   return values.length ? values : null
}

function jsDocOf(node) {
   const docs = ts.getJSDocCommentsAndTags(node).filter((doc) => doc.kind === ts.SyntaxKind.JSDoc)
   return docs.map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? '').join(' ').trim() || null
}

/** The /** … *\/ comment that opens the script, if any. */
function descriptionOf(script) {
   const match = script.match(/^\s*\/\*\*([\s\S]*?)\*\//)
   if (!match) return null
   return match[1].split('\n').map((line) => line.replace(/^\s*\*\s?/, '').trim()).filter(Boolean).join(' ')
}

export function walkTemplate(node, visit) {
   if (!node) return
   if (node.type === 1) visit(node)
   for (const child of node.children ?? []) walkTemplate(child, visit)
   // v-if branches and v-for keep their elements in children; nothing else to follow
}

/* ───────────── The whole catalog ───────────── */

function vueFiles(dir) {
   if (!existsSync(dir)) return []
   return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? vueFiles(path) : name.endsWith('.vue') ? [path] : []
   })
}

export function buildCatalog() {
   const primitives = vueFiles(PRIMITIVES_DIR).map((file) => extractComponent(file, { tier: 'primitive' }))
   const domain = vueFiles(DOMAIN_DIR).map((file) => extractComponent(file, {
      tier: 'domain',
      object: relative(DOMAIN_DIR, file).split(/[\\/]/)[0],
   }))
   const components = [...primitives, ...domain].sort((a, b) => (a.tier === b.tier ? a.tag.localeCompare(b.tag) : a.tier === 'primitive' ? -1 : 1))
   return { generatedBy: 'pnpm proto catalog', components }
}

export function catalogMap(catalog) {
   return new Map(catalog.components.map((component) => [component.tag, component]))
}

/* ───────────── Generated files ───────────── */

export function renderCatalogJson(catalog) {
   return `${JSON.stringify(catalog, null, 3)}\n`
}

export function renderRegistration(catalog) {
   const lines = catalog.components.map((component) => {
      const from = `./${relative(EZ_DIR, join(BLUEPRINT, '..', component.file)).replaceAll('\\', '/')}`
      return { name: component.name, from }
   })
   return [
      '// Generated by `pnpm proto catalog` from blueprint/ez/primitives and blueprint/ez/domain. Do not edit.',
      ...lines.map(({ name, from }) => `import ${name} from '${from}'`),
      '',
      'export const components = {',
      ...lines.map(({ name }) => `   ${name},`),
      '}',
      '',
      'declare module \'vue\' {',
      '   export interface GlobalComponents {',
      ...lines.map(({ name }) => `      ${name}: typeof ${name}`),
      '   }',
      '}',
      '',
   ].join('\n')
}

const cell = (text) => String(text ?? '').replaceAll('|', '\\|').replace(/\s+/g, ' ')

export function renderApiMarkdown(catalog) {
   const section = (tier, title) => {
      const components = catalog.components.filter((component) => component.tier === tier)
      return [
         `### ${title}`,
         '',
         ...components.flatMap((component) => [
            `#### \`${component.tag}\`${component.object ? ` · ${component.object}` : ''}`,
            '',
            ...(component.description ? [component.description.replace(/(<[^>]+>)/g, "`$1`"), ''] : []),
            ...(component.tier === 'domain' && component.uses.length ? [`Construit avec: ${component.uses.map((tag) => `\`${tag}\``).join(', ')}`, ''] : []),
            ...(component.props.length
               ? [
                  '| Prop | Type | Défaut | |',
                  '|---|---|---|---|',
                  ...component.props.map((prop) => `| \`${prop.attr}\`${prop.required ? ' *' : ''} | ${prop.values ? prop.values.map((value) => `\`${value}\``).join(' ') : `\`${cell(prop.type)}\``} | ${prop.default ? `\`${cell(prop.default)}\`` : ''} | ${cell(prop.doc)} |`),
                  '',
               ]
               : ['Aucune prop.', '']),
            ...(component.slots.length ? [`Slots: ${component.slots.map((slot) => `\`${slot === 'default' ? 'défaut' : `#${slot}`}\``).join(', ')}`, ''] : []),
            ...(component.emits.length ? [`Émet: ${component.emits.map((emit) => `\`${emit.name}\``).join(', ')}`, ''] : []),
         ]),
      ]
   }

   return [
      API_START,
      '',
      '## API (généré)',
      '',
      'Tiré du code des composants par `pnpm proto catalog`. `*` = prop obligatoire. Le texte au-dessus de cette section est écrit à la main: quand utiliser quoi.',
      '',
      ...section('primitive', 'Primitives'),
      ...section('domain', 'Composants métier'),
      API_END,
      '',
   ].join('\n')
}

/** CATALOG.md with its generated API section replaced (or appended). */
export function renderCatalogMarkdown(current, catalog) {
   const api = renderApiMarkdown(catalog)
   const start = current.indexOf(API_START)
   const end = current.indexOf(API_END)
   if (start >= 0 && end > start) return current.slice(0, start) + api + current.slice(end + API_END.length).replace(/^\n+/, '')
   return `${current.trimEnd()}\n\n${api}`
}

/** The three generated files, as they should be. */
export function expectedFiles(catalog = buildCatalog()) {
   const markdown = existsSync(CATALOG_MD) ? readFileSync(CATALOG_MD, 'utf8') : '# Catalogue `ez-`\n'
   return [
      { file: CATALOG_JSON, content: renderCatalogJson(catalog) },
      { file: REGISTRATION_FILE, content: renderRegistration(catalog) },
      { file: CATALOG_MD, content: renderCatalogMarkdown(markdown, catalog) },
   ]
}

/* ───────────── Validating a template against the catalog ───────────── */

const RAW_ELEMENTS = { button: 'ez-btn', input: 'ez-field', select: 'ez-field', textarea: 'ez-field', table: 'ez-table' }

/**
 * Checks every ez- tag of a .vue file: known component, known props, allowed values.
 * `locals`: Map tag → component for proposals of the same version.
 * Returns { errors: [{ line, message }], warnings: [...] }.
 */
export function validateTemplate(file, catalog, { locals: allLocals = new Map(), rawElements = true } = {}) {
   // A proposal is only usable where it is imported (it is not registered globally)
   const script = readFileSync(file, 'utf8')
   const imported = new Set([...script.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/(?:components\/)?(\w+)\.vue['"]/g)].map((match) => toKebab(match[1])))
   const locals = new Map([...allLocals].filter(([tag, component]) => imported.has(tag) || component.file === file.replaceAll('\\', '/')))
   const known = catalogMap(catalog)
   const errors = []
   const warnings = []
   const { descriptor, errors: parseErrors } = readSfc(file)
   for (const error of parseErrors) errors.push({ line: error.loc?.start.line ?? 1, message: `template invalide: ${error.message}` })

   walkTemplate(descriptor.template?.ast, (node) => {
      const line = node.loc.start.line

      if (rawElements && RAW_ELEMENTS[node.tag]) {
         warnings.push({ line, message: `<${node.tag}> brut: utiliser <${RAW_ELEMENTS[node.tag]}> (ou un composant métier qui l'enveloppe)` })
      }

      if (!/^(ez-|Ez[A-Z])/.test(node.tag)) return
      const tag = toKebab(node.tag)
      const component = known.get(tag) ?? locals.get(tag)
      if (!component) {
         errors.push({
            line,
            message: allLocals.has(tag)
               ? `<${node.tag}>: proposition non importée: import ${allLocals.get(tag).name} from './components/${allLocals.get(tag).name}.vue'`
               : `<${node.tag}>: composant inconnu. Voir blueprint/ez/CATALOG.md; s'il manque, le proposer dans components/ de la version`,
         })
         return
      }

      if (node.props.some((prop) => prop.type === 7 && prop.name === 'bind' && !prop.arg)) return // v-bind="object": can't check
      const propsByAttr = new Map(component.props.map((prop) => [prop.attr, prop]))

      for (const prop of node.props) {
         let attr = null
         let staticValue = null
         if (prop.type === 6) {
            attr = prop.name
            staticValue = prop.value?.content ?? null
         }
         else if (prop.type === 7 && prop.name === 'bind' && prop.arg?.isStatic) {
            attr = prop.arg.content
            const literal = prop.exp?.content.trim().match(/^(['"`])([^'"`]*)\1$/)
            staticValue = literal ? literal[2] : null
         }
         else if (prop.type === 7 && prop.name === 'model') {
            attr = prop.arg?.content ?? 'model-value'
         }
         if (!attr) continue

         const kebab = toKebab(attr)
         if (FALLTHROUGH.has(kebab) || kebab.startsWith('aria-') || kebab.startsWith('data-')) continue

         const declared = propsByAttr.get(kebab)
         if (!declared) {
            errors.push({ line, message: `<${node.tag}> n'a pas de prop « ${attr} ». Props: ${component.props.map((item) => item.attr).join(', ') || 'aucune'}` })
            continue
         }
         if (declared.values && staticValue !== null && !declared.values.includes(staticValue)) {
            errors.push({ line, message: `<${node.tag} ${attr}="${staticValue}">: valeur invalide. Permises: ${declared.values.join(', ')}` })
         }
      }

      for (const prop of component.props.filter((item) => item.required)) {
         const given = node.props.some((item) => (item.type === 6 && toKebab(item.name) === prop.attr)
            || (item.type === 7 && item.name === 'bind' && item.arg?.isStatic && toKebab(item.arg.content) === prop.attr)
            || (item.type === 7 && item.name === 'model' && toKebab(item.arg?.content ?? 'model-value') === prop.attr))
         if (!given) errors.push({ line, message: `<${node.tag}>: prop obligatoire « ${prop.attr} » absente` })
      }
   })

   return { errors, warnings }
}

/* ───────────── Tier rules ───────────── */

const VISUAL_DECLARATION = /(?:^|[;{\s])(color|background(?:-color|-image)?|border(?:-[a-z-]+)?|box-shadow|outline(?:-[a-z]+)?|border-radius)\s*:/
const VISUAL_UTILITY = /\b(?:bg|border|shadow|rounded|ring|outline)(?:-[\w/[\].-]+)?\b/

/**
 * primitive: generic — never imports business objects nor domain components.
 * domain: composes — no visual style of its own (colors, borders, shadows, radius), in CSS or utilities.
 */
export function validateTier(file, tier) {
   const problems = []
   const { descriptor } = readSfc(file)
   const script = descriptor.scriptSetup?.content ?? descriptor.script?.content ?? ''

   if (tier === 'primitive') {
      if (/from\s+['"]@mocks/.test(script)) problems.push({ line: 1, message: 'une primitive ne connaît aucun objet métier (import de @mocks): c\'est un composant métier' })
      if (/from\s+['"][^'"]*domain\//.test(script)) problems.push({ line: 1, message: 'une primitive n\'utilise jamais un composant métier' })
   }

   if (tier === 'domain') {
      for (const style of descriptor.styles) {
         const css = style.content.replace(/\/\*[\s\S]*?\*\//g, '')
         const match = css.match(VISUAL_DECLARATION)
         if (match || css.includes('var(--color-')) {
            problems.push({ line: style.loc.start.line, message: `style visuel (${match?.[1] ?? 'var(--color-…)'}) dans un composant métier: le visuel appartient aux primitives; ne garder que la mise en page (flex, gap, grid)` })
         }
      }
      walkTemplate(descriptor.template?.ast, (node) => {
         const classAttr = node.props.find((prop) => prop.type === 6 && prop.name === 'class')?.value?.content ?? ''
         const match = classAttr.match(VISUAL_UTILITY)
         if (match) problems.push({ line: node.loc.start.line, message: `utilitaire visuel « ${match[0]} » dans un composant métier: passer par une primitive` })
      })
   }

   return problems
}

/* ───────────── Proposals ───────────── */

export const PROPOSAL_HEADER = /^\s*<!--\s*@proposal\s+(primitive|domain)(?:\s+([a-z][a-z0-9-]*))?\s*:\s*([\s\S]*?)-->/

/** Reads the header of a proposed component: <!-- @proposal domain folder: why it exists --> */
export function readProposal(file) {
   const source = readFileSync(file, 'utf8')
   const match = source.match(PROPOSAL_HEADER)
   if (!match) return null
   return { tier: match[1], object: match[2] ?? null, reason: match[3].replace(/\s+/g, ' ').trim() }
}
