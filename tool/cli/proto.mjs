#!/usr/bin/env node
/**
 * proto — create and maintain prototypes. Run through yarn: `yarn proto <command> …`
 * Asks for what is missing in an interactive terminal; fails with a clear message otherwise (agents, CI).
 */
const COMMANDS = {
   new: 'Nouvelle tâche (un titre, GoodDay facultatif), avec sa v001',
   iterate: 'Version suivante d\'une tâche (copie de la dernière)',
   list: 'Liste des tâches',
   status: 'Change le statut ou la version retenue',
   open: 'Ouvre une tâche dans le shell',
   diff: 'Différences entre deux versions',
   check: 'Vérifie les règles (brand, structure, imports, types)',
   export: 'Exporte une version en HTML autonome',
   catalog: "Régénère le catalogue des composants (API, enregistrement, CATALOG.md)",
   proposals: "Composants proposés dans les prototypes",
   promote: "Fait entrer dans blueprint/ez un composant créé, rehaussé ou proposé dans une version (décision humaine)",
   tokens: 'Version des tokens partagés, nouvelle version, migration des noms',
}

const HELP = `
proto — prototypes ez-proto

Usage: yarn proto <commande> [arguments]

${Object.entries(COMMANDS).map(([name, text]) => `  ${name.padEnd(10)} ${text}`).join('\n')}

Exemples:
  yarn proto new "Relance des signataires" --from detail-page
  yarn proto new "Relance des signataires" 49198 https://www.goodday.work/t/M2nSjU   # GoodDay facultatif
  yarn proto iterate relance -m "Relance groupée avec message"
  yarn proto iterate relance --from v001 -m "Variante: relance depuis la liste"
  yarn proto status relance chosen v002
  yarn proto open relance
  yarn proto diff relance v001 v002
  yarn proto check relance
  yarn proto export relance v002
  yarn proto tokens bump patch -m "Couleurs de la prod"

Une tâche se désigne par le nom de son dossier ou une partie (relance), son numéro ou son lien
GoodDay s'il est connu, ou rien du tout si la commande est lancée depuis son dossier.
`

const [command, ...rest] = process.argv.slice(2)

if (!command || command === 'help' || command === '--help' || command === '-h') {
   console.log(HELP)
   process.exit(0)
}

if (!COMMANDS[command]) {
   console.error(`✗ Commande inconnue « ${command} ».`)
   console.log(HELP)
   process.exit(1)
}

const module = await import(`./commands/${command}.mjs`)
await module.run(rest)
