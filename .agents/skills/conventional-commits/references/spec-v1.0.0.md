# Spécification Conventional Commits v1.0.0

Référence complète issue de [conventionalcommits.org/en/v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/#specification).

## Structure d'un message de commit

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

## Règles normatives (v1.0.0)

1. Les commits **DOIVENT** être préfixés par un type (`noun` tel que `feat`, `fix`, etc.), suivi d'un `scope` optionnel, d'un `!` optionnel, et de `: ` (deux-points + espace obligatoire).
2. Le type `feat` **DOIT** être utilisé lorsqu'un commit ajoute une nouvelle fonctionnalité (correspond à `MINOR` en SemVer).
3. Le type `fix` **DOIT** être utilisé lorsqu'un commit corrige un bogue (correspond à `PATCH` en SemVer).
4. Un `scope` **PEUT** être fourni après le type : nom court décrivant une section du dépôt entre parenthèses, ex. `fix(parser):`.
5. Une `description` **DOIT** suivre immédiatement `: ` : résumé concis du changement, ex. `fix: array parsing issue when multiple spaces were contained in string`.
6. Un `body` plus long **PEUT** être ajouté après la description, séparé par **une ligne vide** après la description. Il est libre et peut contenir plusieurs paragraphes séparés par des lignes vides.
7. Un ou plusieurs `footer` **PEUVENT** être ajoutés **une ligne vide après** le `body`. Chaque footer consiste en un token suivi de `:<espace>` ou `<espace>#`, puis d'une valeur textuelle (ex. `Reviewed-by: Z`, `Refs: #133`). Les tokens utilisent `-` à la place des espaces (sauf `BREAKING CHANGE`).
8. Les changements cassants (**Breaking Changes**) **DOIVENT** être signalés dans le préfixe avec `!` avant `:`, et/ou via un footer `BREAKING CHANGE: <description>` (ou `BREAKING-CHANGE: <description>`). Correspond à `MAJOR` en SemVer.
9. Si `!` est utilisé dans l'en-tête, la section `BREAKING CHANGE:` en footer peut être omise ; la description de l'en-tête décrit alors la rupture.
10. Les types autres que `feat` et `fix` sont autorisés (recommandation Angular : `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, `test`).
11. Les unités de la spécification sont insensibles à la casse, **à l'exception de `BREAKING CHANGE` qui DOIT être en majuscules**.

## Types courants recommandés

| Type | Usage | Impact SemVer |
| :--- | :--- | :--- |
| `feat` | Nouvelle fonctionnalité | `MINOR` |
| `fix` | Correction de bogue | `PATCH` |
| `docs` | Documentation uniquement | — |
| `style` | Formatage / CSS sans changement logique | — |
| `refactor` | Refactorisation sans ajout ni correction | — |
| `perf` | Amélioration de performance | — |
| `test` | Ajout ou correction de tests | — |
| `build` | Système de build ou dépendances externes | — |
| `ci` | Configuration CI/CD | — |
| `chore` | Tâches de maintenance / outillage | — |
| `revert` | Annulation d'un commit précédent | — |

## Exemples valides

```text
feat(sdk): add dev-only spec-driven SDK guides
```

```text
fix(upload): fallback session ID when crypto.randomUUID is unavailable

Closes #42
```

```text
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: v1 endpoints are no longer exposed in the specification.
```
