---
based_on: v001
date: 2026-11-10
---
Badge d'urgence d'échéance (jours restants) et prolongation groupée.

## Changements
- Colonne « Échéance »: affiche le nombre exact de jours restants dans un badge coloré selon l'urgence (`danger` à 3 jours ou moins / expiré, `warning` entre 4 et 7 jours, `neutral` au-delà) au-dessus de la date d'échéance
- Filtre d'échéance enrichi avec l'option « Urgent (3 jours ou moins) »
- Prolongation de plusieurs dossiers d'un coup: bouton direct « Prolonger les N dossiers » dans la bannière d'alerte + sélection de lignes dans le tableau avec action groupée « Prolonger la sélection (N) » dans l'en-tête de la carte
- Dialogue de prolongation adapté au mode groupé: récapitulatif des dossiers sélectionnés avec aperçu `ancienne date → nouvelle date` pour chacun

## Propositions
- `EzBadgeFolderDue` (domain · folder): badge d'échéance d'un dossier affichant le nombre de jours restants et la couleur d'urgence (`danger` ≤ 3 j, `warning` ≤ 7 j, `neutral` > 7 j), accompagné de la date.
- `EzBtnExtendFolder` (domain · folder): bouton d'action pour prolonger l'échéance d'un dossier qui encapsule la règle d'éligibilité (ni complété ni refusé), le libellé et l'icône.

## Signalements
- Bug primitive: `EzCard.vue` déborde sous 600 px quand `#actions` contient plusieurs boutons (suggestion: ajouter `flex-wrap: wrap` sur `.ez-card__header` et `.ez-card__actions`), contourné ici en plaçant la barre d'actions de sélection au-dessus de `<ez-card flush>`.
- Composant manquant: sélection de lignes native dans `ez-table` (ou primitive `ez-checkbox`), contournée ici avec une colonne de sélection dédiée utilisant `ez-btn` icône.
- Mock manquant: `EzsignFolder.canBeExtended()` pour centraliser la règle métier d'éligibilité à la prolongation (dossier ni complété ni refusé).

## Questions ouvertes
- Le seuil « urgent » inclut-il le 3e jour (`<= 3 jours`) ou uniquement moins de 3 jours (`<= 2 jours`)?
- Lors d'une prolongation groupée, applique-t-on toujours la même durée (7, 14 ou 30 jours) à chaque dossier à partir de son échéance actuelle?
