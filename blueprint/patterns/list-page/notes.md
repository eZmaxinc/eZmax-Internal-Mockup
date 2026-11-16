Référence: page de liste (dossiers).

## Patron
- `ez-page-header` avec `button` (action principale de la page) et `refresh`.
- Filtres au-dessus du tableau: recherche qui prend la place disponible, puis selects.
- Tableau dans `ez-card flush`, statut en `ez-badge` avec `row.stateTone()` et `row.stateLabel()`.
- Nombres et dates alignés à droite.
- État vide avec l'action pour en sortir; état de chargement via `loading`.

## Scénarios
- `full`, `empty`, `loading`

TODO: recaler sur la vraie page de liste en prod.
