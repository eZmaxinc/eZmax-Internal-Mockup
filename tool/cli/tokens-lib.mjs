/**
 * Reading and checking blueprint/tokens/ez-tokens.css (the token source shared with the mono).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BLUEPRINT } from '../paths.mjs'

export const TOKENS_DIR = join(BLUEPRINT, 'tokens')
export const SHARED_FILE = join(TOKENS_DIR, 'ez-tokens.css')
export const COMPONENT_FILE = join(TOKENS_DIR, 'components.css')
export const CHANGELOG_FILE = join(TOKENS_DIR, 'CHANGELOG.md')

/** The color contract: {role}-{modifier}. Roles first, then emphasis or variant. */
export const COLOR_ROLES = ['background', 'surface', 'foreground', 'border', 'accent', 'overlay', 'positive', 'negative', 'warning', 'info']
/** Emphasis (one axis), then variants (surface-{variant} and foreground-{variant} come in pairs), then accent-foreground. */
export const COLOR_EMPHASIS = ['strong', 'muted', 'subtle']
export const COLOR_VARIANTS = ['inverse', 'accent', 'positive', 'negative', 'warning', 'info']
export const COLOR_MODIFIERS = [...COLOR_EMPHASIS, ...COLOR_VARIANTS, 'foreground']
/** Other @theme namespaces the shared file may define */
export const THEME_NAMESPACES = ['breakpoint', 'font', 'text', 'radius', 'space', 'size', 'shadow']

export const HEADER = /ez-tokens (\d+)\.(\d+)\.(\d+) — (\d{4}-\d{2}-\d{2})/

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|hwb|lab|lch)\(/

export function stripComments(css) {
   return css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
}

export function readVersion(source = readFileSync(SHARED_FILE, 'utf8')) {
   const match = source.match(HEADER)
   return match ? { major: +match[1], minor: +match[2], patch: +match[3], date: match[4], text: `${match[1]}.${match[2]}.${match[3]}` } : null
}

export const DARK_SELECTOR = '.body--dark'

/**
 * Declarations with their layer: 'primitive' (in :root before @theme), 'semantic' (in @theme),
 * 'dark' (in the .body--dark block, which redefines semantics).
 */
export function readDeclarations(source) {
   const css = stripComments(source)
   const themeStart = css.indexOf('@theme')
   const darkStart = css.indexOf(`${DARK_SELECTOR} {`)
   return [...css.matchAll(/(--[\w*-]+)\s*:\s*([^;]+);/g)].map((match) => ({
      name: match[1],
      value: match[2].trim(),
      layer: darkStart >= 0 && match.index > darkStart ? 'dark'
         : themeStart >= 0 && match.index > themeStart ? 'semantic' : 'primitive',
      line: css.slice(0, match.index).split('\n').length,
   }))
}

export function isContractColor(name) {
   const color = name.match(/^--color-([a-z-]+)$/)?.[1]
   if (!color) return false
   const role = COLOR_ROLES.find((candidate) => color === candidate || color.startsWith(`${candidate}-`))
   if (!role) return false
   const modifier = color.slice(role.length + 1)
   return !modifier || COLOR_MODIFIERS.includes(modifier)
}

/** Semantic color names defined by the shared file, without the --color- prefix. */
export function definedColors() {
   if (!existsSync(SHARED_FILE)) return []
   return readDeclarations(readFileSync(SHARED_FILE, 'utf8'))
      .filter((declaration) => declaration.layer === 'semantic' && declaration.name.startsWith('--color-'))
      .map((declaration) => declaration.name.slice('--color-'.length))
}

/**
 * The hierarchy rules. Returns [{ line, message }].
 *   1. hex and color functions only in primitives
 *   2. primitives never reference another layer
 *   3. semantics reference primitives or other semantics, never component tokens
 *   4. semantic colors follow the contract
 *   5. the header carries a version, the same as the top CHANGELOG entry
 */
export function checkShared(source, changelog) {
   const problems = []
   const declarations = readDeclarations(source)

   for (const { name, value, layer, line } of declarations) {
      const refs = [...value.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1])

      if (layer === 'primitive') {
         if (!name.startsWith('--prim-')) problems.push({ line, message: `${name}: hors du @theme, seules les primitives --prim-* sont permises` })
         const outward = refs.filter((ref) => !ref.startsWith('--prim-'))
         if (outward.length) problems.push({ line, message: `${name}: une primitive ne référence que des primitives (${outward.join(', ')})` })
         continue
      }

      if (RAW_COLOR.test(value)) problems.push({ line, message: `${name}: valeur de couleur brute dans un token sémantique; l'extraire en primitive --prim-*` })

      const namespace = name.match(/^--([a-z]+)-/)?.[1]
      if (name.startsWith('--color-')) {
         if (!isContractColor(name)) {
            problems.push({ line, message: `${name}: hors du contrat {rôle}-{modifieur} (rôles: ${COLOR_ROLES.join(' ')}; modifieurs: ${COLOR_MODIFIERS.join(' ')})` })
         }
      }
      else if (name !== '--breakpoint-*' && !THEME_NAMESPACES.includes(namespace)) {
         problems.push({ line, message: `${name}: espace de noms inattendu dans le @theme partagé (permis: color, ${THEME_NAMESPACES.join(', ')})` })
      }

      const toComponents = refs.filter((ref) => !ref.startsWith('--prim-') && !ref.startsWith('--color-') && !THEME_NAMESPACES.some((space) => ref.startsWith(`--${space}-`)))
      if (toComponents.length) problems.push({ line, message: `${name}: un token sémantique ne référence jamais un token de composant (${toComponents.join(', ')})` })
   }

   // Dark theme: only names of the @theme, and every color of the @theme
   const themeNames = new Set(declarations.filter((declaration) => declaration.layer === 'semantic').map((declaration) => declaration.name))
   const darkNames = new Set(declarations.filter((declaration) => declaration.layer === 'dark').map((declaration) => declaration.name))
   for (const { name, line } of declarations.filter((declaration) => declaration.layer === 'dark')) {
      if (!themeNames.has(name)) problems.push({ line, message: `${name}: ${DARK_SELECTOR} ne redéfinit que des tokens du @theme` })
   }
   if (darkNames.size) {
      const missing = [...themeNames].filter((name) => name.startsWith('--color-') && !darkNames.has(name))
      if (missing.length) problems.push({ line: 1, message: `${DARK_SELECTOR} ne redéfinit pas: ${missing.join(', ')}` })
   }

   const version = readVersion(source)
   if (!version) problems.push({ line: 1, message: 'en-tête « ez-tokens X.Y.Z — AAAA-MM-JJ » absent' })
   else {
      const logged = changelog.match(/^## (\d+\.\d+\.\d+)/m)?.[1]
      if (logged !== version.text) problems.push({ line: 1, message: `version ${version.text} dans l'en-tête, ${logged ?? 'aucune'} en haut de CHANGELOG.md (yarn mockup tokens bump)` })
   }

   return problems
}

/** Component tokens: sizes or references to semantics, never a raw color nor a primitive. */
export function checkComponents(source) {
   return readDeclarations(source).flatMap(({ name, value, line }) => {
      const problems = []
      if (RAW_COLOR.test(value)) problems.push({ line, message: `${name}: couleur brute; pointer vers un token sémantique (var(--color-…))` })
      if (value.includes('--prim-')) problems.push({ line, message: `${name}: un token de composant ne lit jamais une primitive; passer par un token sémantique` })
      return problems
   })
}
