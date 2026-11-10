---
based_on: list-page
date: 2026-11-10
---
Liste des dossiers mettant en évidence les échéances à moins de 7 jours avec prolongation de 7, 14 ou 30 jours.

## Changements
- Bannière d'avertissement en haut de liste quand des dossiers expirent dans les 7 prochains jours, avec action rapide pour les filtrer
- Filtre d'échéance (« Toutes les échéances » / « Expire sous 7 jours ») et mise en évidence de la date + délai relatif dans la colonne « Échéance »
- Action « Prolonger » par ligne (masquée sur les dossiers complétés ou refusés) ouvrant un dialogue de prolongation (7, 14 ou 30 jours) avec aperçu de la nouvelle date d'échéance

## Propositions
- `EzBtnExtendFolder` (domain · folder): bouton d'action pour prolonger l'échéance d'un dossier qui encapsule la règle d'éligibilité (ni complété ni refusé), le libellé et l'icône.

## Signalements
- Mock manquant: `EzsignFolder.canBeExtended()` pour centraliser la règle métier d'éligibilité à la prolongation (dossier ni complété ni refusé).

## Questions ouvertes
- Un dossier déjà « Expiré » ou encore en « Brouillon » peut-il être prolongé, ou la prolongation est-elle réservée aux dossiers « En signature » (`sent`)?
- Lors d'une prolongation, les signataires en attente reçoivent-ils automatiquement un courriel les informant de la nouvelle échéance?
- La prolongation de 7, 14 ou 30 jours s'ajoute-t-elle à la date d'échéance actuelle du dossier ou à la date du jour?
