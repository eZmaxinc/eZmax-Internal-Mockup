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
| Source de vérité | **ez-proto le devient, avec le temps**, pour le brand et les composants. Aucun lien avec la librairie du mono (ni dépendance, ni génération): la prod s'observe une fois pour partir juste, puis le sens est ez-proto → mono. |
| Composants | Réécrits ici, **« barebone »**: ce qu'il faut pour une maquette, pas plus. Un dev les **recopie** ensuite dans le mono (voir « Vers le mono »). |
| Tokens | **La source vit dans ez-proto** (`blueprint/tokens/`). Le mono en recopie le fichier **à la main** pour le moment. Trois couches à sens unique (primitives → sémantiques → composants). Couleurs `{rôle}-{modifieur}` du contrat de SUM, un seul sens par modifieur; tailles et espaces sur des échelles; un réglage de composant se lit avec une marche en repli et ne se définit jamais. |
| Stockage | **Fichiers seulement, aucune base de données.** JSON pour ce qu'on interroge (`meta.json`), Markdown pour ce qu'on lit, Vue/TS pour ce qu'on exécute. Pas de DuckDB pour l'instant: il pourra lire les `meta.json` tels quels si le besoin vient. |
| Tâches | **Un prototype = une tâche GoodDay.** Le dossier porte le nom de la branche: `feature/49198-la-tache` → `prototypes/49198-la-tache/`. `meta.json` garde `goodday: { number, url }`. |
| Historique | Dossiers de version `v001`, `v002`, variantes `v002b` (comparables côte à côte dans le shell). C'est le dev qui marque une version: l'agent retouche la dernière en place, et n'en crée une nouvelle que sur demande. Une version est figée dès qu'une suivante existe, qu'elle est retenue ou que la tâche est en revue + git (qui a changé quoi). |
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

## Vers le mono

Le modèle est la copie de fichiers, pas la dépendance.

- **Tokens**: `blueprint/tokens/ez-tokens.css`, un fichier de variables CSS autonome, copié tel quel (`blueprint/tokens/COPY.md`).
- **Composants copiables** (bouton, badge, carte, message…): le fichier `.vue` va tel quel dans le mono. Pour ça il se suffit à lui-même: il ne lit que `ez-tokens.css` et garde ses réglages dans son propre fichier (ex. `ez-btn`: `var(--btn-height, 36px)`).
- **Composants « maquette seulement »** (dialogue, select, datagrid…): la version d'ici suffit pour un prototype, pas pour la prod (focus, clavier, accessibilité, volumes). ez-proto en fixe l'API et le rendu; le mono garde son implémentation derrière la même API.
- **La copie reste lean et ne se modifie jamais dans le mono.** Un besoin spécifique est un composant qui enveloppe la copie, comme les composants métier enveloppent les primitives ici.
- **À décider avec le mono**: la collision de noms avec ses `ez-` existants, et sa dette de migration (`q-btn` utilisé directement).

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
