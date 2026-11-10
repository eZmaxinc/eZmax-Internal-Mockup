# Prolonger les dossiers qui expirent bientôt

## Contexte
Les propriétaires découvrent trop tard que leurs dossiers arrivent à échéance, et les signataires ne peuvent alors plus signer. On veut permettre, directement depuis la liste des dossiers, de repérer ceux qui expirent dans les 7 prochains jours et de prolonger leur échéance.

## Ce qu'on veut voir
- Repérer d'un coup d'œil dans la liste des dossiers ceux qui expirent dans les 7 prochains jours (alerte en haut de liste, filtre dédié et mise en évidence de l'échéance)
- Prolonger l'échéance d'un dossier depuis la liste avec choix de la durée (7, 14 ou 30 jours) et aperçu de la nouvelle date d'échéance
- Confirmer visuellement la prolongation et mettre à jour l'échéance dans la liste

## Contraintes
- On ne prolonge pas un dossier complété (`completed`) ou refusé (`refused`)
- Une prolongation est obligatoirement de 7, 14 ou 30 jours

## Hors portée
- Choix d'une date d'échéance libre au calendrier
- Prolongation automatique ou rappels automatiques avant échéance
- Prolongation depuis la fiche détail du dossier

## Liens
- GoodDay: [#90001](https://www.goodday.work/t/TEST01)
- Écran de prod le plus proche: liste des dossiers (`list-page`)
