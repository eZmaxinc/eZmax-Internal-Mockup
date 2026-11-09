# Scénario de test répétable

Un scénario fixe, à refaire tel quel après chaque ajustement du système (règles, catalogue, patrons, check), pour voir si l'agent s'améliore. Mêmes demandes, mot pour mot, mêmes attentes, et un journal pour comparer les essais.

La tâche est fictive (#90001), mais réaliste, et elle n'est couverte par aucun prototype existant: l'agent ne peut pas recopier la démo.

**Ce que le scénario couvre:**
- partir d'un patron;
- écrire des scénarios de données, dont un cas vide;
- utiliser un composant métier existant;
- proposer un composant métier;
- buter sur un manque d'une primitive (la sélection de lignes);
- itérer, faire une variante, retenir une version, exporter.

---

## 0. Préparer l'essai

1. **Repartir de zéro** (aucune trace d'un essai précédent):
   ```bash
   rm -rf prototypes/90001-* exports/90001-*
   ```
   ```bash
   git status
   ```
   `git status` ne doit rien montrer dans `blueprint/`. Si un essai précédent y a laissé des changements (une promotion, par exemple):
   ```bash
   git restore blueprint/ && git clean -fd blueprint/
   ```
2. **Noter le commit testé**, pour le journal:
   ```bash
   git rev-parse --short HEAD
   ```
3. **Lancer le shell** dans un terminal de Cursor, et le laisser tourner:
   ```bash
   pnpm dev
   ```
4. **Ouvrir une nouvelle conversation d'agent** dans Cursor, avec `ez-proto` comme dossier racine. Toujours une conversation neuve, et toujours le même modèle, à noter dans le journal.
5. Démarrer un chronomètre.

**Règle de l'essai**: coller les demandes telles quelles, sans aider l'agent. S'il pose une question, répondre brièvement et compter une **intervention**. S'il se trompe, ne pas corriger à sa place: noter le problème.

---

## 1. Création

**Coller:**

> Nouveau prototype pour la tâche #90001 (https://www.goodday.work/t/TEST01): « Prolonger les dossiers qui expirent bientôt ».
>
> Contexte: les propriétaires découvrent trop tard que leurs dossiers expirent, et les signataires ne peuvent alors plus signer. On veut, depuis la liste des dossiers, voir ceux qui expirent dans les 7 prochains jours et pouvoir prolonger leur échéance.
>
> Contraintes: on ne prolonge pas un dossier complété ou refusé. Une prolongation est de 7, 14 ou 30 jours.

**Attendu:**

| # | Point | ✓ |
|---|---|---|
| 1.1 | Lance `pnpm proto new 90001 https://www.goodday.work/t/TEST01 "…"`, avec `--from list-page` | |
| 1.2 | Le dossier se nomme `prototypes/90001-<slug>/` | |
| 1.3 | `README.md` est rempli: contexte, ce qu'on veut voir, contraintes, hors portée | |
| 1.4 | `mocks.ts` a au moins 2 scénarios, dont un sans dossier qui expire (état vide) et des dossiers complétés ou refusés | |
| 1.5 | Le statut des dossiers passe par `<ez-badge-folder-state>`, pas par `<ez-badge :tone="…stateTone()">` | |
| 1.6 | La prolongation passe par `ez-dialog` + `ez-field type="select"` (7, 14, 30 jours) | |
| 1.7 | Le bouton de prolongation est absent ou désactivé pour un dossier complété ou refusé | |
| 1.8 | Pas de HTML brut (`<button>`, `<input>`, `<table>`), pas de couleur inventée | |
| 1.9 | `pnpm proto check 90001` passe, et l'agent l'a lancé lui-même | |
| 1.10 | Il a ouvert le prototype dans son navigateur: chaque scénario, le sombre, 390 px | |
| 1.11 | Il répond avec la tâche, la version, un résumé et ses questions ouvertes | |
| 1.12 | Textes en français, vouvoiement, pas d'espace avant le deux-points | |

**Regarder soi-même** dans le shell (`http://localhost:5180`): chaque scénario, Clair / Sombre, Mobile. Ça ressemble à eZsign? Note de 1 à 5.

---

## 2. Itération

**Coller:**

> Retour: l'échéance doit se voir d'un coup d'œil dans le tableau, avec le nombre de jours restants, et une couleur selon l'urgence (moins de 3 jours = urgent). Et je veux pouvoir prolonger plusieurs dossiers d'un coup.

**Attendu:**

| # | Point | ✓ |
|---|---|---|
| 2.1 | Lance `pnpm proto iterate 90001 -m "…"`: la nouvelle version est `v002` | |
| 2.2 | `v001` n'a pas changé (`git status` ne montre rien dans `v001/`) | |
| 2.3 | L'échéance passe par une **proposition de composant métier** dans `v002/components/`, par exemple `EzBadgeFolderDue.vue`, avec l'en-tête `<!-- @proposal domain folder: … -->` | |
| 2.4 | Elle est nommée `ez-badge-…` ou `ez-folder-…`, et importée dans `index.vue` | |
| 2.5 | Elle n'a ni couleur, ni bordure, ni ombre à elle: l'urgence passe par le `tone` d'`ez-badge` | |
| 2.6 | La sélection de plusieurs lignes **n'existe pas** dans `ez-table`. Attendu: soit une alternative avec les composants existants (par exemple « Prolonger les N qui expirent » en un clic), soit une proposition de primitive bien justifiée. Dans les deux cas, c'est écrit dans `notes.md`. **Échec**: des cases à cocher en `<input>` brut | |
| 2.7 | `notes.md` de `v002`: résumé en première ligne, changements, propositions, questions ouvertes | |
| 2.8 | `pnpm proto check 90001` passe, et la proposition apparaît en ⚠ | |
| 2.9 | Vérification dans le navigateur refaite | |

**Faire soi-même:**

```bash
pnpm proto diff 90001
```

```bash
pnpm proto proposals
```

---

## 3. Variante

**Coller:**

> Montre une autre approche: au lieu d'une colonne dans le tableau, un bandeau en haut de la liste qui résume les dossiers à risque, avec l'action de prolonger.

**Attendu:**

| # | Point | ✓ |
|---|---|---|
| 3.1 | Lance `pnpm proto iterate 90001 --variant -m "…"`: la nouvelle version est `v002b` | |
| 3.2 | `v001` et `v002` n'ont pas changé | |
| 3.3 | Le bandeau est un `ez-message-important` (`type="warning"`) avec l'action dans `#actions`, pas un bloc fait à la main | |
| 3.4 | Un seul bouton primaire par zone | |
| 3.5 | Le scénario sans dossier à risque n'affiche pas de bandeau vide | |
| 3.6 | `pnpm proto check 90001` passe, vérification dans le navigateur refaite | |

**Faire soi-même**: dans le shell, comparer `v002` et `v002b` côte à côte.

---

## 4. Conclure

**Coller:**

> On retient la v002. Exporte-la.

**Attendu:**

| # | Point | ✓ |
|---|---|---|
| 4.1 | Lance `pnpm proto status 90001 chosen v002` (sans modifier `meta.json` à la main) | |
| 4.2 | Lance `pnpm proto export 90001`: crée `exports/90001-<slug>-v002.html` | |
| 4.3 | Le fichier s'ouvre sans serveur, avec ses scénarios et le bouton clair / sombre | |
| 4.4 | Il ne promeut pas la proposition de lui-même (décision humaine) | |
| 4.5 | `blueprint/` n'a pas changé (`git status`) | |

---

## 5. Noter l'essai

Arrêter le chronomètre, puis remplir une ligne du journal ci-dessous.

- **Points**: le nombre de ✓ sur 32.
- **Interventions**: chaque fois qu'il a fallu répondre ou débloquer l'agent.
- **Ressemblance**: de 1 à 5, sur l'impression d'ensemble de la v002.
- **Problème principal**: le défaut le plus gênant de cet essai.
- **Correction**: ce qu'on a changé dans le système à cause de ce défaut, avant l'essai suivant.

Où corriger quoi:

| L'agent… | On corrige… |
|---|---|
| ne suit pas une consigne | `AGENTS.md` (ou `.cursor/rules/`) |
| utilise mal un composant | sa fiche « quand l'utiliser » dans `blueprint/ez/CATALOG.md` |
| assemble mal une page | un patron dans `blueprint/patterns/` |
| contourne une règle sans que rien ne le signale | `pnpm proto check` (`tool/cli/commands/check.mjs`) |

Puis repartir de l'étape 0.

## Journal des essais

| Date | Commit | Modèle | Points /32 | Interventions | Durée | Ressemblance /5 | Problème principal | Correction apportée |
|---|---|---|---|---|---|---|---|---|
| 2026-11-09 | 5fa3ca0 | (non noté) | 12/12 (étape 1 seulement) | 0 | | | ~40 lectures avant d'écrire (CLI, helpers, sources des primitives); bug d'`ez-dialog` à 390 px contourné dans la proposition sans être signalé | Recette dans `AGENTS.md`, API générée de `@mocks` et des helpers, « Signalements » dans les notes, avertissement sur `blueprint/` modifié, `ez-dialog` corrigé, `daysUntilDue()` |
| | | | | | | | | |
