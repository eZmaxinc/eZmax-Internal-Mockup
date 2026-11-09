/**
 * The API of plain TypeScript modules, read from their exports and JSDoc (never written by hand):
 *   blueprint/mocks/*.ts   business objects and factories → blueprint/mocks/API.md
 *   blueprint/ez helpers   useScenario, formatDate…       → "Helpers" in blueprint/ez/CATALOG.md
 * So an agent knows what EzsignFolder can do without opening its source.
 */
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import ts from 'typescript'

const isExported = (node) => ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export
const oneLine = (text, max = 140) => {
   const flat = text.replace(/\s+/g, ' ').trim()
   return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

function docOf(node) {
   const docs = ts.getJSDocCommentsAndTags(node).filter((doc) => doc.kind === ts.SyntaxKind.JSDoc)
   return docs.map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? '').join(' ').trim() || null
}

/** Type of a default value without annotation (`remindersSent = 0` → number). */
function literalType(initializer) {
   if (!initializer) return 'unknown'
   if (ts.isNumericLiteral(initializer)) return 'number'
   if (ts.isStringLiteralLike(initializer)) return 'string'
   if (initializer.kind === ts.SyntaxKind.TrueKeyword || initializer.kind === ts.SyntaxKind.FalseKeyword) return 'boolean'
   if (ts.isArrayLiteralExpression(initializer)) return 'array'
   return 'unknown'
}

function signature(node, sourceFile) {
   const params = node.parameters.map((param) => oneLine(param.getText(sourceFile), 80)).join(', ')
   const returns = node.type ? `: ${oneLine(node.type.getText(sourceFile), 60)}` : ''
   return `(${params})${returns}`
}

/** Exports of one module: functions, constants, classes (members) and types. */
export function extractModule(file) {
   const source = readFileSync(file, 'utf8')
   const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
   const exports = []

   for (const statement of sourceFile.statements) {
      if (!isExported(statement)) continue

      if (ts.isFunctionDeclaration(statement) && statement.name) {
         exports.push({ kind: 'function', name: statement.name.text, signature: signature(statement, sourceFile), doc: docOf(statement) })
      }
      else if (ts.isVariableStatement(statement)) {
         for (const declaration of statement.declarationList.declarations) {
            const initializer = declaration.initializer
            const isFunction = initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
            exports.push({
               kind: isFunction ? 'function' : 'const',
               name: declaration.name.getText(sourceFile),
               signature: isFunction ? signature(initializer, sourceFile) : (declaration.type ? `: ${oneLine(declaration.type.getText(sourceFile), 80)}` : ''),
               doc: docOf(statement),
            })
         }
      }
      else if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
         const body = ts.isTypeAliasDeclaration(statement) ? statement.type.getText(sourceFile) : 'interface'
         exports.push({ kind: 'type', name: statement.name.text, signature: oneLine(body), doc: docOf(statement) })
      }
      else if (ts.isClassDeclaration(statement) && statement.name) {
         const members = []
         for (const member of statement.members) {
            const flags = ts.getCombinedModifierFlags(member)
            if (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) continue
            if (ts.isConstructorDeclaration(member)) {
               for (const param of member.parameters) {
                  if (!(ts.getCombinedModifierFlags(param) & ts.ModifierFlags.Public)) continue
                  const type = param.type ? param.type.getText(sourceFile) : literalType(param.initializer)
                  members.push({ kind: 'property', name: param.name.getText(sourceFile), signature: `: ${oneLine(type, 60)}`, doc: null })
               }
            }
            else if (ts.isPropertyDeclaration(member) && member.name) {
               members.push({ kind: 'property', name: member.name.getText(sourceFile), signature: member.type ? `: ${oneLine(member.type.getText(sourceFile), 60)}` : '', doc: docOf(member) })
            }
            else if (ts.isGetAccessorDeclaration(member) && member.name) {
               members.push({ kind: 'getter', name: member.name.getText(sourceFile), signature: '', doc: docOf(member) })
            }
            else if (ts.isMethodDeclaration(member) && member.name && !member.name.getText(sourceFile).startsWith('_')) {
               members.push({ kind: 'method', name: member.name.getText(sourceFile), signature: signature(member, sourceFile), doc: docOf(member) })
            }
         }
         exports.push({ kind: 'class', name: statement.name.text, signature: '', doc: docOf(statement), members })
      }
   }

   return { file: basename(file), exports }
}

// Table cells: one line, pipes escaped (GFM honours \| even inside code), HTML tags shown as code
const cell = (text) => String(text ?? '').replace(/\s+/g, ' ').trim().replace(/(<[^>]+>)/g, '`$1`').replaceAll('|', '\\|')
const code = (text) => `\`${String(text).replace(/\s+/g, ' ').replaceAll('`', 'ˋ').replaceAll('|', '\\|')}\``

/** Markdown for a list of modules: classes as tables of members, then functions, constants and types. */
export function renderModules(modules, { headingLevel = 3 } = {}) {
   const heading = '#'.repeat(headingLevel)
   const lines = []
   const all = modules.flatMap((module) => module.exports)

   for (const item of all.filter((entry) => entry.kind === 'class')) {
      lines.push(`${heading} \`${item.name}\``, '')
      if (item.doc) lines.push(item.doc, '')
      lines.push('| Membre | Signature | |', '|---|---|---|')
      for (const member of item.members) {
         const name = member.kind === 'method' ? `${member.name}()` : member.name
         lines.push(`| ${code(name)} | ${code(member.signature || (member.kind === 'getter' ? 'get' : ''))} | ${cell(member.doc)} |`)
      }
      lines.push('')
   }

   const rest = all.filter((entry) => entry.kind !== 'class')
   if (rest.length) {
      lines.push(`${heading} Fonctions, constantes et types`, '', '| Nom | Signature | |', '|---|---|---|')
      for (const item of rest) lines.push(`| ${code(item.name)} | ${code(item.signature || item.kind)} | ${cell(item.doc)} |`)
      lines.push('')
   }

   return lines.join('\n')
}
