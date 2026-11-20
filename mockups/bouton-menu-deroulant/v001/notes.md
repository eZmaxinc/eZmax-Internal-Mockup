---
based_on: —
date: 2026-11-20
---
Mockup test de ez-btn-dropdown et ez-menu-action-item, ceux de la prod: l'en-tête d'un dossier (accès, « Actions du dossier ») et toutes les variantes du déclencheur.

## Signalements
- Dépend du rehaussement de ez-btn (`outline`) de variantes-du-bouton v001, recopié ici dans `components/EzBtn.vue`. Promouvoir EzBtn d'abord, puis retirer l'import `./EzBtn.vue` de EzBtnDropdown avant de le promouvoir: `promote` refuse un composant qui importe un fichier de sa version.
- Icône manquante: `key` (accès), `archive`, `copy` absentes de `ez.icons`; remplacées par `eye`, `inbox`, `file`.
- Bug primitive: ez-page-header ne génère pas le bouton « Actions du dossier » à partir d'une liste d'actions (prod: props `actions` et `default-button-title`); composé ici à la main dans `#actions`.

## Questions ouvertes
- `pill` (blueprint) ou `rounded` (prod): quel nom garder pour le port?
- En prod, `ez-menu-action-item` vit-il dans le même dossier que `ez-btn-dropdown` ou dans un dossier `menu/` à part?
