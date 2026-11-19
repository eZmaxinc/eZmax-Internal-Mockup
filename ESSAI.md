# Essayer l'outil

Un essai fixe, à refaire tel quel après un changement de règles, pour voir si l'outil tient sa promesse: **on demande, on voit, on ajuste, vite**. La mesure principale est le temps entre une demande et le changement à l'écran.

Pour une vraie tâche, c'est la même démarche: remplacer les demandes ci-dessous par celles de la tâche.

## Préparer

```bash
git switch main && git pull
```

```bash
git status --short
```

`git status --short` doit être vide. Lancer un seul shell (`yarn dev`), l'ouvrir dans le navigateur de Cursor, puis ouvrir une conversation d'agent neuve avec `ez-mockup` comme dossier racine. Noter le commit (`git rev-parse --short HEAD`) et le modèle.

Coller chaque demande telle quelle, sans aider l'agent, et chronométrer jusqu'au moment où le résultat est à l'écran.

## Les quatre demandes

**1. Création**, d'une interface qu'aucun patron ne couvre:

> Nouveau mockup pour la tâche #90003 (https://www.goodday.work/t/TEST03): « Suivi d'un envoi groupé ». On veut voir, pour un envoi groupé, où en est chaque dossier: une vue d'ensemble de l'avancement, puis la liste des dossiers avec leur statut. Contrainte: un dossier refusé doit ressortir.

**2. Retouche**, sans demander de version:

> Ajoute un bouton pour relancer les dossiers en attente.

**3. Nouvelle version:**

> Fais une nouvelle version: regroupe les dossiers par statut.

**4. Conclure:**

> On retient la v002. Exporte-la.

## Ce qu'on vérifie

| # | Point | Cible |
|---|---|---|
| 1 | Temps de la création | moins de 5 min |
| 2 | Temps de la retouche | moins de 2 min |
| 3 | Temps de la nouvelle version | moins de 4 min |
| 4 | La retouche s'est faite en place: pas de `v003`, pas de navigateur | oui |
| 5 | `v001` n'a pas bougé après la nouvelle version (`git status`) | oui |
| 6 | `yarn mockup check 90003` passe, lancé par l'agent | oui |
| 7 | Ce qui existe est réutilisé: `ez-btn`, `ez-table`, `ez-badge` (statut par `stateTone()`); rien de refait à la main | oui |
| 8 | Ce qui est inventé reste dans le genre eZsign, en clair et en sombre (à juger à l'œil, à côté des captures de `blueprint/brand/screens/`) | note sur 5 |
| 9 | `blueprint/` et `tool/` n'ont pas changé (`git status`) | oui |
| 10 | Interventions: chaque fois qu'il a fallu répondre ou débloquer l'agent | 1 au plus |

Ensuite, regarder ce que l'essai a produit:

```bash
yarn mockup proposals
```

## Journal

| Date | Commit | Modèle | Création | Retouche | Version | Genre /5 | Interventions | Problème principal |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

Un problème se corrige à un endroit précis: voir « Où modifier quoi » dans le [`README.md`](README.md). Avant de rejouer l'essai, supprimer `mockups/90003-*`.
