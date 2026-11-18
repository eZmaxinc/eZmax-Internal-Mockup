---
based_on: —
date: 2026-11-18
---
Fiche d'inscription en page continue: quatre cartes pour l'inscription, six pour la vente choisie, et une navigation à droite qui passe d'une vente à l'autre.

## Signalements
- Composant métier manquant: les sections de la fiche d'inscription et d'une vente (`InscriptionSections`, `SaleSections`), et leur navigation par vente (`InscriptionNav`).
- Mock manquant: les objets eZmax (inscription, vente, rétribution); leurs données sont locales à la version, les montants en texte.
- Icônes manquantes dans `ez.icons`: lieu, pourcentage, bouclier, banque, étiquette de vente; remplacées par les plus proches.

## Questions ouvertes
- La navigation de droite remplace-t-elle `ez-page-toc`, ou la TOC doit-elle apprendre à porter des groupes (une inscription, ses ventes)?
- Les rangées « Ajouter » des listes vides: une ligne chacune comme ici, ou regroupées dans un seul menu?
