Référence: fiche détail longue (dossier) avec TOC.

## Patron
- `ez-page-header` `cancelable` (retour) + statut dans `#meta` + actions secondaires dans `#actions`.
- `ez-page-sections` dans `ez-page-content`: TOC sticky **à droite**, avec les cartes (`toc-id`) en sous-entrées.
- Message important au-dessus des sections quand il concerne toute la page.
- Une section = un `ez-page-section` qui contient une ou plusieurs `ez-card`.

## Scénarios
- `in-progress` (échéance proche), `completed`

TODO: recaler sur la vraie fiche dossier en prod.
