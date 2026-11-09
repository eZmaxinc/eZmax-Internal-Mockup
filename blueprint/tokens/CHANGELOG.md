# ez-tokens — changements

Le plus récent en haut. `pnpm proto tokens bump` ajoute les entrées. Copie vers le mono: `COPY.md`.

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
