# ez-proto — plan

Outil de prototypage rapide pour eZmax/eZsign, utilisé par les devs avec leur agent. Les prototypes sont une version minimaliste de la vraie app qui reflète le brand et les composants de production. ez-proto est un projet distinct du mono: c'est le **blueprint** de l'UI, sa « copie carbone ».

## Principe directeur

L'agent ne doit jamais « inventer » du design. Il compose avec trois couches fermées:

1. **Tokens**: le brand (couleurs, typo, espacements, rayons).
2. **Composants `ez-`**: le vocabulaire, même API que la prod.
3. **Patrons de référence**: la grammaire, c'est-à-dire comment on assemble une vraie page eZsign.

Tout ce qui sort de ces couches est refusé par `pnpm proto check`, pas seulement par une règle écrite.

## Décisions

| Sujet | Décision |
|---|---|
| Stack | Vue 3 + Vite + TypeScript + Tailwind v4. **Pas de Quasar**: le plus lean possible. |
| Composants | Réimplémentation légère avec **la même API que la prod** (noms, props principales, slots). Une certaine duplication avec le mono est voulue. |
| Tokens | **La source vit dans ez-proto** (`blueprint/tokens/`). Le mono en recopie le fichier **à la main** pour le moment. Noms alignés sur le contrat de couleurs de SUM (voir phase A). |
| Stockage | **Fichiers seulement, aucune base de données.** JSON pour ce qu'on interroge (`meta.json`), Markdown pour ce qu'on lit, Vue/TS pour ce qu'on exécute. Pas de DuckDB pour l'instant: il pourra lire les `meta.json` tels quels si le besoin vient. |
| Tâches | **Un prototype = une tâche GoodDay.** Le dossier porte le nom de la branche: `feature/49198-la-tache` → `prototypes/49198-la-tache/`. `meta.json` garde `goodday: { number, url }`. |
| Historique | Dossiers de version immuables `v001`, `v002`, variantes `v002b` (comparables côte à côte dans le shell) + git (qui a changé quoi). |
| Outil | Un seul CLI, `pnpm proto`, pour les devs et pour l'agent: il pose des questions dans un terminal, échoue clairement sinon. |
| Export | HTML autonome et interactif (un seul fichier, CSS/JS inlinés) via `vite-plugin-singlefile`. |
| Public | L'équipe, en local. Déployer le shell en statique pourra venir plus tard. |

## Structure

```
blueprint/                le blueprint de l'UI, ce qu'on maintient
  tokens/                   ez-tokens.css (partagé, copié dans le mono), components.css, CHANGELOG, COPY
  ez/primitives/            composants génériques (le visuel)
  ez/domain/<objet>/        composants métier (des primitives assemblées)
  ez/CATALOG.md             quand utiliser quoi + API générée (catalog.json, components.generated.ts)
  patterns/                 pages de référence: liste, fiche avec TOC, formulaire
  brand/                    mood board, procédure de synchro, captures de prod
  mocks/                    objets métier partagés + fabriques (à graine fixe)
prototypes/
  49198-relance-signataires/
    meta.json               titre, lien GoodDay, statut, version retenue, responsable
    README.md               le brief
    v001/                   index.vue, mocks.ts (scénarios), notes.md
    v002/
    v002b/                  variante parallèle
tool/                     le shell, le frame (iframe) et le CLI proto; on n'y touche pas pour prototyper
  paths.mjs                 la structure, partagée par Vite et le CLI
  cli/                      proto.mjs + une commande par fichier
```

Le shell lit au démarrage les `meta.json`, `README.md` et `notes.md`; les composants et les scénarios d'une version ne sont chargés qu'à son ouverture, pour rester rapide quand les prototypes s'accumulent.

## CLI `pnpm proto`

| Commande | Effet |
|---|---|
| `new <numéro> <lien> "Titre" [--from <patron>]` | Tâche + `v001`, à partir de la tâche GoodDay |
| `iterate [tâche] -m "Résumé" [--from vNNN] [--variant]` | Version suivante, jamais de modification d'une version existante |
| `status <tâche> <statut> [version]` | Statut et version retenue, sans éditer le JSON |
| `list [--status] [--mine] [--all]` | Tableau des tâches, lu dans les `meta.json` |
| `diff [tâche] [avant] [après]` | Différences entre deux versions (par défaut: la dernière et sa source) |
| `open [tâche] [version]` | Ouvre le shell, le démarre au besoin |
| `check [tâche]` | Structure, lien GoodDay, couleurs brutes, primitives, palette Tailwind, hiérarchie et noms des tokens, composants et props connus, règles par niveau, imports, types |
| `catalog` | Régénère catalog.json, l'enregistrement des composants et l'API de CATALOG.md |
| `proposals` / `promote` | Composants proposés dans les prototypes; promotion dans blueprint/ez |
| `export [tâche] [version]` | HTML autonome dans `exports/` |
| `tokens [bump <niveau> -m …] [migrate]` | Version des tokens partagés, nouvelle version + CHANGELOG, réécriture des anciens noms |

Une tâche se désigne par son numéro GoodDay (`49198`, `#49198`), son lien, une partie du nom de son dossier, ou rien depuis son dossier.

## Suite

Le suivi (jalons, checkpoints, critères de sortie) est dans [`ROADMAP.md`](ROADMAP.md).
