---
name: conventional-commits
description: >-
  Applique et valide la spécification Conventional Commits v1.0.0 lors de la rédaction,
  la vérification ou la création de messages de commit Git. À utiliser dès que l'utilisateur
  demande de commiter, formater un message de commit ou vérifier la conformité Conventional Commits.
---

# Conventional Commits (v1.0.0)

Ce skill garantit que tous les messages de commit du dépôt respectent strictement la spécification [Conventional Commits v1.0.0](references/spec-v1.0.0.md).

## Format obligatoire

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- **Types autorisés** : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scope** (optionnel) : en minuscules entre parenthèses, ciblant le module ou domaine (ex. `changelog`, `sdk`, `upload`, `logo`, `specs`, `agents`).
- **Description** : en anglais, à l'impératif présent, sans majuscule initiale inutile et **sans point final** (≤ 72 caractères recommandé pour l'en-tête).
- **Breaking changes** : ajouter `!` avant `:` et/ou un footer `BREAKING CHANGE: <raison>` en majuscules.
- **Consulter la référence complète** : [spec-v1.0.0.md](references/spec-v1.0.0.md) en cas de doute sur les footers ou la sémantique SemVer.

## Workflow de validation

1. **Vérifier l'en-tête** :
   - Confirmer la correspondance avec le motif :
     `^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._-]+\))?(!)?: [^\s].*[^.]$`
2. **Vérifier la séparation corps / pied de page** :
   - S'assurer qu'une ligne vide sépare l'en-tête du corps, et le corps des footers.
   - Vérifier que `BREAKING CHANGE:` est strictement en majuscules s'il est présent.
3. **Vérifier l'alignement sémantique** :
   - Confirmer que `feat` correspond à une nouvelle capacité utilisateur, `fix` à une correction, et que le diff reflète fidèlement le message.
4. **Contrôle déterministe après commit** :
   - Exécuter `git log -n 5 --oneline` pour confirmer le format exact dans l'historique.
