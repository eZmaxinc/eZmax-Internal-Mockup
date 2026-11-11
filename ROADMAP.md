# Roadmap

Ce qu'il reste à faire, en jalons avec des checkpoints à cocher. Chaque jalon a un **critère de sortie**: on passe au suivant quand il est atteint, pas avant. Les décisions et l'architecture sont dans [`PLAN.md`](PLAN.md). Les essais se font avec [`SCENARIO-TEST.md`](SCENARIO-TEST.md).

Mettre à jour ce fichier dans le même commit que le travail qui coche une case.

---

## Jalon 0 · Fondations ✅

- [x] Projet distinct du mono: `blueprint/`, `prototypes/`, `tool/`, fichiers seulement (JSON, Markdown, git)
- [x] Un prototype = une tâche GoodDay, dossier nommé comme la branche (`49198-la-tache`)
- [x] Versions en dossiers (`v001`, `v002`, variantes `v002b`), figées dès qu'une suivante existe, scénarios de données, notes
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
- [ ] **Essai 5** (après le jalon 2, pour ne pas ajuster l'agent sur des couleurs et des noms provisoires): scénario complet, **les quatre étapes** dans la même conversation, poussé seulement après l'étape 4
- [ ] Corrections après l'essai 5
- [x] **Essai 7** (étapes 1 à 3): 25/27, 1 intervention. Un shell relancé à chaque version (dépôt en `G:\`), 22 lectures avant d'écrire, `v001` trop riche, tableau de `v002` trop large pour sa carte
- [ ] Corrections après l'essai 7:
  - [x] `proto new` et `proto iterate` préviennent le shell; port fixe strict; `PROTO_POLL=1`; un seul shell à l'étape 0
  - [x] Vérification proportionnée (règle 8): un coup d'œil pour une itération ou une variante, la tournée complète pour une `v001`, un changement de structure, sur demande ou avant la revue (l'itération de l'essai 7 a pris ~18 min, surtout en navigateur)
  - [ ] Mesurer `pnpm proto check 90001` sur le poste en RDP (3,6 s en local): au-delà de 15 s, cloner le dépôt sur un disque local plutôt que `G:\`
  - [x] C'est l'humain qui marque les versions (règle 4): un retour se fait en place dans la dernière version; une nouvelle version seulement sur demande. Figée: une version plus ancienne, la version retenue, ou une tâche sortie du brouillon (`proto check` le signale)
  - [ ] Faire valider ce principe par le team lead, et le jouer dans un essai (points 2.10 à 2.12 du scénario)
  - [x] L'agent ouvre le shell, plus le cadre seul: l'adresse du shell porte le scénario, le thème et la largeur (`?scenario=…&theme=dark&width=mobile`), donc l'agent et le dev regardent la même page
  - [ ] Vérifier dans Cursor que l'agent lit et clique bien dans le prototype à travers le cadre du shell (sinon, lui redonner `frame.html` pour les interactions seulement)
  - [x] Essai 8: `v001` « Introuvable » dans le shell juste après `proto new`. Le signal du CLI passait par le surveillant de fichiers (chemins en `G:\`, alors que Vite connaît les fichiers en `C:\`): il vide maintenant le registre directement. Testé avec un lecteur alias et une surveillance sourde
  - [ ] Le confirmer sur le poste de travail (essai 9), shell relancé après le `git pull`
  - [x] Le `README.md` d'une tâche est facultatif: seulement les contraintes données (titre et lien GoodDay sont dans `meta.json`)
  - [x] Règles 1 et 2: réutiliser ce qui existe, inventer le reste avec les tokens. Un morceau local (`components/Nom.vue`) n'a plus besoin d'en-tête; une proposition seulement s'il est réutilisable. `proto check` refuse un `<button>`, `<input>`, `<table>` brut; `proto proposals` liste le visuel local
  - [x] Règle 8: le check à chaque fois; aucun navigateur pour une retouche, un seul chargement pour une nouvelle version, la tournée complète sur demande ou avant la revue
  - [x] Essai à blanc d'une interface nouvelle (ligne du temps, couloirs par signataire): `v001`, une retouche et `v002` passent le check; trouvé et corrigé: un composant local ne pouvait pas importer le `mocks.ts` de sa version
  - [ ] Rejouer cet essai dans Cursor, en mesurant le temps entre la demande et le changement à l'écran (cible: moins de 2 minutes pour une retouche)
  - [ ] Vérifier sur le dépôt en `G:\` qu'une version créée s'affiche sans relancer le shell
  - [ ] `AGENTS.md`: ne pas lire les autres prototypes; ouvrir chaque scénario par son URL; la `v001` est la plus petite réponse au brief
  - [ ] `ez-card`: l'en-tête passe à la ligne quand `#actions` a plusieurs boutons (signalé à l'essai 7, avec le correctif)
  - [ ] `ez-table`: sélection de lignes (demandée par l'essai 7)
  - [ ] Sortir le commit de l'essai 7 de `main` (branche `essai/7`), sinon l'étape 0 ne donne plus un `git status` vide
- [x] Une seule source de règles: `.cursor/rules`, `.cursor/commands` et `.agents/skills` renvoient à `AGENTS.md` au lieu de le répéter (les flux `new`, `iterate`, `variant`, `export` y sont décrits)
- [ ] Essayer le « click and comment » du navigateur de Cursor sur un prototype: l'agent retrouve-t-il la bonne ligne de `index.vue`? Sinon, ajouter en dev un attribut qui donne le fichier et la ligne de chaque élément

**Critère de sortie**: deux essais de suite à **33/35 ou plus**, avec **au plus une intervention**, sans changement non demandé dans `blueprint/`.

---

## Jalon 2 · Fidélité visuelle à la prod

Un relevé unique de la prod, pas un lien: ez-proto devient la source de vérité, mais il doit partir de ce que la prod montre aujourd'hui, sinon le mono n'adoptera rien.

- [x] `ez-tokens` 2.0.0, réécrit: un seul sens par modifieur (`surface-{variante}` / `foreground-{variante}`), échelles d'espace et de taille, primitives ancrées sur les couleurs de la marque (on n'a pas recopié `quasar.variables.scss`, seulement ses couleurs d'ancrage)
- [ ] Valider les valeurs à l'œil contre la prod: `warning` et `info` (trop pâles pour du texte sur blanc, d'où `foreground-warning` et `foreground-info`), la police
- [ ] Place des couleurs de marque non utilisées par l'app (rouge `#d02c2f`, mauve, turquoise): des primitives à ajouter seulement quand un rôle les demande
- [ ] Décider si l'app a un mode sombre. Si oui, reprendre ses valeurs; sinon, garder le sombre comme outil d'exploration et l'écrire dans `brand.md`
- [ ] Ajouter 5 à 10 captures annotées dans `blueprint/brand/screens/` (liste, fiche, formulaire, dialogue, état vide, erreur)
- [ ] Finir les TODO de `brand.md` (tutoiement ou vouvoiement, ton)
- [ ] Valider les seuils sur la prod: tiroir de l'app masqué sous md (1024), TOC à droite dès md, en-tête de page qui passe à la ligne sous sm (600)
- [ ] Recaler les primitives les plus visibles, écran par écran, contre les captures: `ez-page-header`, `ez-table`, `ez-card`, `ez-btn`, `ez-field`, `ez-badge`
- [ ] Aligner les clés d'icônes (`blueprint/ez/icons.ts`) sur `ez.icons` de la prod

**Critère de sortie**: côte à côte, le patron « liste » et le vrai écran de liste ne se distinguent pas au premier coup d'œil (couleurs, densité, typo, espacements).

---

## Jalon 3 · Le contrat: ce qui se copie dans le mono

ez-proto devient, avec le temps, la source de vérité du brand et des composants. Les composants y sont écrits « barebone », pour les maquettes; un dev les recopie ensuite dans le mono. Aucune dépendance entre les deux dépôts: des fichiers copiés, versionnés. Le détail est dans [`PLAN.md`](PLAN.md) (« Vers le mono »).

- [ ] Statut de copie de chaque composant dans `CATALOG.md`: **copiable** (le fichier va tel quel dans le mono: bouton, badge, carte, message, état vide, grille) ou **maquette seulement** (ez-proto fixe l'API et le rendu, le mono garde son implémentation: dialogue, select, datagrid)
- [ ] Statuer sur chaque écart de nom avec la prod, et l'écrire dans le catalogue (aligné, cible, propre à ez-proto): `ez-field` ↔ `ez-input` / `ez-select` / `ez-toggle`, `ez-table` ↔ `ez-datagrid`, `ez-info-list` ↔ `ez-info`, `ez-empty-state` (absent de la prod)
- [ ] Borner le vocabulaire: quels composants de la prod forment le design system (à reprendre ici), lesquels restent du métier propre aux apps
- [ ] Chaque primitive copiable se copie seule: ses réglages dans son fichier, plus rien dans `components.css`
  - [x] `ez-btn` (`--btn-height`, `--btn-height-sm`, `--btn-padding-x` en valeurs de repli dans le composant)
  - [x] `ez-card` (`--card-padding`, 16 px sous sm), `ez-layout` et `ez-layout-col` (`--card-gap`); `ez-dialog` et `ez-page-section` lisent les mêmes réglages avec la même valeur de repli
  - [x] `ez-badge`, `ez-message-important`, `ez-empty-state`: déjà autonomes (tokens seulement, plus `EzIcon` et `icons.ts` pour les deux derniers)
  - [x] Les valeurs de repli sont des marches d'échelle d'`ez-tokens.css` (`--space-gap-md`, `--space-inset-lg`, `--size-control-md`), plus des valeurs répétées
- [ ] `pnpm proto copy <Composant>`: liste les fichiers à prendre et leurs dépendances (`EzIcon`, `icons.ts`), ajoute l'en-tête de provenance (version, « ne pas modifier la copie »)
- [ ] Version et CHANGELOG des composants, comme pour les tokens
- [ ] Règle du mono: la copie ne se modifie jamais; un besoin spécifique est un composant qui enveloppe la copie (comme les composants métier ici)
- [ ] Gouvernance de `blueprint/`: un responsable, une revue obligatoire sur ce dossier (les prototypes bougent vite, pas le blueprint)

**Critère de sortie**: pour chaque composant du catalogue, on sait s'il se copie, sous quel nom, et à quelle version.

---

## Jalon 4 · Pilote dans le mono

Prouver le trajet ez-proto → mono sur le plus petit cas possible. Tant que le mono ne consomme rien, ez-proto n'est la source de rien.

- [ ] Première copie de `ez-tokens.css` dans `ezmax-library-quasar` (procédure: `blueprint/tokens/COPY.md`), notée dans le tableau des copies
- [ ] Vérifier que le mode sombre de Quasar (`body--dark`) suit les tokens dans le mono
- [ ] Première primitive copiée: `ez-btn` (ou `ez-badge`), avec `EzIcon` et `icons.ts`
- [ ] Vérifier que le CSS global de Quasar ne déteint pas sur la copie (boutons, typo, `box-sizing`)
- [ ] Décider de la collision de noms: le mono a déjà ses `ez-btn`, `ez-card`, `ez-dialog`. La copie remplace l'existant (API compatible ou migration des usages), ou les deux cohabitent un temps sous des noms différents
- [ ] Chiffrer la dette de migration du mono (ex.: `q-btn` utilisé directement bien plus souvent qu'`ez-btn`) et décider qui la porte, à quel rythme

**Critère de sortie**: le mono et ez-proto partagent la même version de `ez-tokens` et un composant copié sans modification, et l'équipe sait refaire le trajet.

---

## Jalon 5 · La grammaire: patrons et fiches

- [ ] Recaler les 3 patrons actuels (liste, fiche, formulaire) sur de vrais écrans
- [ ] Ajouter des patrons: dialogue de confirmation, état vide et erreur, page de réglages, assistant en étapes
- [ ] Chaque patron a une note « quand l'utiliser » et la capture de l'écran d'origine
- [ ] Compléter les fiches « quand l'utiliser » de chaque composant dans `CATALOG.md`
- [ ] Ajouter la sélection de lignes à `ez-table` si les essais le demandent (piège de l'étape 2 du scénario)

**Critère de sortie**: sur une tâche qui ne ressemble à aucun patron, l'agent choisit un patron adapté sans aide, et son résultat se lit comme un écran eZsign.

---

## Jalon 6 · Pilote avec l'équipe

- [ ] 2 ou 3 vraies tâches GoodDay, faites par au moins 2 devs différents (pas celui qui a construit l'outil)
- [ ] Les devs suivent `GUIDE-ESSAI.md` seuls; noter où ils bloquent
- [ ] Revue des propositions et signalements (`pnpm proto proposals`): promouvoir ce qui revient, corriger les primitives signalées, ajouter les mocks manquants
- [ ] Ajuster les règles, le catalogue et les patrons selon le pilote
- [ ] Décider où vivent les prototypes après le pilote (ce dépôt, une branche par tâche, ou `main` directement)

**Critère de sortie**: un dev qui n'a pas construit l'outil livre un prototype utile pour sa tâche, sans aide, et le réutiliserait.

---

## Plus tard, si le besoin se confirme

- [ ] Boutons « Nouvelle version » et « Variante » dans le shell
- [ ] `proto new` qui préremplit le brief depuis l'API GoodDay (jeton par dev dans `.env`)
- [ ] Shell déployé en statique pour partager des liens aux PM
- [ ] Capture automatique de chaque version (vignettes dans le shell, auto-vérification de l'agent)
- [ ] `pnpm proto index` → `prototypes.json`, pour interroger avec DuckDB si les prototypes se comptent par centaines
