# Copier les tokens dans le mono

ez-proto est **la source** des tokens. Le mono en garde une copie, faite à la main, qu'on ne modifie jamais là-bas.

## Ce qui se copie

| Fichier | Copié? | Pourquoi |
|---|---|---|
| `blueprint/tokens/ez-tokens.css` | **Oui, tel quel** | Primitives + sémantiques: le contrat partagé. Autonome, sans import. |
| `blueprint/tokens/components.css` | Non | Réglages des composants `ez-` d'ez-proto; la prod a les siens. |
| `tool/palette-reset.css` | Non | Désactive la palette Tailwind dans ez-proto seulement. |

## Procédure

1. Vérifier la version et ce qui a changé: `yarn proto tokens` (version, dernière entrée du CHANGELOG).
2. Copier `blueprint/tokens/ez-tokens.css` dans le mono, à côté de `tailwind.css` de `ezmax-library-quasar` (ex. `librairies/ezmax-library-quasar/src/css/ez-tokens.css`).
3. Dans `tailwind.css` du mono, l'importer juste après Tailwind, et retirer ce qu'il remplace (breakpoints et rayons du `@theme`):
   ```css
   @import "tailwindcss";
   @import "./ez-tokens.css";
   ```
   Le thème sombre suit la classe `body--dark` que le plugin Dark de Quasar met sur `<body>`: rien d'autre à brancher.
4. Si la version change de numéro **majeur**, des noms ont changé: chercher les anciens noms dans le mono (liste dans le CHANGELOG) et les remplacer dans la même PR.
5. Dans le message de commit ou la PR du mono, noter la version copiée (`ez-tokens 1.2.0`).
6. Ajouter une ligne au tableau ci-dessous.

## Copies faites

| Date | Version | Par | PR / commit du mono |
|---|---|---|---|
| — | — | — | Jamais copié |

## Changer un token

1. Modifier `ez-tokens.css` (jamais dans un prototype, jamais dans la copie du mono).
2. `yarn proto tokens bump <patch|minor|major> -m "Ce qui change"`: met à jour l'en-tête et le CHANGELOG.
   - **patch**: une valeur change (une couleur, un rayon).
   - **minor**: un token s'ajoute.
   - **major**: un token est renommé ou retiré. Ajouter aussi l'ancien nom dans `tool/cli/token-renames.mjs`, puis `yarn proto tokens migrate` pour réécrire les composants, les patrons et les prototypes.
3. `yarn proto check` doit passer.
4. Copier dans le mono (ci-dessus).
