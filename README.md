# eZmax-Internal-Mockup
Internal proof of concepts and mockups

The public site can be seen here: https://ezmaxinc.github.io/eZmax-Internal-Mockup/

[![Deploy to GitHub Pages](https://github.com/eZmaxinc/eZmax-Internal-Mockup/actions/workflows/build.yaml/badge.svg)](https://github.com/eZmaxinc/eZmax-Internal-Mockup/actions/workflows/build.yaml)

Un outil de mockups pour l'agent de Cursor, à la manière des Artifacts: on décrit un écran eZsign/eZmax, l'agent le construit, on le voit tout de suite dans le navigateur et on l'ajuste en parlant. Les mockups suivent nos styles et nos composants, se rangent par tâche GoodDay et gardent leurs versions.

Projet distinct du mono, sans lien avec sa librairie. `blueprint/` est le relevé de notre UI (tokens, composants, patrons); un dev reporte à la main dans l'app ce qui mérite d'y aller.

## Démarrer

```bash
yarn install
yarn dev        # http://localhost:5180
```

Yarn 1 (`packageManager` dans `package.json`). Pas de commande `yarn`: `corepack enable yarn`.

Ouvrir `ez-mockup` comme dossier racine dans Cursor (pas le mono), le shell dans le navigateur de Cursor, puis demander:

> Nouveau mockup: permettre au propriétaire de relancer les signataires en retard depuis la fiche du dossier.

La tâche GoodDay (numéro, lien) s'ajoute si on l'a, sans être nécessaire.

Un seul shell à la fois: le port est fixe. Une version créée s'affiche sans le relancer. Sur un lecteur réseau où les modifications n'apparaissent pas: `MOCKUP_POLL=1 yarn dev`. Un autre port: `MOCKUP_PORT=5190 yarn dev`.

## Comment ça marche

- **Un mockup = une tâche.** Son dossier porte le nom de son titre, sans numéro: `mockups/relance-signataires/`. Le numéro et le lien GoodDay, quand on les a, vont dans `meta.json`.
- **L'agent réutilise ce qui existe et invente le reste dans le même genre.** Un composant `ez-` quand il y en a un, les tokens pour toute couleur. Ce qui n'existe pas (une ligne du temps, un canevas) se construit dans la version. Il peut aussi rehausser un composant existant, dans une copie locale.
- **Le dev marque les versions.** Un retour s'applique en place dans la dernière version; une nouvelle version se demande. Les versions se suivent (`v001`, `v002`, `v003`…): une variante est la version suivante, son résumé commence par « Variante: » et le shell dit de quelle version elle part.
- **Le check à chaque fois, le navigateur quand ça paie.** `yarn mockup check` garde la conformité (couleurs, composants, types) en quelques secondes. L'agent ne refait pas le tour du navigateur à chaque retouche: tu regardes la même page que lui.
- **L'humain synchronise.** `yarn mockup proposals` montre ce que les mockups ont créé, rehaussé ou proposé; `yarn mockup promote` le fait entrer dans `blueprint/`. Rien de ça ne bloque un mockup.

Les règles de l'agent sont dans [`AGENTS.md`](AGENTS.md), et seulement là: `.cursor/` et `.agents/` y renvoient. Commandes prêtes dans Cursor: `/new-mockup`, `/iterate-mockup`, `/variant-mockup`, `/export-mockup`.

## Le shell

Le tableau de bord liste les mockups, les patrons de référence et la galerie des composants. Dans un mockup: les versions à gauche (touche `[`), les notes à droite (touche `]`), et en bas le scénario de données, la largeur, clair ou sombre, la comparaison côte à côte et l'export. L'adresse porte ces choix: `?scenario=<nom>&theme=dark&width=mobile`.

**Partager une maquette**: dans la barre du bas, « Partager » copie un lien vers la version à l'écran, `#/s/<code>`. Il n'affiche qu'elle: ni panneau de gauche, ni autres tâches, ni comparaison, ni export. Ajouter `?version=all` au lien (`#/s/<code>?version=all`) donne toutes les versions de cette tâche, avec un menu pour passer de l'une à l'autre, et toujours rien des autres tâches. Le code ne dit pas la version: changer une lettre ne mène nulle part. Ça cadre ce qu'on montre, ce n'est pas un contrôle d'accès: le site publié contient tous les mockups pour qui va les chercher.

## Commandes

| Commande | Effet |
|---|---|
| `yarn mockup new "Titre" [numéro] [lien]` | Nouvelle tâche + `v001` (`--from list-page`, `detail-page` ou `edit-form`); le numéro et le lien GoodDay sont facultatifs |
| `yarn mockup iterate <tâche> -m "Résumé"` | Version suivante copiée de la dernière (`--from v001` pour partir d'une autre, une variante par exemple) |
| `yarn mockup check [tâche]` | Couleurs, composants et props connus, structure, imports, types |
| `yarn mockup open [tâche] [version]` | Donne l'adresse du shell |
| `yarn mockup diff <tâche> [avant] [après]` | Ce qui a changé entre deux versions |
| `yarn mockup status <tâche> <statut> [version]` | `draft`, `review`, `chosen` (avec la version retenue) ou `archived`. Aussi d'un clic dans le shell: le statut de la tâche ouvre la liste des statuts, et l'étoile (☆) sur la ligne d'une version la retient |
| `yarn mockup list` | Les tâches et leur état (`--status review`, `--mine`, `--all`) |
| `yarn mockup export <tâche> [version]` | `exports/<tâche>-<version>.html`, un seul fichier, interactif |
| `yarn mockup proposals` | Ce que les mockups ont créé, rehaussé ou proposé, et leurs signalements |
| `yarn mockup promote <tâche> <version> <Nom>` | Fait entrer un composant d'une version dans `blueprint/ez` (un rehaussé remplace l'original) |
| `yarn mockup catalog` | Régénère le catalogue après un changement dans `blueprint/ez` |
| `yarn mockup tokens` | Version des tokens (`bump patch\|minor\|major -m …`) |

Une tâche se désigne par une partie du nom de son dossier, ou par son numéro ou son lien GoodDay si elle en a un. Sans arguments, dans un terminal, `yarn mockup new` pose les questions.

## Structure

```
blueprint/             le relevé de notre UI
  tokens/                ez-tokens.css (primitives → sémantiques), CHANGELOG, COPY
  ez/components/<nom>/   un dossier par composant, comme dans l'app: ez-<nom>.vue et sa démo ez-<nom>.example.vue
  ez/CATALOG.md          quand utiliser quoi + API générée du code
  patterns/              pages de référence: liste, fiche, formulaire
  brand/                 principes, captures de prod annotées
  mocks/                 objets métier et fabriques, à graine fixe
mockups/<tâche>/    meta.json, v001/{index.vue, mocks.ts, notes.md, components/}
tool/                  le shell, le cadre et le CLI; on n'y touche pas pour faire un mockup
```

Tout est en fichiers, sans base de données: JSON pour ce qu'on interroge, Markdown pour ce qu'on lit, git et les dossiers de version pour l'historique. Vue 3, Vite, TypeScript et Tailwind v4, sans Quasar.

## Où modifier quoi

| Besoin | Fichier |
|---|---|
| L'agent ne suit pas une consigne | `AGENTS.md` |
| Il utilise mal un composant | sa fiche dans `blueprint/ez/CATALOG.md` |
| Il assemble mal une page | un patron dans `blueprint/patterns/` |
| Il contourne une règle sans que rien ne le dise | `tool/cli/commands/check.mjs` |
| Couleurs, typo, rayons | `blueprint/tokens/ez-tokens.css`, puis `yarn mockup tokens bump` |
| Ton, principes visuels, captures | `blueprint/brand/` |
| Un composant | `blueprint/ez/`, puis `yarn mockup catalog`; ou `yarn mockup promote` depuis un mockup |
| Objets métier partagés | `blueprint/mocks/` |

## Vers le mono

De la copie de fichiers, jamais une dépendance. `ez-tokens.css` se copie tel quel (`blueprint/tokens/COPY.md`). Un composant simple (bouton, badge, carte) peut se recopier; un composant complexe (dialogue, tableau) fixe ici l'API et le rendu, et le mono garde son implémentation. Rien n'a encore été copié.

## Suite

[`ROADMAP.md`](ROADMAP.md): ce qu'il reste à faire. [`ESSAI.md`](ESSAI.md): comment essayer l'outil et mesurer s'il tient sa promesse.
