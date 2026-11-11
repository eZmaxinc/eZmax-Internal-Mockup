# ez-tokens — changements

Le plus récent en haut. `pnpm proto tokens bump` ajoute les entrées. Copie vers le mono: `COPY.md`.

## 2.1.0 — 2026-11-11

- Police Poppins, lue sur les captures de prod (à confirmer dans le mono).

## 2.0.1 — 2026-11-10

- Fond de l'app: le gris de la prod (`#e2e5e8`, `$background-main`) au lieu du gris de marque (`#f1f3f4`).

## 2.0.0 — 2026-11-10

- Réécriture: un seul sens par modifieur, échelles d'espace et de taille, couleurs ancrées sur la marque.
- Un seul sens par modifieur. L'emphase: `-strong`, `-muted`, `-subtle`. La variante: `-inverse`, `-accent`, `-positive`, `-negative`, `-warning`, `-info`, toujours en paire: `surface-{variante}` est l'aplat teinté, `foreground-{variante}` le texte posé dessus.
- Nouvelles échelles: `--space-gap-{sm,md,lg}` (entre les éléments), `--space-inset-{sm,md,lg,xl}` (dans une surface), `--size-control-{sm,md}` (hauteur des boutons et des champs).
- Réglages de composant: lus avec une marche d'échelle en repli (`var(--card-padding, var(--space-inset-lg))`), jamais définis par le composant.
- Couleurs: les primitives partent des couleurs de la marque (charbon `#415364`, accent `#475574`, marine `#2d3648`, gris `#f1f3f4`, et les `positive`, `negative`, `warning`, `info` de la prod); les autres marches en sont dérivées. Le bleu provisoire disparaît. Thème sombre toujours provisoire.
- Nouveau: `foreground-accent` (le texte sur `surface-accent`).

Renommés (ancien → nouveau):

| Ancien | Nouveau |
|---|---|
| `accent-subtle` | `surface-accent` |
| `positive-subtle`, `negative-subtle`, `warning-subtle`, `info-subtle` | `surface-positive`, `surface-negative`, `surface-warning`, `surface-info` |
| `positive-strong`, `negative-strong`, `warning-strong`, `info-strong` | `foreground-positive`, `foreground-negative`, `foreground-warning`, `foreground-info` |
| `border-subtle` | `border-muted` |
| `focus` | `accent` |

Les primitives changent de noms (`--prim-gray-*` → `--prim-slate-*`, `--prim-blue-*` → `--prim-indigo-*` et `--prim-cyan-*`): sans effet, aucun composant ne les lit.

## 1.1.0 — 2026-11-09

- Thème sombre: les mêmes noms sémantiques redéfinis sous .body--dark (la classe du mode sombre de Quasar), avec leurs primitives. Valeurs provisoires.

## 1.0.0 — 2026-11-09

Première version partagée. Les couleurs sont encore provisoires (à reprendre de `quasar.variables.scss`).

- Noms `{rôle}-{modifieur}`, alignés sur le contrat de couleurs de SUM et sur les noms de statut de Quasar (`positive`, `negative`, `warning`, `info`).
- Breakpoints et rayons de la prod (`ezmax-library-quasar`): sm 600, md 1024, lg 1440, xl 1920; rayons 4, 6, 8, 12 px.
- Les tokens de composant sortent du fichier partagé (`components.css`, propre à ez-proto).
- Ombres et voile de dialogue passent par `color-mix()` sur une primitive: plus aucune valeur brute hors des primitives.

Renommés (ancien → nouveau):

| Ancien | Nouveau |
|---|---|
| `canvas` | `background` |
| `surface-sunken` | `surface-muted` |
| `surface-selected` | `accent-subtle` |
| `chrome` | `surface-inverse` |
| `fg`, `fg-muted`, `fg-subtle`, `fg-inverse` | `foreground`, `foreground-muted`, `foreground-subtle`, `foreground-inverse` |
| `fg-link` | `accent` |
| `line`, `line-subtle`, `line-strong` | `border`, `border-subtle`, `border-strong` |
| `action`, `action-subtle`, `action-on` | `accent`, `accent-subtle`, `accent-foreground` |
| `success`, `success-subtle`, `success-strong` | `positive`, `positive-subtle`, `positive-strong` |
| `danger`, `danger-subtle`, `danger-strong` | `negative`, `negative-subtle`, `negative-strong` |

Retirés (les états ne sont pas des tokens, `color-mix()` dans le composant): `surface-hover`, `action-hover`.

Les props des composants ne changent pas: `ez-badge tone="success"`, `ez-btn variant="danger"` gardent l'API de la prod.
