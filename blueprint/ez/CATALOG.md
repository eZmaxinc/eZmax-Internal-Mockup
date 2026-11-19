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

Les props `icon` prennent une clé de `ez.icons` (`:icon="ez.icons.send"` ou `icon="send"`). Les glyphes sont ceux de l'app: le même package (`@quasar/extras`), la même famille (Material Symbols Outlined, MDI là où l'app prend MDI), et pour chaque clé le glyphe que la prod donne au même usage. Jamais une icône dessinée à la main ni un autre jeu: une icône qui manque s'ajoute dans `blueprint/ez/icons.ts` en important le symbole que la prod utilise. Liste: `add back calendar check chevronDown chevronRight clock close delete download edit error eye file filter folder home inbox info mail menu more refresh search send settings signature success user users warning`.

## Structure de page

### `ez-app-shell`
Cadre qui simule le shell de prod (barre du haut foncée avec bouton menu burger + tiroir de gauche blanc rétractable, aux dimensions de la prod), pour placer le prototype à sa vraie position et largeur. Ajouté automatiquement quand `meta.json` a `"chrome": "app"` (défaut); `"none"` pour un écran hors de l'app. Ne pas l'utiliser dans un prototype.

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
La grille de la prod, telle quelle (promue depuis la refonte des types de dossiers, v001). Seuils: `xs` 0, `sm` 600, `md` 1024, `lg` 1440, `xl` 1920 px, ou n'importe quelle largeur en pixels (`{ 0: 1, 900: 2 }`).
- `ez-layout`
  - `columns`: le nombre de colonnes (12 par défaut), ou un nombre par seuil (`{ xs: 1, md: 2 }`)
  - `gap`: un nombre = un multiple de 0.25rem comme Tailwind (`3` → 0.75rem), une chaîne = une longueur, `{ row, column }`; défaut `var(--card-gap, var(--space-gap-md))`
  - `direction`: `grid` (défaut) · `subgrid` (les colonnes du parent) · `wrap` (côte à côte, à la ligne au besoin) · `stack` (l'un sous l'autre)
  - `container`: les descendants mesurent leurs seuils sur ce bloc plutôt que sur la fenêtre (une carte étroite dans une page large)
  - `debug`: contour de chaque grille et étiquette de chaque colonne (span, seuils), « Colonne vide » si elle ne rend rien
  - `span` (un ez-layout imbriqué sans colonne), `as`
- `ez-layout-col`
  - `span`: sur combien de colonnes, par seuil (`{ xs: 12, md: 8 }`); sans span, toute la ligne. Dans un parent `wrap` ou `stack`, le span devient une largeur
  - `first-below-md`: la colonne passe en premier sous md
  - `container`, `name` (son étiquette en debug), `as`
  - Ses enfants s'empilent avec l'écart des cartes (`--card-gap`): plusieurs `ez-card` dans une colonne.
  - `cols` (`{ base, md, lg }`) est l'ancienne API, gardée pour les versions existantes: écrire `span`.

Patron prod: principale `:span="{ xs: 12, md: 8 }"`, droite `:span="{ xs: 12, md: 4 }" first-below-md`.

### `ez-layout-composition`
Une mise en page déclarée en données plutôt qu'en balises: des sections, puis des colonnes et des groupes de colonnes, une feuille = un slot. Pour un formulaire ou une fiche dont la disposition se décrit mieux en tableau qu'en template (et qu'on veut pouvoir réordonner). `ez-info` s'en sert.
- `composition`: `defineLayoutComposition((t) => [sections], { sections, cols, container })` (de `@ez`); `t` traduit les titres
- Une section: `key`, `title`, `span`, `columns`, `gap`, `direction`, `cols`. Une colonne: `id` et soit `slot` (+ `label`, `props`, `span`), soit `cols` (un groupe, avec `direction`, `columns`, `gap`)
- Slots: `#<slot>` par feuille (typé d'après la définition), sinon `#field="{ slot, label, props }"` pour toutes; `debug`

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

### `ez-heading`
Un titre hors des composants qui ont déjà le leur (`ez-page-header`, `ez-page-section`, `ez-card`, `ez-dialog` ont une prop `title`): le titre d'une zone construite à la main (une frise, un panneau, un groupe de champs).
- `variant`: `page` (h1) · `section` (défaut, h2) · `card` (h3) · `group` (h3, petit: un groupe dans une carte)
- `as`: `h1 h2 h3 h4 legend span`, pour changer la balise sans changer l'allure (`as="legend"` dans un `fieldset`); slot `default`

### `ez-btn`
- `label` ou slot, `icon`, `icon-right`
- `variant`: `positive` (vert: l'action principale d'une page) · `primary` (ardoise: l'action d'une zone, un seul par zone) · `secondary` (défaut) · `flat` (faible emphase, actions de carte) · `danger` (destructif, en contour rouge)
- `pill`: bouts arrondis et libellé en majuscules, pour les actions d'un en-tête de page
- `size`: `md` · `sm`; `loading`, `disabled`, `block`, `type`
- Bouton icône seule: `aria-label` obligatoire

### `ez-badge`
- `label` ou slot, `tone`: `neutral info success warning danger action`, `dot`, `solid` (plein, pour un tableau), `outline` (sans fond, le contour seul: un fait secondaire à côté d'un statut, des compteurs)
- Cliquable: `as="a"` avec `href` (un lien), ou `as="button"` (une action); un voile léger de la couleur du texte au survol, quel que soit le ton (les compteurs « 3 fichiers » qui ouvrent la liste)
- Le statut d'un objet métier: `:tone="folder.stateTone()" :label="folder.stateLabel()"` (de même pour `signer`). Les méthodes du mock donnent le même badge partout.

### `ez-dot`
Un point de couleur: un statut en un coup d'œil, à côté d'un libellé. `ez-badge` le dessine avec `dot`, dans la couleur de son texte.
- `tone`: `neutral info success warning danger action` (les mêmes sens que `ez-badge`)
- `pulse`: un anneau fin qui grandit et s'efface, en boucle, pour un statut vivant (actif, en cours, en ligne); arrêté si l'utilisateur réduit les animations. Dans un badge: `<ez-badge dot pulse>`
- Réglages: `--dot-size` (défaut 6px), `--dot-color`

### `ez-message-important`
- `type`: `info success warning danger`, `title`; slots `default`, `#actions`

### `ez-empty-state`
- `title` (requis), `text`, `icon`; slot `#actions`

### `ez-info`
Les informations d'une fiche, en tuiles grises, comme en prod (`EzInfo`, variante `flat`; promu depuis la refonte des types de dossiers, v001). Les données ont la forme de la prod: un `theInfoData` de l'app se recopie tel quel.
- `data`: `IInfoCategory[]` (types de `@ez`). Une catégorie: `name`, `title`, `icon`, `tone`, `items`, `groups` (sous-catégories encadrées). Un `false` dans `items` est ignoré: `isAllowed && { … }`
- Un item: `key`, `label`, `value`, `col` (span de `ez-layout`, ou une classe Quasar `'col-12 col-md-4'`; défaut `{ xs: 6, sm: 4, lg: 3 }`), `hint`, `tooltip` (ⓘ après le libellé), `onClick` (la tuile devient un lien), `valueStyle`, `separator`
- La valeur choisit le dessin: un texte → la tuile; `{ amount, unit }` → un compte encadré à droite; un tableau → des pastilles dans la tuile
- `variant: 'list'`: une ligne par entrée (`{ label, value: true/false }`: activé en vert ✓, désactivé en gris ✕), sur deux colonnes dès md · `variant: 'pill'`: une pastille par item, côte à côte avec les suivantes
- Les tons (`positive neutral muted`, `negative` = `muted`, jamais rouge): `true` → positive, `false` → muted, sans valeur → neutral, un texte → positive. Pastilles et listes: les positives d'abord
- Slots: `#<key>` remplace un item, `#field="{ item, label }"` les remplace tous
- Ses pièces (`info-element-boxed`, `-pill`, `-list`, `info-item-group`, `info-category-cols`, dans `info/`) sont privées: pas de balise globale, on passe par `ez-info`. En prod, elles s'appellent `ez-info-element-…`.

### `ez-tooltip`
Une explication au survol ou au focus du clavier (promu depuis la tâche du cycle de vie). Le déclencheur est le slot: une icône `info`, un badge, un point. La bulle se dessine sur le `body`, au-dessus (ou au-dessous près du haut de la fenêtre).
- `text`, `title` (en gras, au-dessus), `as`; slot `#content` pour une explication riche

### `ez-icon`
Un glyphe de l'app (`@quasar/extras`, Material Symbols Outlined), plein, dans la couleur du texte (`currentColor`).
- `name` (une clé de `ez.icons`), `size` (défaut 18)

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
- Se téléporte dans `body`. Sous 1024 px (téléphone, tablette), il monte du bas de l'écran, sur toute la largeur; `width` ne compte qu'au-dessus. Actions: annuler en `flat`, confirmer en `primary` (ou `danger`).

## Composants métier

Aucun pour l'instant. Un composant métier (qui connaît un dossier, un signataire…) se construit dans l'app, `ezmax-library-quasar`, jamais d'abord ici: le blueprint ne fait que refléter ce que l'app a déjà. En attendant, une primitive et les méthodes du mock suffisent: `<ez-badge :tone="folder.stateTone()" :label="folder.stateLabel()" />`.

## Helpers (`import { … } from '@ez'`)

- `useScenario(scenarios)`: données du scénario choisi dans le shell (ref locale, modifiable)
- `useAppShell({ withSkeleton?: boolean })`: configure le shell applicatif parent (ex. menu latéral en squelette)
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

| Prop | Type | Défaut | |
|---|---|---|---|
| `with-skeleton` | `boolean` | `false` | Shows pale grey skeleton placeholders in the left navigation drawer, shaped like the production menu |

Slots: `défaut`

#### `ez-badge`

| Prop | Type | Défaut | |
|---|---|---|---|
| `label` | `string` |  |  |
| `tone` | `neutral` `info` `success` `warning` `danger` `action` | `'neutral'` | Same tone = same meaning everywhere (see brand.md) |
| `dot` | `boolean` |  |  |
| `pulse` | `boolean` |  | With dot: the dot pulses, for a live status (ez-dot) |
| `solid` | `boolean` |  | Filled with the solid color: the badges of a table in production |
| `outline` | `boolean` |  | No fill, only the outline on the surface: a secondary fact beside a status (counters, conditions) |
| `as` | `string \| object` | `'span'` | Renders as another element or component; a link or a button (`a`, `button`, `router-link`) becomes clickable, with a light hover |
| `href` | `string` |  | With as="a": where the link goes |

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
| `subtitle` | `string` |  | A line under the title |
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

#### `ez-dot`

| Prop | Type | Défaut | |
|---|---|---|---|
| `tone` | `neutral` `info` `success` `warning` `danger` `action` | `'neutral'` | Same tone = same meaning everywhere, as ez-badge |
| `pulse` | `boolean` |  | A ring that grows out of the dot and fades, in a loop: something live (active, in progress, online) |
| `as` | `string` | `'span'` | Renders as another element |

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

#### `ez-heading`

| Prop | Type | Défaut | |
|---|---|---|---|
| `variant` | `HeadingVariant` | `'section'` | The level of the title in the page: it sets the look, and the tag when `as` is not given |
| `as` | `HeadingTag` |  | Renders as another tag without changing the look (default: page → h1, section → h2, card and group → h3) |

Slots: `défaut`

#### `ez-icon`

| Prop | Type | Défaut | |
|---|---|---|---|
| `name` * | `IconName` |  | A key of ez.icons; its glyph is production's (@quasar/extras, Material Symbols Outlined) |
| `size` | `number` | `18` |  |

#### `ez-info`

| Prop | Type | Défaut | |
|---|---|---|---|
| `data` * | `IInfoCategory[]` |  | The categories, in order: titled groups of items (IInfoCategory[], the same objects as production) |
| `as` | `string` | `'div'` | Renders as another element |

Slots: `#slot`, `#field`

#### `ez-layout`

| Prop | Type | Défaut | |
|---|---|---|---|
| `columns` | `TLayoutColumns` | `12` | Columns of the grid: a count, or counts per threshold ({ xs: 1, md: 2 }) |
| `gap` | `TLayoutGap` | `'var(--card-gap, var(--space-gap-md))'` | A number is a multiple of 0.25rem (4 → 1rem), a string any length; { row, column } for two gaps |
| `direction` | `TLayoutDirection` | `'grid'` | grid (default): 12 columns · subgrid: the columns of the parent · wrap: side by side, wrapping · stack: one below the other |
| `span` | `TLayoutSpan` | `undefined` | Place in a parent ez-layout, when this one is nested without an ez-layout-col |
| `container` | `boolean` | `undefined` | true: the descendants measure their thresholds on this element, not on the window; false: on the window again |
| `debug` | `boolean` | `undefined` | Outlines the grid and labels each column, for this layout and the ones inside |
| `as` | `string` | `'div'` | Renders as another element (section, ul…) |

Slots: `défaut`

#### `ez-layout-col`

| Prop | Type | Défaut | |
|---|---|---|---|
| `span` | `TLayoutSpan` | `undefined` | Columns out of the parent's (12): a count, or counts per threshold ({ xs: 12, md: 8 }); none = the whole row |
| `cols` | `TLegacyLayoutCols` | `undefined` | Before production's span: { base: 12, md: 8 }, base being xs. Kept for the existing prototypes; prefer span |
| `first-below-md` | `boolean` |  | The column goes first below md (1024px): the right column of a form, in production |
| `container` | `boolean` | `undefined` | true: the descendants measure their thresholds on this column, not on the window |
| `name` | `string` | `undefined` | Its label in debug mode |
| `as` | `string` | `'div'` | Renders as another element (section, li…) |

Slots: `défaut`

#### `ez-layout-composition`

| Prop | Type | Défaut | |
|---|---|---|---|
| `composition` * | `TLayoutCompositionDefinition<T>` |  | The definition: defineLayoutComposition((t) => [...sections], options) |
| `debug` | `boolean` | `undefined` | Outlines every grid and labels every column |
| `as` | `string` | `'div'` | Renders as another element |

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

#### `ez-tooltip`

| Prop | Type | Défaut | |
|---|---|---|---|
| `title` | `string` |  | A short title, in bold |
| `text` | `string` |  | The explanation; the slot `content` replaces it |
| `as` | `string` | `'span'` | Renders as another element |

Slots: `défaut`, `#content`

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
