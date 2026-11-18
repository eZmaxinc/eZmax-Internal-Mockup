---
name: autocommit
description: >-
  Regroupe automatiquement les modifications en cours dans le workspace en commits Git
  atomiques conformes à Conventional Commits v1.0.0. À utiliser lorsque l'utilisateur
  invoque la commande /autocommit ou demande des commits atomiques sur ses changements.
---

# Autocommit (Commits Atomiques)

Workflow déclenché par `/autocommit` pour analyser les changements non commités, vérifier l'intégrité du projet et créer une série de commits atomiques conformes à [conventional-commits](../conventional-commits/SKILL.md).

## Règles d'atomicité

- **Un commit = une intention logique unique** (une fonctionnalité, un correctif, un ajout de tests ou de configuration).
- Ne jamais mélanger des changements indépendants (ex. correctif CSS non lié + nouvelle fonctionnalité + configuration) dans un même commit.
- Si un même fichier contient des modifications relevant de plusieurs sujets distincts, découper par hunks avant de commiter.
- Ne jamais commiter d'archives temporaires (ex. `*.zip`), fichiers secrets (`.env*`) ou artefacts locaux non désirés.

## Workflow d'exécution

1. **Inspecter l'état du dépôt** :
   - Exécuter `git status --short` et `git diff --stat`.
   - Consulter `git log -n 10 --oneline` pour s'aligner sur les scopes et conventions existants.
2. **Analyser et grouper les changements** :
   - Lire le diff complet (`git diff`) et les nouveaux fichiers non suivis.
   - Identifier les fichiers à exclure explicitement (archives `.zip`, fichiers temporaires).
   - Établir un plan de découpage en commits atomiques ordonnés logiquement (ex. correctifs préalables, puis fonctionnalités, puis documentation/outillage).
3. **Vérifier les tests du projet (si applicable)** :
   - Si des fichiers de code, configuration ou dépendances sont modifiés, exécuter `yarn test` et confirmer le succès avant de finaliser les commits.
4. **Rédiger chaque message selon Conventional Commits v1.0.0** :
   - Appliquer les règles de [conventional-commits](../conventional-commits/SKILL.md) et sa [spécification](../conventional-commits/references/spec-v1.0.0.md).
   - Vérifier que chaque en-tête respecte `<type>(<scope>): <description>` (anglais impératif, pas de point final).
5. **Créer les commits séquentiellement** :
   - Pour chaque groupe atomique :
     - Stager uniquement les fichiers (ou hunks) concernés (`git add <fichiers>` ou `git apply --cached --recount`).
     - Contrôler le périmètre stagé avec `git diff --cached --stat`.
     - Créer le commit avec `git commit -m "<message>"`.
6. **Vérification finale** :
   - Exécuter `git log -n <N> --oneline` et `git status --short` pour confirmer que tous les commits prévus sont créés et qu'il ne reste aucun fichier attendu non commité.
   - Résumer les commits créés (hash, message et fichiers inclus) à l'utilisateur.
