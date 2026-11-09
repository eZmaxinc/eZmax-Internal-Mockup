# Brand eZsign — mood board

> Ce fichier est lu par l'agent avant chaque prototype. Garder court, concret, vérifiable.
> **À compléter par l'équipe**: les sections marquées `TODO` doivent refléter la prod.

## En une phrase

Un outil de travail sérieux et dense, pour des gens qui traitent des dossiers à la chaîne: clair avant d'être joli.

## Principes

1. **La tâche d'abord**: chaque écran répond à « qu'est-ce que je dois faire ici? ». L'action principale est unique et évidente (un seul bouton primaire par zone).
2. **Dense mais respirable**: texte de base à 14px, beaucoup d'info par écran, mais des groupes clairement séparés (cartes, sections).
3. **Le statut se lit d'un coup d'œil**: badges de statut cohérents partout (même couleur = même sens).
4. **Sobre**: surfaces blanches sur fond gris très pâle, une seule couleur d'accent (le bleu d'action), pas de dégradés, pas d'illustrations décoratives.
5. **Prévisible**: mêmes structures de page partout (en-tête de page, contenu, colonne de droite). L'utilisateur ne réapprend rien d'un écran à l'autre.

## Structure type d'une page

- `ez-page` > `ez-page-header` (titre, retour, actualiser, actions) + `ez-page-content`.
- Contenu en grille: colonne principale 8/12 + colonne de droite 4/12 (résumé, métadonnées). Sous `md`, la colonne de droite passe **en premier**.
- Les fiches longues utilisent `ez-page-sections` avec une **TOC sticky à droite** qui liste aussi les sous-sections (les cartes).

## Ton des textes

- Français québécois professionnel, vouvoiement. TODO: confirmer tutoiement/vouvoiement dans l'app.
- Libellés de boutons: verbe à l'infinitif (« Envoyer le rappel », pas « Envoi »).
- Messages d'état courts et utiles: dire ce qui se passe et quoi faire.
- Pas d'espace avant le deux-points dans les libellés (« Statut: Complété »).

## Couleurs (sens, pas valeurs)

| Sens | Token | Usage |
|---|---|---|
| Action | `action` | boutons primaires, liens, sélection |
| Succès | `positive` | complété, signé |
| Avertissement | `warning` | en attente, expire bientôt |
| Danger | `negative` | refusé, expiré, suppression |
| Info | `info` | messages neutres importants |

Les valeurs vivent dans `blueprint/tokens/ez-tokens.css`, la source partagée avec le mono. TODO: reprendre les vraies couleurs de la prod (voir `SYNC.md`).

## Do / don't

- ✅ Un bouton primaire par zone; les autres en `secondary` ou `flat`.
- ✅ Les états vides ont un titre, une phrase et, si possible, l'action pour en sortir.
- ✅ Les tableaux: colonnes alignées à gauche, nombres et dates à droite, statut en badge.
- ❌ Pas de couleur inventée, pas d'ombre forte, pas de coins très arrondis.
- ❌ Pas d'icône seule sans libellé ou infobulle pour une action importante.
- ❌ Pas de modale pour ce qui peut être fait sur la page.

## Écrans de référence

Voir `blueprint/brand/screens/`. TODO: ajouter 5 à 10 captures de prod (liste, fiche détail, formulaire, dialog, état vide, erreur) avec une ligne d'annotation chacune.
