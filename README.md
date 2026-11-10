# ez-proto

Prototypes rapides d'écrans eZsign/eZmax, fidèles au brand et aux composants de prod, faits par les devs avec leur agent. Projet distinct du mono: c'est le blueprint de l'UI. Le plan complet est dans [`PLAN.md`](PLAN.md). Pour un premier essai sur une vraie tâche: [`GUIDE-ESSAI.md`](GUIDE-ESSAI.md).

## Démarrer

```bash
pnpm install
pnpm dev        # http://localhost:5180
```

Un seul shell à la fois: le port est fixe, et un deuxième `pnpm dev` répond qu'il est pris au lieu de démarrer ailleurs. `pnpm proto new` et `pnpm proto iterate` préviennent le shell, donc une nouvelle version s'affiche sans le relancer. Sur un lecteur réseau où les modifications n'apparaissent pas du tout: `PROTO_POLL=1 pnpm dev`. Un autre port (deuxième copie du dépôt): `PROTO_PORT=5190 pnpm dev`.

Le tableau de bord liste les prototypes, les patrons de référence et la galerie des composants. Dans un prototype, le panneau de gauche montre la tâche, ses versions et le retour au tableau de bord. Pour chaque version: bascule de scénario de données, largeur (bureau, tablette, mobile), comparaison côte à côte et export HTML. Le prototype seul (pour l'annoter ou le voir en pleine page): l'adresse « Prototype » de `pnpm proto open <tâche>`. Le panneau de gauche se masque (touche `[`) pour donner toute la largeur au prototype; les notes de la version, à droite, sont fermées par défaut et s'ouvrent avec le chevron au bout de la barre du bas ou la touche `]`.

## Un prototype = une tâche GoodDay

Chaque prototype part d'une tâche GoodDay, et son dossier porte le même nom que la branche: `feature/49198-relance-signataires` → `prototypes/49198-relance-signataires/`.

```bash
pnpm proto new 49198 https://www.goodday.work/t/M2nSjU "Relance des signataires" --from detail-page
pnpm proto iterate 49198 -m "Relance groupée avec message"
pnpm proto open 49198
```

Sans arguments, `pnpm proto new` pose les questions. Une tâche se désigne par son numéro GoodDay, son lien, une partie du nom de son dossier, ou rien du tout quand on est dans son dossier.

## Commandes

| Commande | Effet |
|---|---|
| `pnpm proto new <numéro> <lien> "Titre"` | Nouvelle tâche + `v001` (`--from list-page`, `detail-page` ou `edit-form`) |
| `pnpm proto iterate <tâche> -m "Résumé"` | Version suivante copiée de la dernière (`--from v001`, `--variant`) |
| `pnpm proto status <tâche> <statut> [version]` | `draft`, `review`, `chosen` (avec la version retenue) ou `archived` |
| `pnpm proto list` | Les tâches et leur état (`--status review`, `--mine`, `--all`) |
| `pnpm proto diff <tâche> [avant] [après]` | Ce qui a changé entre deux versions |
| `pnpm proto open [tâche] [version]` | Ouvre le shell, et le démarre au besoin |
| `pnpm proto check [tâche]` | Règles de brand, structure, lien GoodDay, imports, types |
| `pnpm proto export <tâche> [version]` | `exports/<tâche>-<version>.html`, autonome et interactif |
| `pnpm proto proposals` | Composants proposés dans les prototypes, les plus demandés d'abord |
| `pnpm proto promote <tâche> <version> <Nom>` | Fait entrer une proposition dans `blueprint/ez` (décision humaine) |
| `pnpm proto catalog` | Régénère le catalogue après un changement dans `blueprint/ez` |
| `pnpm proto tokens` | Version des tokens partagés (`bump patch\|minor\|major -m …`, `migrate`) |

## Avec l'agent

Les règles sont dans `AGENTS.md`, et seulement là: `.cursor/rules/`, `.cursor/commands/` et `.agents/skills/` y renvoient. Commandes prêtes à l'emploi dans `.cursor/commands/`: `new-proto`, `iterate-proto`, `variant-proto`, `export-proto`.

Exemple de demande: « Nouveau prototype pour la tâche #49198 (https://www.goodday.work/t/M2nSjU): permettre au propriétaire de relancer les signataires en retard depuis la fiche du dossier. »

## Structure

```
blueprint/     le blueprint de l'UI: tokens, composants ez-, patrons, brand, mocks
prototypes/    le travail de l'équipe: un dossier par tâche GoodDay
tool/          le shell, le frame et le CLI proto (on n'y touche pas pour prototyper)
```

Tout est en fichiers, sans base de données: JSON pour ce qu'on interroge (`meta.json`), Markdown pour ce qu'on lit, git et les dossiers de version pour l'historique.

## Où modifier quoi

| Besoin | Fichier |
|---|---|
| Couleurs, typo, rayons, breakpoints | `blueprint/tokens/ez-tokens.css`, puis `pnpm proto tokens bump` et copie dans le mono (`blueprint/tokens/COPY.md`) |
| Ton, principes visuels | `blueprint/brand/brand.md` |
| Ajouter un composant | `blueprint/ez/primitives/` ou `blueprint/ez/domain/<objet>/`, puis `pnpm proto catalog` (enregistrement et API générés), sa fiche dans `CATALOG.md` et la galerie. Ou promouvoir une proposition: `pnpm proto promote` |
| Objets métier partagés | `blueprint/mocks/` |
| Patron de page de référence | `blueprint/patterns/` |

## Prochaines étapes

Voir [`ROADMAP.md`](ROADMAP.md): jalons et checkpoints.
