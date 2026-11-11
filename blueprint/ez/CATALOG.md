# Catalogue `ez-`

Composants enregistrés globalement: on les utilise directement dans les templates (`<ez-btn>`), sans import. Ce fichier dit **quand utiliser quoi**; l'API exacte (props, valeurs permises, slots, émissions) est dans la section générée à la fin, tirée du code par `pnpm proto catalog`. `proto check` refuse un composant, une prop ou une valeur qui n'y est pas.

## Deux niveaux

| | Primitives (`blueprint/ez/primitives/`) | Composants métier (`blueprint/ez/domain/<objet>/`) |
|---|---|---|
| Ex. | `ez-btn`, `ez-card`, `ez-badge`, `ez-table` | `ez-badge-folder-state`, `ez-btn-submit-folder` |
| Connaît | rien du métier: props visuelles (`variant`, `tone`) | un objet métier (`folder`, `signer`…) |
| Contient | le visuel: CSS et tokens | des primitives assemblées; pas de couleur, bordure, ombre ni arrondi |
| Nom | `ez-{chose}` | `ez-{primitive}-{intention}` (`ez-btn-submit-folder`), ou `ez-{objet}-{chose}` pour un ensemble (`ez-signer-list`) |

**Ordre de préférence dans un prototype**: un composant métier existant → des primitives assemblées → ce qui n'existe pas, le construire dans la version (voir « Manque quelque chose? » plus bas).

Les props `icon` prennent une clé de `ez.icons` (`:icon="ez.icons.send"` ou `icon="send"`). Liste: `add back calendar check chevronDown chevronRight clock close delete download edit error eye file filter folder home inbox info mail more refresh search send settings signature success user users warning`.

## Structure de page

### `ez-app-shell`
Cadre vide qui simule le shell de prod (barre du haut foncée + tiroir de gauche blanc, aux dimensions de la prod), pour placer le prototype à sa vraie position et largeur. Aucun contenu ni interaction. Ajouté automatiquement quand `meta.json` a `"chrome": "app"` (défaut); `"none"` pour un écran hors de l'app. Ne pas l'utiliser dans un prototype.

### `ez-page` > `ez-page-header` + `ez-page-content`
Toute page commence ainsi.

`ez-page-header`
- `title` (requis), `subtitle`
- `button`: libellé de l'action principale de la page (bouton primaire) → émet `button`
- `button-icon`
- `refresh` → affiche « Actualiser », émet `refresh`
- `cancelable` → affiche « Retour », émet `cancel`
- slots `#meta` (badges à côté du titre), `#actions` (actions secondaires)
- ⚠ à valider: noms exacts des émissions en prod

`ez-page-content`: conteneur avec la marge `--inset-page` et la largeur max. Pas de props.

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
- `variant`: `primary` (un seul par zone) · `secondary` (défaut) · `flat` (faible emphase, actions de carte) · `danger` (destructif)
- `size`: `md` · `sm`; `loading`, `disabled`, `block`, `type`
- Bouton icône seule: `aria-label` obligatoire

### `ez-badge`
- `label` ou slot, `tone`: `neutral info success warning danger action`, `dot`
- Pour le statut d'un objet métier, utiliser son composant métier (`ez-badge-folder-state`, `ez-badge-signer-state`): même statut = même badge partout.

### `ez-message-important`
- `type`: `info success warning danger`, `title`; slots `default`, `#actions`

### `ez-empty-state`
- `title` (requis), `text`, `icon`; slot `#actions`

### `ez-info-list`
Paires libellé / valeur (colonne de droite, résumés). **Propre à ez-proto** (pas d'équivalent connu en prod).
- `items`: `{ label, value?, key? }[]`, `inline`; slot `#value-<key>`

### `ez-icon`
- `name`, `size` (défaut 18)

## Formulaires

### `ez-field`
- `v-model`, `label`, `type`: `text email tel number date password search textarea select`
- `options` (select): `{ label, value }[]`, `placeholder`, `hint`, `error`, `icon`, `rows`, `required`, `disabled`, `readonly`
- Formulaire en grille: `ez-layout` + `ez-layout-col :cols="{ base: 12, md: 6 }"`

## Données

### `ez-table`
- `columns`: `{ key, label, align?, width? }[]`, `rows`, `row-key` (défaut `id`), `clickable` → `row-click`, `loading`, `empty-title`
- slot `#cell-<key>="{ row, value }"` pour formater une cellule; `#empty`
- Dans une carte: `<ez-card flush>`. Dates et nombres alignés à droite.

## Overlays

### `ez-dialog`
- `v-model`, `title` (requis), `width`, `persistent`; slots `default`, `#actions`
- Se téléporte dans `body`. Actions: annuler en `flat`, confirmer en `primary` (ou `danger`).

## Composants métier

### `ez-badge-folder-state` · folder
Le statut d'un dossier. `:folder` (un `EzsignFolder` de `@mocks`), `dot` pour les listes denses. Remplace `<ez-badge :tone="folder.stateTone()" :label="folder.stateLabel()" />`.

### `ez-badge-signer-state` · signer
Le statut d'un signataire (en attente, consulté, signé, refusé). `:signer` (un `EzsignSigner`), `dot`.

## Helpers (`import { … } from '@ez'`)

- `useScenario(scenarios)`: données du scénario choisi dans le shell (ref locale, modifiable)
- `defineScenarios({ full: () => …, empty: () => … })`: dans `mocks.ts`
- `formatDate`, `formatDateTime`, `formatRelative`
- `gettext` (aussi `$gettext` dans les templates), `ez.icons`

## Manque quelque chose? Le construire dans la version

Ce qui existe ici s'utilise tel quel: jamais de `<button>`, `<input>`, `<select>`, `<textarea>` ou `<table>` brut, ni de carte, de badge ou de dialogue refait à la main. Ce qui n'existe pas (une ligne du temps, un tableau de bord, un canevas…) se construit dans la version, en HTML avec un style `scoped` fait seulement de tokens.

- **Un morceau local**: `prototypes/<tâche>/vNNN/components/FolderTimeline.vue`, importé par `index.vue`. Aucun en-tête, libre dans son balisage et son style. Il peut lire les fichiers de sa version (`../mocks`).
- **Un composant rehaussé**: un `ez-` existant à qui il manque quelque chose (une prop, un slot, un état). Copier son fichier de `blueprint/ez/` dans `components/` sous le même nom (`EzCard.vue`), modifier la copie, l'importer dans `index.vue`: dans cette version, elle remplace l'original.
- **Une proposition**, seulement si le morceau servirait clairement à d'autres tâches, ou sur demande: il se nomme `Ez…` et commence par son en-tête.

```vue
<!-- @proposal domain folder: Soumettre un dossier: libellé, icône et confirmation identiques partout -->
<template>
   <ez-btn variant="primary" icon="send" :label="$gettext('Soumettre')" :disabled="folder.isStateClosed()" />
</template>
```

- `@proposal domain <objet>` ou `@proposal primitive`, puis pourquoi il existe. Une proposition suit les règles de son niveau (`proto check` les vérifie): une proposition métier n'a ni couleur, ni bordure, ni ombre, ni arrondi à elle.
- Rien de tout ça ne bloque le prototype. `pnpm proto proposals` liste ce qui a été créé, rehaussé et proposé dans toutes les tâches. Un humain décide d'en promouvoir une: `pnpm proto promote <tâche> <version> <Nom>`. Seulement sur demande.

<!-- api:start — généré par pnpm proto catalog, ne pas modifier à la main -->

## API (généré)

Tiré du code des composants par `pnpm proto catalog`. `*` = prop obligatoire. Le texte au-dessus de cette section est écrit à la main: quand utiliser quoi.

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

Slots: `défaut`

#### `ez-btn`

| Prop | Type | Défaut | |
|---|---|---|---|
| `label` | `string` |  |  |
| `icon` | `IconName` |  |  |
| `icon-right` | `IconName` |  |  |
| `variant` | `primary` `secondary` `flat` `danger` | `'secondary'` | primary: one per zone · secondary: default · flat: low emphasis · danger: destructive |
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
| `model-value` * | `boolean` |  |  |
| `title` * | `string` |  |  |
| `width` | `string` | `'var(--dialog-width)'` |  |
| `persistent` | `boolean` |  | Click outside / Escape do not close |

Slots: `défaut`, `#actions`

Émet: `update:modelValue`

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
| `model-value` | `string \| number \| null` |  |  |
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

Émet: `update:modelValue`

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
| `button` | `string` |  | Label of the page's primary action (emits `button`) |
| `button-icon` | `IconName` |  |  |
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
| `toc-title` | `string` | `'Sur cette page'` |  |

Slots: `défaut`

#### `ez-page-toc`

| Prop | Type | Défaut | |
|---|---|---|---|
| `title` | `string` | `'Sur cette page'` |  |

#### `ez-table`

| Prop | Type | Défaut | |
|---|---|---|---|
| `columns` * | `EzTableColumn[]` |  |  |
| `rows` * | `TRow[]` |  |  |
| `row-key` | `string` | `'id'` |  |
| `clickable` | `boolean` |  |  |
| `loading` | `boolean` |  |  |
| `empty-title` | `string` | `'Aucun élément'` |  |

Slots: `#cell-<…>`, `#empty`

Émet: `row-click`

### Composants métier

#### `ez-badge-folder-state` · folder

The state of an eZsign folder: same state, same badge, everywhere. Use it instead of `<ez-badge :tone="folder.stateTone()" :label="folder.stateLabel()" />`.

Construit avec: `ez-badge`

| Prop | Type | Défaut | |
|---|---|---|---|
| `folder` * | `EzsignFolder` |  |  |
| `dot` | `boolean` |  | Small dot before the label, for dense lists |

#### `ez-badge-signer-state` · signer

The state of a signer (pending, viewed, signed, refused): same state, same badge, everywhere. Use it instead of `<ez-badge :tone="signer.stateTone()" :label="signer.stateLabel()" />`.

Construit avec: `ez-badge`

| Prop | Type | Défaut | |
|---|---|---|---|
| `signer` * | `EzsignSigner` |  |  |
| `dot` | `boolean` |  | Small dot before the label, for dense lists |

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
