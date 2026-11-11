#!/usr/bin/env node
/**
 * proto — create and maintain prototypes. Run through pnpm: `pnpm proto <command> …`
 * Asks for what is missing in an interactive terminal; fails with a clear message otherwise (agents, CI).
 */
const COMMANDS = {
   new: 'Nouvelle tâche à partir d\'une tâche GoodDay, avec sa v001',
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

Usage: pnpm proto <commande> [arguments]

${Object.entries(COMMANDS).map(([name, text]) => `  ${name.padEnd(10)} ${text}`).join('\n')}

Exemples:
  pnpm proto new 49198 https://www.goodday.work/t/M2nSjU "Relance des signataires" --from detail-page
  pnpm proto iterate 49198 -m "Relance groupée avec message"
  pnpm proto iterate 49198 --variant -m "Relance depuis la liste"
  pnpm proto status 49198 chosen v002
  pnpm proto open 49198
  pnpm proto diff 49198 v001 v002
  pnpm proto check 49198
  pnpm proto export 49198 v002
  pnpm proto tokens bump patch -m "Couleurs de la prod"

Une tâche se désigne par son numéro GoodDay (49198 ou #49198), son lien GoodDay, une partie
du nom de son dossier, ou rien du tout si la commande est lancée depuis son dossier.
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
