# Roadmap

Ce qu'il reste à faire, par ordre d'importance. Ce qui est fait est dans git.

## 1. Prouver la vitesse dans Cursor

Le critère: le temps entre la demande et le changement à l'écran. Tout ce qui a été mesuré depuis les nouvelles règles l'a été hors de Cursor.

- [ ] Jouer [`ESSAI.md`](ESSAI.md) sur le poste de travail, après `git pull` et un shell relancé
- [ ] Mesurer `yarn mockup check` sur le poste en RDP (5 s en local): au-delà de 15 s, cloner le dépôt sur un disque local plutôt que `G:\`
- [ ] Vérifier sur le dépôt en `G:\` qu'une version créée s'affiche sans relancer le shell
- [ ] Vérifier que l'agent lit et clique dans le mockup à travers le cadre du shell. Si oui, retirer la barre du bas de `frame.html`; sinon, lui redonner `frame.html` pour les interactions
- [ ] Essayer le « click and comment » du navigateur de Cursor: l'agent retrouve-t-il la bonne ligne de `index.vue`?

## 2. Ressembler à la prod

Référence: les captures de `blueprint/brand/screens/`.

- [ ] Confirmer la police (Poppins, lue sur les captures) dans le CSS du mono, et l'embarquer plutôt que de la charger de Google Fonts
- [ ] `ez-table`: rangée de filtres, pagination, menu ⋮ par ligne
- [ ] Navigation de fiche: groupes repliables avec icône
- [ ] Bandeau d'état (« COMPLÉTÉ »), bouton à menu, étapes reliées par une ligne (« Cycle de vie »)
- [ ] `ez-card`: l'en-tête passe à la ligne quand `#actions` a plusieurs boutons
- [ ] Captures manquantes: formulaire, dialogue, état vide, erreur; puis recaler le patron formulaire
- [ ] Un patron d'éditeur plein écran à trois panneaux
- [ ] Mode sombre: l'app en a-t-elle un? Sinon, l'écrire dans `brand.md` comme outil d'exploration
- [ ] Finir les TODO de `brand.md` (tutoiement ou vouvoiement)

## 3. Fermer la boucle avec l'équipe

- [ ] Une vraie tâche GoodDay, de la demande à la version retenue, par un dev qui n'a pas construit l'outil
- [ ] Une première vraie promotion (`yarn mockup promote`) d'un composant créé ou rehaussé
- [ ] Faire valider par le team lead: c'est le dev qui marque les versions; l'agent peut inventer avec les tokens
- [ ] Décider où vivent les mockups: ce dépôt sur `main`, ou une branche par tâche
- [x] Sortir les mockups d'essai (90001, 90002, démo) de `main`

## 4. Ménage de l'outil

- [ ] Raccourcir `AGENTS.md` (200 lignes lues à chaque session)
- [ ] Retirer `mockup tokens migrate` et `token-renames.mjs`: la migration est faite
- [ ] Une dizaine de fichiers d'exemple, bons et mauvais, pour tester `mockup check`

## Plus tard, si le besoin se confirme

- Premier report dans le mono: `ez-tokens.css`, puis un composant simple; décider de la collision de noms avec ses `ez-` existants
- `yarn mockup copy <Composant>`: les fichiers à prendre et leurs dépendances
- Boutons « Nouvelle version » et « Variante » dans le shell
- `mockup new` qui lit la tâche dans l'API GoodDay
- Shell déployé en statique pour partager un lien
- Vignette de chaque version dans le shell
