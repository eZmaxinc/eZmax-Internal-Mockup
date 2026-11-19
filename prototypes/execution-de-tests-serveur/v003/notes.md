---
based_on: v002
date: 2026-11-19
---
Sélection multiple des modules par catégorie (repliées par défaut) et portée des tests simplifiée.

## Prérequis pour construire l'interface
- Un JSON pour les modules (fourni par l'équipe QA)
- Une route `autocomplete` pour obtenir les branches du serveur frontend
- Une route `getList` pour obtenir les tests exécutés, incluant un lien pour télécharger le rapport et un lien pour télécharger le log
- Une route pour connaître l'état du serveur (si possible)
- Une route pour lancer un test (`branch`, `moduleIds[]`, `suiteType`: `all` | `api` | `e2e`)
- Une route pour annuler une exécution en cours (`running`)
- *(Optionnel)* Du polling sur `getList` / `getObject` (ou WebSocket/SSE) pour suivre la progression (`progressPercent`, `currentStep`, `state`, `logLines`) des tests en cours
- Le détail du rapport (via `getObject` ou inclus dans `getList`) : suites (`passed`, `failed`, `skipped`, `durationSeconds`), échecs (`testName`, `file`, `message`, `excerpt`) et lignes de journal (`logLines`)
