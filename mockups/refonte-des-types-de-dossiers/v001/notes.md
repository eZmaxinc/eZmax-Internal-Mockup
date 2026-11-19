---
based_on: —
date: 2026-11-19
---
Fiche d'un type de dossiers telle qu'intégrée en prod, reproduite comme point de départ de la refonte.

## Signalements
- Bug primitive: ez-page-header n'a pas de bouton divisé (le menu ▾ à droite de « Modifier le type de dossiers » en prod); seul le bouton est reproduit.
- Mock manquant: EzsignFoldertype (réglages, cycle de vie, notifications, PDF/A), décrit localement dans mocks.ts.
- Bug outil: mockup check ne lit pas les props déclarées dans un autre fichier (`defineProps<EzLayoutProps>()`, le `layout-props.ts` de prod): ez-layout les déclare dans chaque composant.
- Promus dans le blueprint depuis cette version: ez-info (variante `flat` de prod, ses éléments et ses tons), ez-layout et ez-layout-composition (ceux de prod), ez-tooltip (de la tâche du cycle de vie). Elle utilise maintenant ceux de `@ez`.
- Repris de la tâche du cycle de vie (v010, retenue): LifecycleTimeline, copié tel quel.

## Questions ouvertes
- Envoi du document signé: le contenu des volets repliés n'est pas visible sur la capture; les réglages affichés sont supposés.
