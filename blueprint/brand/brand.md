# Brand eZsign — mood board

> Ce fichier est lu par l'agent avant chaque mockup. Garder court, concret, vérifiable.
> **À compléter par l'équipe**: les sections marquées `TODO` doivent refléter la prod.

## En une phrase

Un outil de travail sérieux et dense, pour des gens qui traitent des dossiers à la chaîne: clair avant d'être joli.

## Principes

1. **La tâche d'abord**: chaque écran répond à « qu'est-ce que je dois faire ici? ». L'action principale est unique et évidente (un seul bouton primaire par zone).
2. **Dense mais respirable**: texte de base à 14px, beaucoup d'info par écran, mais des groupes clairement séparés (cartes, sections).
3. **Le statut se lit d'un coup d'œil**: badges de statut cohérents partout (même couleur = même sens).
4. **Sobre**: cartes blanches à coins peu arrondis sur fond gris, pas de dégradés, pas d'illustrations décoratives. Deux couleurs d'action: le vert pour l'action principale d'une page (créer, sauvegarder), l'ardoise bleutée pour les autres boutons pleins (rechercher, modifier).
5. **Prévisible**: mêmes structures de page partout (en-tête de page, contenu, colonne de droite). L'utilisateur ne réapprend rien d'un écran à l'autre.

## Structure type d'une page

- `ez-page` > `ez-page-header` (titre, fil d'Ariane, actualiser, action principale en pilule) + `ez-page-content`. L'en-tête est posé sur le fond gris, et le contenu prend toute la largeur.
- Contenu en grille: colonne principale 8/12 + colonne de droite 4/12 (résumé, métadonnées). Sous `md`, la colonne de droite passe **en premier**.
- Les fiches longues utilisent `ez-page-sections`: des sections avec une icône, une **TOC collante à droite** qui déplie les sous-sections (les cartes) de la section active, et sous md une barre « Section - sous-section » qui ouvre la TOC.

## Ton des textes

- Français québécois professionnel, vouvoiement. TODO: confirmer tutoiement/vouvoiement dans l'app.
- Libellés de boutons: verbe à l'infinitif (« Envoyer le rappel », pas « Envoi »).
- Messages d'état courts et utiles: dire ce qui se passe et quoi faire.
- Pas d'espace avant le deux-points dans les libellés (« Statut: Complété »).

## Couleurs (sens, pas valeurs)

| Sens | Token | Usage |
|---|---|---|
| Action | `accent` | boutons pleins d'une zone, liens, sélection |
| Action principale | `positive` | le bouton en pilule de l'en-tête de page |
| Succès | `positive` | complété, signé |
| Avertissement | `warning` | en attente, expire bientôt |
| Danger | `negative` | refusé, expiré, suppression |
| Info | `info` | messages neutres importants |

Les valeurs vivent dans `blueprint/tokens/ez-tokens.css`, la source partagée avec le mono. Elles partent des couleurs de la marque (charbon, marine, accent, et les quatre couleurs de statut); un aplat teinté est `surface-{sens}`, le texte posé dessus `foreground-{sens}`.

## Icônes

- Celles de l'app: Material Symbols Outlined, du package `@quasar/extras` (MDI pour les quelques-unes où l'app prend MDI). Un trait plein, sobre, à 18 px par défaut.
- Une icône a le sens qu'elle a dans l'app: le glyphe de `ez.icons.<clé>` est celui que la prod donne au même usage (`blueprint/ez/icons.ts`).
- Jamais une icône dessinée à la main ni un autre jeu (Lucide, Heroicons…).
- Pas d'icône devant un titre de groupe (« À traiter », « Dates et statut »): le texte seul. Une icône sert une action, un statut, une entrée de navigation (les sections de la TOC).

## Mouvement

Des micro-animations, toujours, jamais un film d'action: le mouvement aide à suivre ce qui change, il ne se donne pas en spectacle.

- Chaque changement d'état visible a la sienne: un menu qui s'ouvre, un survol, un chevron qui tourne, un panneau qui se déplie.
- Court: 80 à 150 ms, la sortie plus rapide que l'entrée; `ease-out` en entrant.
- Petit: un fondu, un glissement de 4 px depuis ce qui l'ouvre, un chevron qui tourne de 180°. Seulement l'opacité, le déplacement et les couleurs.
- Jamais de rebond, de zoom depuis zéro, ni de séquence en cascade.
- Toujours `@media (prefers-reduced-motion: reduce)`, qui coupe l'animation.
- Référence: le menu de `ez-btn-dropdown` (mockup `bouton-menu-deroulant`).

## Do / don't

- ✅ Un bouton primaire par zone; les autres en `secondary` ou `flat`.
- ✅ Les états vides ont un titre, une phrase et, si possible, l'action pour en sortir.
- ✅ Les tableaux: colonnes alignées à gauche, nombres et dates à droite, statut en badge plein (`solid`).
- ✅ Une fiche: les informations en tuiles (`ez-info`), la navigation à droite.
- ❌ Pas de couleur inventée, pas d'ombre forte, pas de coins très arrondis.
- ❌ Pas d'icône seule sans libellé ou infobulle pour une action importante.
- ❌ Pas de modale pour ce qui peut être fait sur la page.

## Écrans de référence

Voir `blueprint/brand/screens/README.md`: quatre captures de prod annotées (liste, fiche longue, fiche de dossier, éditeur plein écran). Ce sont elles la référence. À ajouter: formulaire, dialogue, état vide, erreur.
