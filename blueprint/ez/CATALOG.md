# Catalogue `ez-`

Composants enregistrés globalement: on les utilise directement dans les templates (`<ez-btn>`), sans import. Ce fichier dit **quand utiliser quoi**; l'API exacte (props, valeurs permises, slots, émissions) est dans la section générée à la fin, tirée du code par `yarn mockup catalog`. `mockup check` refuse un composant, une prop ou une valeur qui n'y est pas.

## Deux niveaux

| | Primitives (`blueprint/ez/components/<nom>/ez-<nom>.vue`) | Composants métier |
|---|---|---|
| Ex. | `ez-btn`, `ez-card`, `ez-badge`, `ez-table` | aucun pour l'instant |
| Connaît | rien du métier: props visuelles (`variant`, `tone`) | un objet métier (`folder`, `signer`…) |
| Naît | dans un prototype, puis promu ici (`yarn mockup promote`), puis reporté dans l'app | dans l'app (`ezmax-library-quasar`), puis reflété ici; jamais proposé ni promu par un prototype |
| Contient | le visuel: CSS et tokens | des primitives assemblées; pas de couleur, bordure, ombre ni arrondi |

**Ordre de préférence dans un prototype**: un composant métier existant → des primitives assemblées (avec les méthodes du mock: `folder.stateTone()`, `folder.stateLabel()`) → ce qui n'existe pas, le construire dans la version (voir « Manque quelque chose? » plus bas).

Les props `icon` prennent une clé de `ez.icons` (`:icon="ez.icons.send"` ou `icon="send"`). Liste: `add back calendar check chevronDown chevronRight clock close delete download edit error eye file filter folder home inbox info mail more refresh search send settings signature success user users warning`.

## Structure de page

### `ez-app-shell`
Cadre vide qui simule le shell de prod (barre du haut foncée + tiroir de gauche blanc, aux dimensions de la prod), pour placer le prototype à sa vraie position et largeur. Aucun contenu ni interaction. Ajouté automatiquement quand `meta.json` a `"chrome": "app"` (défaut); `"none"` pour un écran hors de l'app. Ne pas l'utiliser dans un prototype.

### `ez-page` > `ez-page-header` + `ez-page-content`
Toute page commence ainsi.

`ez-page-header`
- `title` (requis), `subtitle`
- `breadcrumbs`: le fil d'Ariane sous le titre, `['Accueil', 'Administration', 'Types de dossiers']`
- `button`: libellé de l'action principale de la page (pilule verte, en majuscules) → émet `button`
- `button-icon`, `button-variant`: `positive` (défaut: créer, sauvegarder) · `primary` (ardoise: modifier)
- `refresh` → affiche « Actualiser », émet `refresh`
- `cancelable` → affiche « Retour », émet `cancel`
- slots `#meta` (badges à côté du titre), `#actions` (actions secondaires)
- ⚠ à valider: noms exacts des émissions en prod

`ez-page-content`: conteneur avec la marge `--inset-page`, sur toute la largeur. Pas de props.

### `ez-layout` + `ez-layout-col`
Grille de 12 colonnes (breakpoints de la prod: sm ≥ 600px, md ≥ 1024px, lg ≥ 1440px).
- `ez-layout` `gap` (défaut `var(--card-gap, var(--space-gap-md))`)
- `ez-layout-col` `cols`: nombre ou `{ base, md, lg }`; `first-below-md`: la colonne passe en premier sous md

Patron prod: principale `:cols="{ base: 12, md: 8 }"`, droite `:cols="{ base: 12, md: 4 }" first-below-md`.

### `ez-page-sections` > `ez-page-section` (+ `ez-page-toc`)
Fiche longue avec TOC sticky à droite (≥ 1024px) et scroll-spy.
- `ez-page-sections` `toc` (défaut `true`), `toc-title`
- `ez-page-section` `id` (requis, unique), `title` (requis), `subtitle`
- Les `ez-card` avec `toc-id` deviennent des sous-entrées de la TOC
- Se place dans `ez-page-content`. Ne pas mettre la TOC à gauche.

## Contenu

### `ez-card`
- `title`, `subtitle`, `icon`, `flush` (sans padding, pour tableau), `toc-id`
- slots `default`, `#actions` (en-tête à droite), `#footer` (boutons alignés à droite), `#header` (remplace l'en-tête)

### `ez-btn`
- `label` ou slot, `icon`, `icon-right`
- `variant`: `positive` (vert: l'action principale d'une page) · `primary` (ardoise: l'action d'une zone, un seul par zone) · `secondary` (défaut) · `flat` (faible emphase, actions de carte) · `danger` (destructif, en contour rouge)
- `pill`: bouts arrondis et libellé en majuscules, pour les actions d'un en-tête de page
- `size`: `md` · `sm`; `loading`, `disabled`, `block`, `type`
- Bouton icône seule: `aria-label` obligatoire

### `ez-badge`
- `label` ou slot, `tone`: `neutral info success warning danger action`, `dot`, `solid` (plein, pour un tableau)
- Le statut d'un objet métier: `:tone="folder.stateTone()" :label="folder.stateLabel()"` (de même pour `signer`). Les méthodes du mock donnent le même badge partout.

### `ez-message-important`
- `type`: `info success warning danger`, `title`; slots `default`, `#actions`

### `ez-empty-state`
- `title` (requis), `text`, `icon`; slot `#actions`

### `ez-info-list`
Paires libellé / valeur (colonne de droite, résumés). **Propre à ez-proto** (pas d'équivalent connu en prod).
- `items`: `{ label, value?, key? }[]`, `inline`, `tiles` (chaque paire dans une tuile bordée: les informations d'une fiche); slot `#value-<key>`

### `ez-icon`
- `name`, `size` (défaut 18)

### `ez-reveal`
Réduit un contenu long sur téléphone (moins de 640 px): il garde le haut, fond le bas et le dévoile au toucher (« Voir plus », puis « Réduire »). Au-dessus de 640 px, le contenu s'affiche en entier. Pour un visuel secondaire qui prendrait tout l'écran sur mobile (une frise, un schéma), pas pour du contenu qu'on doit lire en premier. **Propre à ez-proto** (promu depuis la tâche du cycle de vie, v009).
- `collapsed-height` (défaut `10rem`), `fade-to`: `surface` (dans une carte) ou `muted` (sur un panneau `surface-muted`), `expand-label`, `collapse-label`; slot `default`

## Formulaires

### `ez-field`
- `v-model`, `label`, `type`: `text email tel number date password search textarea select`
- `options` (select): `{ label, value }[]`, `placeholder`, `hint`, `error`, `icon`, `rows`, `required`, `disabled`, `readonly`
- Formulaire en grille: `ez-layout` + `ez-layout-col :cols="{ base: 12, md: 6 }"`

## Données

### `ez-table`
- `columns`: `{ key, label, align?, width? }[]`, `rows`, `row-key` (défaut `id`), `clickable` → `row-click`, `selectable` + `v-model:selected` (cases à cocher, clés des lignes choisies), `loading`, `empty-title`
- slot `#cell-<key>="{ row, value }"` pour formater une cellule; `#empty`
- Dans une carte: `<ez-card flush>`, ou sous les filtres d'une carte titrée (patron `list-page`). Dates et nombres alignés à droite.

## Overlays

### `ez-dialog`
- `v-model`, `title` (requis), `width`, `persistent`; slots `default`, `#actions`
- Se téléporte dans `body`. Actions: annuler en `flat`, confirmer en `primary` (ou `danger`).

## Composants métier

Aucun pour l'instant. Un composant métier (qui connaît un dossier, un signataire…) se construit dans l'app, `ezmax-library-quasar`, jamais d'abord ici: le blueprint ne fait que refléter ce que l'app a déjà. En attendant, une primitive et les méthodes du mock suffisent: `<ez-badge :tone="folder.stateTone()" :label="folder.stateLabel()" />`.

## Helpers (`import { … } from '@ez'`)

- `useScenario(scenarios)`: données du scénario choisi dans le shell (ref locale, modifiable)
- `defineScenarios({ full: () => …, empty: () => … })`: dans `mocks.ts`
- `formatDate`, `formatDateTime`, `formatRelative`
- `gettext` (aussi `$gettext` dans les templates), `ez.icons`

## Manque quelque chose? Le construire dans la version

Ce qui existe ici s'utilise tel quel: jamais de `<button>`, `<input>`, `<select>`, `<textarea>` ou `<table>` brut, ni de carte, de badge ou de dialogue refait à la main. Ce qui n'existe pas (une ligne du temps, un tableau de bord, un canevas…) se construit dans la version, en HTML avec un style `scoped` fait seulement de tokens.

- **Un morceau local**: `prototypes/<tâche>/vNNN/components/FolderTimeline.vue`, importé par `index.vue`. Aucun en-tête, libre dans son balisage et son style. Il peut lire les fichiers de sa version (`../mocks`).
- **Un composant rehaussé**: un `ez-` existant à qui il manque quelque chose (une prop, un slot, un état). Copier son fichier (`blueprint/ez/components/card/ez-card.vue`) dans `components/` sous le nom `EzCard.vue`, retirer ses imports relatifs (les `ez-` sont globaux), modifier la copie, l'importer dans `index.vue`: dans cette version, elle remplace l'original.
- **Une proposition de primitive**, seulement si le morceau servirait clairement à d'autres tâches, ou sur demande: il se nomme `Ez…`, ne connaît aucun objet métier et commence par son en-tête.

```vue
<!-- @proposal primitive: Masque le bas d'un contenu long sur mobile et le dévoile au toucher -->
<template>
   …
</template>
```

- `@proposal primitive`, puis pourquoi il existe. `mockup check` vérifie qu'il suit les règles d'une primitive.
- **Un composant métier manquant** (un bouton « Soumettre » qui connaît le dossier, une liste de signataires): le construire localement, sans en-tête, et l'écrire dans `notes.md`, sous « Signalements »: `Composant métier manquant: …`. Il se construit ensuite dans l'app; il n'est jamais proposé ni promu ici.
- Rien de tout ça ne bloque le prototype. `yarn mockup proposals` liste ce qui a été créé, rehaussé et proposé dans toutes les tâches. Un humain décide de ce qui entre dans le blueprint: `yarn mockup promote <tâche> <version> <Nom>` (un composant rehaussé remplace l'original). Seulement sur demande. Un composant promu apparaît tout seul dans la galerie (« Autres composants »), dans son dossier `blueprint/ez/components/<nom>/` (comme dans l'app: `ez-<nom>.vue`), avec une démo générée à côté, `ez-<nom>.example.vue`, à ajuster.

<!-- api:start — généré par yarn mockup catalog, ne pas modifier à la main -->

## API (généré)

Tiré du code des composants par `yarn mockup catalog`. `*` = prop obligatoire. Le texte au-dessus de cette section est écrit à la main: quand utiliser quoi.

### Primitives

#### `ez-app-shell`

Placeholder frame of the production shell (toolbar + left drawer), empty on purpose: it only gives prototypes their real position and width inside the app.

Aucune prop.

Slots: `défaut`

#### `ez-badge`

| Prop | Type | Défaut | |
|---|---|---|---|
| `label` | `string` |  |  |
| `tone` | `neutral` `info` `success` `warning` `danger` `action` | `'neutral'` | Same tone = same meaning everywhere (see brand.md) |
| `dot` | `boolean` |  |  |
| `solid` | `boolean` |  | Filled with the solid color, squarer: the badges of a table in production |

Slots: `défaut`

#### `ez-btn`

| Prop | Type | Défaut | |
|---|---|---|---|
| `label` | `string` |  |  |
| `icon` | `IconName` |  |  |
| `icon-right` | `IconName` |  |  |
| `variant` | `positive` `primary` `secondary` `flat` `danger` | `'secondary'` | positive: the main action of a page (create, save) · primary: the main action of a zone · secondary: default · flat: low emphasis · danger: destructive |
| `pill` | `boolean` |  | Rounded ends and uppercase label: the actions of a page header |
| `size` | `md` `sm` | `'md'` |  |
| `loading` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `block` | `boolean` |  |  |
| `type` | `button` `submit` `reset` | `'button'` |  |
| `aria-label` | `string` |  | Required for icon-only buttons (shown as tooltip) |

Slots: `défaut`

#### `ez-card`

| Prop | Type | Défaut | |
|---|---|---|---|
| `title` | `string` |  |  |
| `subtitle` | `string` |  |  |
| `icon` | `IconName` |  |  |
| `flush` | `boolean` |  | No body padding — for tables and lists that touch the edges |
| `toc-id` | `string` |  | Makes this card a sub-entry of the parent ez-page-section in the TOC |

Slots: `#header`, `#actions`, `défaut`, `#footer`

#### `ez-dialog`

| Prop | Type | Défaut | |
|---|---|---|---|
| `title` * | `string` |  |  |
| `width` | `string` | `'var(--dialog-width)'` |  |
| `persistent` | `boolean` |  | Click outside / Escape do not close |
| `model-value` | `boolean` |  | v-model |

Slots: `défaut`, `#actions`

#### `ez-empty-state`

| Prop | Type | Défaut | |
|---|---|---|---|
| `title` * | `string` |  |  |
| `text` | `string` |  |  |
| `icon` | `IconName` | `'inbox'` |  |

Slots: `#actions`

#### `ez-field`

| Prop | Type | Défaut | |
|---|---|---|---|
| `label` | `string` |  |  |
| `type` | `text` `email` `tel` `number` `date` `password` `search` `textarea` `select` | `'text'` |  |
| `options` | `EzFieldOption[]` | `() => []` |  |
| `placeholder` | `string` |  |  |
| `hint` | `string` |  |  |
| `error` | `string` |  |  |
| `icon` | `IconName` |  |  |
| `rows` | `number` | `4` |  |
| `required` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `readonly` | `boolean` |  |  |
| `model-value` | `string \| number \| null` |  | v-model |

#### `ez-icon`

| Prop | Type | Défaut | |
|---|---|---|---|
| `name` * | `IconName` |  |  |
| `size` | `number` | `18` |  |

#### `ez-info-list`

| Prop | Type | Défaut | |
|---|---|---|---|
| `items` * | `EzInfoItem[]` |  |  |
| `inline` | `boolean` |  | Label and value side by side |
| `tiles` | `boolean` |  | Each pair in a bordered tile, side by side when there is room: the information of a detail page in production |

Slots: `#value-<…>`

#### `ez-layout`

| Prop | Type | Défaut | |
|---|---|---|---|
| `gap` | `string` | `'var(--card-gap, var(--space-gap-md))'` |  |

Slots: `défaut`

#### `ez-layout-col`

| Prop | Type | Défaut | |
|---|---|---|---|
| `cols` | `Span` | `12` | Columns out of 12. Number, or per breakpoint: { base: 12, md: 8 } (md ≥ 1024px, lg ≥ 1440px, as in production) |
| `first-below-md` | `boolean` |  | Production pattern: right column goes first under md |

Slots: `défaut`

#### `ez-message-important`

| Prop | Type | Défaut | |
|---|---|---|---|
| `type` | `info` `success` `warning` `danger` | `'info'` |  |
| `title` | `string` |  |  |

Slots: `défaut`, `#actions`

#### `ez-page`

Aucune prop.

Slots: `défaut`

#### `ez-page-content`

Aucune prop.

Slots: `défaut`

#### `ez-page-header`

| Prop | Type | Défaut | |
|---|---|---|---|
| `title` * | `string` |  |  |
| `subtitle` | `string` |  |  |
| `breadcrumbs` | `string[]` |  | Where the page is, from the home down to this page: ['Accueil', 'Administration', 'Types de dossiers'] |
| `button` | `string` |  | Label of the page's primary action (emits `button`) |
| `button-icon` | `IconName` |  |  |
| `button-variant` | `positive` `primary` | `'positive'` | positive (green): create, save · primary (slate): edit |
| `refresh` | `boolean` |  | Shows the refresh action (emits `refresh`) |
| `cancelable` | `boolean` |  | Shows the back action (emits `cancel`) |

Slots: `#meta`, `#actions`

Émet: `button`, `refresh`, `cancel`

#### `ez-page-section`

| Prop | Type | Défaut | |
|---|---|---|---|
| `id` * | `string` |  |  |
| `title` * | `string` |  |  |
| `subtitle` | `string` |  |  |

Slots: `défaut`

#### `ez-page-sections`

| Prop | Type | Défaut | |
|---|---|---|---|
| `toc` | `boolean` | `true` | Sticky TOC on the right (≥ 1024px) |
| `toc-title` | `string` |  | Title of the TOC (default: « Sur cette page ») |

Slots: `défaut`

#### `ez-page-toc`

| Prop | Type | Défaut | |
|---|---|---|---|
| `title` | `string` |  |  |

#### `ez-reveal`

Hides the bottom of a long content behind a fade on narrow screens and reveals it on tap or click; collapsed by default on mobile.

| Prop | Type | Défaut | |
|---|---|---|---|
| `collapsed-height` | `string` | `'10rem'` | Max height while collapsed (CSS length) |
| `fade-to` | `surface` `muted` | `'surface'` | Color the fade blends into: card surface, or muted inset panels |
| `expand-label` | `string` | `undefined` |  |
| `collapse-label` | `string` | `undefined` |  |

Slots: `défaut`

#### `ez-table`

| Prop | Type | Défaut | |
|---|---|---|---|
| `columns` * | `EzTableColumn[]` |  |  |
| `rows` * | `TRow[]` |  |  |
| `row-key` | `string` | `'id'` |  |
| `selectable` | `boolean` |  | A checkbox per row and one for all; the chosen row keys are in v-model:selected |
| `clickable` | `boolean` |  |  |
| `loading` | `boolean` |  |  |
| `empty-title` | `string` |  |  |
| `selected` | `(string \| number)[]` |  | v-model:selected |

Slots: `#cell-<…>`, `#empty`

Émet: `row-click`

### Helpers (`import { … } from '@ez'`)

Dans les templates, `$gettext` et `ez.icons` sont disponibles sans import.

| Nom | Signature | |
|---|---|---|
| `scenarioKey` | `: InjectionKey<Ref<string>>` | Provided by the frame: the scenario currently selected in the shell. |
| `Scenarios` | `Record<string, () => T>` |  |
| `defineScenarios` | `(scenarios: Scenarios<T>): Scenarios<T>` | Declares a version's data scenarios. The first key is the default. |
| `useScenario` | `(scenarios: Scenarios<T>): Ref<T>` | Returns the data of the scenario selected in the shell, as local state. Mutating it (e.g. removing a row) is fine: switching scenario rebuilds it. |
| `formatDate` | `(value: Date \| string \| null \| undefined): string` | « 6 nov. 2026 »; « — » when empty |
| `formatDateTime` | `(value: Date \| string \| null \| undefined): string` | « 6 nov. 2026, 10 h 00 »; « — » when empty |
| `formatRelative` | `(value: Date \| string \| null \| undefined, now: Date = PROTO_TODAY): string` | « dans 3 jours », « hier », counted from the prototypes' today (PROTO_TODAY); « — » when empty |
| `PROTO_TODAY` | `const` | The prototypes' « today »: a fixed date, so a scenario always shows the same dates and delays (« dans 3 jours ») whatever day it is opened. Mock dates (daysFromToday) and formatRelative use it. |
| `protoToday` | `(): Date` | A copy of PROTO_TODAY, safe to mutate |
| `gettext` | `(message: string, params?: Record<string, string \| number>): string` | Passthrough stub for production's `$gettext`. Keeps prototype code shaped like production: `$gettext('Envoyer à %{name}', { name })`. |

<!-- api:end -->
