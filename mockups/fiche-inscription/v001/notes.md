---
based_on: —
date: 2026-11-18
---
Fiche d'inscription en page continue: quatre cartes pour l'inscription, six par vente, et la TOC de la fiche (ez-page-sections) à droite, de l'inscription à chaque vente.

## Signalements
- Composant métier manquant: les sections de la fiche d'inscription et d'une vente (`InscriptionSections`, `SaleSections`).
- Sans équivalent dans le blueprint, donc locaux: le panneau de tableau dans une carte (`DataPanel`, `SubPanel`: titre, compte, « Ajouter », résumé), les rangées « Ajouter » (`EmptySlots`) et la frise de l'échéancier (`SaleTimeline`).
- Mock manquant: les objets eZmax (inscription, vente, rétribution); leurs données sont locales à la version, les montants en texte.
- Bug primitive: ez-info n'a pas de compte en alerte; « Documents requis 20 » d'une vente n'est plus en rouge.
- Icônes manquantes dans `ez.icons`: lieu, pourcentage, bouclier, banque, étiquette de vente; remplacées par les plus proches.

## Questions ouvertes
- Toutes les ventes sont maintenant l'une sous l'autre (une section chacune) au lieu d'une seule à la fois: la page reste-t-elle lisible avec beaucoup de ventes?
- Les rangées « Ajouter » des listes vides: une ligne chacune comme ici, ou regroupées dans un seul menu?
