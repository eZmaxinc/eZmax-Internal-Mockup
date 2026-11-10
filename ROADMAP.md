# Roadmap

Ce qu'il reste à faire, en jalons avec des checkpoints à cocher. Chaque jalon a un **critère de sortie**: on passe au suivant quand il est atteint, pas avant. Les décisions et l'architecture sont dans [`PLAN.md`](PLAN.md). Les essais se font avec [`SCENARIO-TEST.md`](SCENARIO-TEST.md).

Mettre à jour ce fichier dans le même commit que le travail qui coche une case.

---

## Jalon 0 · Fondations ✅

- [x] Projet distinct du mono: `blueprint/`, `prototypes/`, `tool/`, fichiers seulement (JSON, Markdown, git)
- [x] Un prototype = une tâche GoodDay, dossier nommé comme la branche (`49198-la-tache`)
- [x] Versions immuables (`v001`, `v002`, variantes `v002b`), scénarios de données, notes
- [x] CLI `pnpm proto`: `new`, `iterate`, `status`, `list`, `diff`, `open`, `check`, `export`, `catalog`, `proposals`, `promote`, `tokens`
- [x] Shell: versions côte à côte, scénarios, largeurs, clair / sombre, export HTML, panneau de gauche masquable (bouton ou touche `[`)
- [x] Tokens partagés `ez-tokens` 1.1.0 (source ici, copie manuelle vers le mono), contrat de noms de SUM, mode sombre
- [x] Composants à deux niveaux (primitives, composants métier), catalogue et API générés du code
- [x] `proto check`: brand, structure, GoodDay, tokens, composants, props et valeurs connus, règles par niveau, types
- [x] Propositions de composants dans les versions, `proposals` et `promote` (décision humaine)
- [x] Règles et commandes pour l'agent de Cursor, vérification dans son navigateur
- [x] Guide d'essai et scénario de test répétable
- [x] Dépôt `maubut/ez-blueprint`

---

## Jalon 1 · Ajuster le système par des essais ← en cours

Refaire le scénario de test après chaque série de corrections, et noter chaque essai dans le journal de `SCENARIO-TEST.md`.

- [x] **Essai 1** (étape 1 seulement): 12/12. ~40 lectures avant d'écrire; bug d'`ez-dialog` à 390 px contourné sans être signalé
- [x] Corrections après l'essai 1:
  - [x] `ez-dialog` tient dans un écran de 390 px
  - [x] Recette de départ dans `AGENTS.md` (une version en trois fichiers), consigne de ne pas lire `tool/` ni les sources de `blueprint/`
  - [x] API générée de `@mocks` (`blueprint/mocks/API.md`) et des helpers de `@ez` (dans `CATALOG.md`)
  - [x] `EzsignFolder.daysUntilDue()`, `isDueSoon(days)` paramétrable
  - [x] Section « Signalements » dans les notes (`Bug primitive`, `Mock manquant`, `Composant manquant`), regroupés par `proto proposals`
  - [x] `proto check` avertit quand `blueprint/` a des changements non commités
- [x] **Essai 2** (étape 1 seulement, parti des fichiers de l'essai 1): 11/12. A réécrit la v001 existante; signalement d'un vrai bug non collecté; plus aucune lecture de `tool/`
- [ ] Mesurer à chaque essai le nombre de lectures avant la première écriture (objectif: moins de 15)
- [x] Corrections après l'essai 2:
  - [x] Un seul « aujourd'hui » pour les prototypes (`PROTO_TODAY` dans `@ez`), utilisé par les mocks et `formatRelative`
  - [x] `proto proposals` collecte toute la section « Signalements », quel que soit le préfixe
  - [x] Tâche existante: l'agent s'arrête et demande (règles, commande `new-proto`, message de `proto new`)
  - [x] `proto check` avertit quand une version déjà commitée est modifiée
  - [x] Étape 0 du scénario: `main` à jour, `git status` vide, les quatre étapes obligatoires
- [x] **Essai 4** (étape 1 seulement): 12/12, aucune intervention, ~17 lectures, rien de touché hors du prototype. Bloqué par un bug du serveur de dev (contourné seul); a signalé un vrai bug d'`ez-message-important`
- [x] Corrections après l'essai 4:
  - [x] Le serveur de dev surveille `prototypes/` et `blueprint/` (un prototype créé pendant `pnpm dev` n'est plus « Introuvable »)
  - [x] `ez-message-important`: en étroit, les actions passent sous le texte au lieu de l'écraser
  - [x] `EzsignFolder.extendDueDate(days)` (la mécanique; quels états se prolongent reste une décision produit)
  - [x] Shell: plus de lien « Ouvrir ↗ », « Exporter HTML » devient « Exporter »
  - [x] Le compte rendu final reprend « Propositions » et « Signalements »; un bug de primitive vient avec la correction suggérée
- [ ] **Essai 5**: scénario complet, **les quatre étapes** dans la même conversation, poussé seulement après l'étape 4
- [ ] Corrections après l'essai 5
- [ ] Une seule source de règles: `.cursor/rules` et `.agents/skills` renvoient à `AGENTS.md` au lieu de le répéter

**Critère de sortie**: deux essais de suite à **30/32 ou plus**, avec **au plus une intervention**, sans changement non demandé dans `blueprint/`.

---

## Jalon 2 · Fidélité visuelle à la prod

- [ ] Reprendre les vraies couleurs de `quasar.variables.scss` (`$primary`, `$positive`, `$negative`, `$warning`, `$info`…) dans les primitives de `ez-tokens.css`, puis `proto tokens bump patch`
- [ ] Décider si l'app a un mode sombre. Si oui, reprendre ses valeurs; sinon, garder le sombre comme outil d'exploration et l'écrire dans `brand.md`
- [ ] Ajouter 5 à 10 captures annotées dans `blueprint/brand/screens/` (liste, fiche, formulaire, dialogue, état vide, erreur)
- [ ] Finir les TODO de `brand.md` (tutoiement ou vouvoiement, ton)
- [ ] Valider les seuils sur la prod: tiroir de l'app masqué sous md (1024), TOC à droite dès md, en-tête de page qui passe à la ligne sous sm (600)
- [ ] Recaler les primitives les plus visibles, écran par écran, contre les captures: `ez-page-header`, `ez-table`, `ez-card`, `ez-btn`, `ez-field`, `ez-badge`
- [ ] Aligner les clés d'icônes (`blueprint/ez/icons.ts`) sur `ez.icons` de la prod

**Critère de sortie**: côte à côte, le patron « liste » et le vrai écran de liste ne se distinguent pas au premier coup d'œil (couleurs, densité, typo, espacements).

---

## Jalon 3 · La grammaire: patrons et fiches

- [ ] Recaler les 3 patrons actuels (liste, fiche, formulaire) sur de vrais écrans
- [ ] Ajouter des patrons: dialogue de confirmation, état vide et erreur, page de réglages, assistant en étapes
- [ ] Chaque patron a une note « quand l'utiliser » et la capture de l'écran d'origine
- [ ] Compléter les fiches « quand l'utiliser » de chaque composant dans `CATALOG.md`
- [ ] Ajouter la sélection de lignes à `ez-table` si les essais le demandent (piège de l'étape 2 du scénario)

**Critère de sortie**: sur une tâche qui ne ressemble à aucun patron, l'agent choisit un patron adapté sans aide, et son résultat se lit comme un écran eZsign.

---

## Jalon 4 · Pilote avec l'équipe

- [ ] 2 ou 3 vraies tâches GoodDay, faites par au moins 2 devs différents (pas celui qui a construit l'outil)
- [ ] Les devs suivent `GUIDE-ESSAI.md` seuls; noter où ils bloquent
- [ ] Revue des propositions et signalements (`pnpm proto proposals`): promouvoir ce qui revient, corriger les primitives signalées, ajouter les mocks manquants
- [ ] Ajuster les règles, le catalogue et les patrons selon le pilote
- [ ] Décider où vivent les prototypes après le pilote (ce dépôt, une branche par tâche, ou `main` directement)

**Critère de sortie**: un dev qui n'a pas construit l'outil livre un prototype utile pour sa tâche, sans aide, et le réutiliserait.

---

## Jalon 5 · Partage avec le mono

- [ ] Première copie de `ez-tokens.css` dans `ezmax-library-quasar` (procédure: `blueprint/tokens/COPY.md`), notée dans le tableau des copies
- [ ] Vérifier que le mode sombre de Quasar (`body--dark`) suit les tokens dans le mono
- [ ] Décider si et comment le mono reprend les primitives d'ez-proto (même mécanisme que les tokens: version, CHANGELOG, copie)
- [ ] Première primitive reprise par le mono

**Critère de sortie**: le mono et ez-proto partagent la même version de `ez-tokens`, et l'équipe sait comment une primitive passe de l'un à l'autre.

---

## Plus tard, si le besoin se confirme

- [ ] Boutons « Nouvelle version » et « Variante » dans le shell
- [ ] `proto new` qui préremplit le brief depuis l'API GoodDay (jeton par dev dans `.env`)
- [ ] Shell déployé en statique pour partager des liens aux PM
- [ ] Capture automatique de chaque version (vignettes dans le shell, auto-vérification de l'agent)
- [ ] `pnpm proto index` → `prototypes.json`, pour interroger avec DuckDB si les prototypes se comptent par centaines
