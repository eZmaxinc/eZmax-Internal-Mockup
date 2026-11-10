---
based_on: v002
date: 2026-11-10
---
Variante: bandeau résumé des dossiers à risque avec prolongation en haut de liste.

## Changements
- Suppression des colonnes de sélection et d'actions dans le tableau principal, qui conserve exactement la structure épurée de `list-page` (5 colonnes)
- Le bandeau en haut de liste (`ez-message-important`) résume directement les dossiers à risque (nom, signataires en attente, badge de jours restants selon l'urgence) avec l'action de prolonger un dossier précis ou tous les dossiers à risque d'un coup
- Question à trancher par rapport à `v002`: préfère-t-on garder le tableau principal intact et regrouper toute la gestion des échéances imminentes dans le bandeau supérieur (`v002b`), ou agir ligne par ligne directement dans le tableau (`v002`)?

## Propositions
- `EzBadgeFolderDue` (domain · folder): badge d'échéance d'un dossier affichant le nombre de jours restants et la couleur d'urgence (`danger` ≤ 3 j, `warning` ≤ 7 j, `neutral` > 7 j), accompagné de la date.
- `EzBtnExtendFolder` (domain · folder): bouton d'action pour prolonger l'échéance d'un dossier qui encapsule la règle d'éligibilité (ni complété ni refusé), le libellé et l'icône.

## Signalements
- Mock manquant: `EzsignFolder.canBeExtended()` pour centraliser la règle métier d'éligibilité à la prolongation (dossier ni complété ni refusé).

## Questions ouvertes
- Doit-on pouvoir prolonger un dossier qui n'est pas encore « à risque » (p. ex. échéance dans 18 jours) ou déjà « Expiré », auquel cas une action hors du bandeau reste-t-elle nécessaire?
- Au-delà de combien de dossiers à risque le bandeau doit-il tronquer la liste (p. ex. afficher les 3 plus urgents + « Voir les N dossiers »)?
