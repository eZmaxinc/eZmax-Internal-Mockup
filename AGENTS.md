# AGENTS.md — ez-proto

You build **prototypes** of eZsign/eZmax screens: minimal, but indistinguishable in look and structure from production. You compose; you never invent design.

## Golden rules

1. **Compose, don't invent.** Only `ez-` components (`blueprint/ez/CATALOG.md`), semantic tokens (`blueprint/tokens/ez-tokens.css`, semantic layer) and the patterns in `blueprint/patterns/`. No raw colors, no Tailwind palette (`bg-blue-500` doesn't exist here), no `--prim-*`. `proto check` rejects an unknown `ez-` component, prop or value, and flags raw `<button>`, `<input>`, `<table>`.
2. **Two tiers of components.** *Primitives* (`blueprint/ez/primitives/`: `ez-btn`, `ez-card`…) are generic and own the visuals. *Domain components* (`blueprint/ez/domain/<object>/`: `ez-badge-folder-state`, `ez-btn-submit-folder`…) know one business object and only assemble primitives: no colors, borders, shadows or radius of their own. Prefer, in this order: an existing domain component → primitives assembled → **propose** a domain component → (last resort) propose a primitive. A proposal lives in the version (`vNNN/components/EzName.vue`), starts with `<!-- @proposal domain <object>: why -->` and is imported by `index.vue`. Only a human promotes it (`pnpm proto promote`). Never edit `blueprint/ez/` yourself unless asked.
3. **One prototype = one GoodDay task.** Every task folder is `prototypes/<GoodDay number>-<slug>/`, named like the branch (`feature/49198-la-tache` → `49198-la-tache`), with `goodday: { number, url }` in `meta.json`. No number or link? Ask the user. **The task already has a folder** (`proto new` says so, or you find one): stop and tell the user (folder, latest version). Never reuse or rewrite its versions; go on only on their instruction, usually with `pnpm proto iterate`.
4. **Versions are immutable.** Never edit an existing `v###` folder. Every iteration is a new version created with `pnpm proto iterate`. Exception: the version you are creating in the current turn.
5. **One version = one folder, self-contained.** It imports only from `vue`, `@ez`, `@mocks` and its own files. Never `../` into another version.
6. **Data lives in `mocks.ts` as named scenarios** (first = default). Cover at least the main state plus one edge state (empty, error, closed…). Use the business objects from `@mocks` and their methods (`stateLabel()`, `stateTone()`, `isStateClosed()`…).
7. **Write `notes.md`** for every version: first line = one-sentence summary; then what changed and open questions. List the components you proposed there, with why.
8. **Run `pnpm proto check <task>` and look at the result before saying you're done.** Fix every ✗. Look at it in the browser: `pnpm dev` must run in a background terminal; `pnpm proto open <task> <version>` prints the URLs. Open the **Prototype** URL in your browser (Cursor's browser), check every scenario (`?scenario=<name>`), the dark theme (`&theme=dark`) and a narrow width (390 px), compare with the closest pattern, fix what looks off.
9. **Tokens change only on purpose.** Never add a token in a prototype. A new or changed token is an explicit edit of `blueprint/tokens/ez-tokens.css` followed by `pnpm proto tokens bump`, and only when the user asks.
10. **Flat files only.** No database: structured data in JSON (`meta.json`), prose in Markdown, history in git and in the version folders. Change a task's status with `pnpm proto status`, not by hand.

## Read before building

| When | Read |
|---|---|
| Always | `blueprint/brand/brand.md`, `blueprint/ez/CATALOG.md` (when to use what + generated API of components and `@ez` helpers) |
| Using business data | `blueprint/mocks/API.md` (generated: `EzsignFolder`, `EzsignSigner`… their properties and methods, the factories) |
| Building a page | the closest `blueprint/patterns/*/index.vue` (list, detail with TOC, edit form) |
| Starting a task | `prototypes/<task>/README.md` (the brief) |
| Iterating | the source version's `index.vue`, `mocks.ts`, `notes.md` |

That is enough to build. **Don't read `tool/`** (the CLI explains itself: `pnpm proto help`) **nor the source of `blueprint/ez` or `blueprint/mocks`**: the catalog and `API.md` are generated from it. Open a source only when they really don't answer, and then say what was missing in `notes.md`.

## Starter: a version in three files

`pnpm proto new` (or `iterate`) creates them; this is the shape to aim for.

`mocks.ts`: named scenarios, the first is the default. Dates always through `daysFromToday()`; set only what matters to the story, the factories fill the rest.

```ts
import { defineScenarios } from '@ez'
import { daysFromToday, makeFolder, type EzsignFolder } from '@mocks'

export const scenarios = defineScenarios({
   'due-soon': () => ({
      folders: [
         makeFolder(1, { state: 'sent', dueAt: daysFromToday(2) }),
         makeFolder(2, { state: 'completed', dueAt: daysFromToday(1) }), // edge: closed
      ],
   }),
   empty: () => ({ folders: [] as EzsignFolder[] }),
})
```

`index.vue`: template first; components without import; local state named `the*`, UI state in `theUI`; text through `$gettext`; interactions simulated on `theData` (no network).

```vue
<template>
   <ez-page>
      <ez-page-header :title="$gettext('Dossiers')" />
      <ez-page-content>
         <ez-card flush>
            <ez-table :columns="columns" :rows="theData.folders" :empty-title="$gettext('Aucun dossier')">
               <template #cell-state="{ row }">
                  <ez-badge-folder-state :folder="row" />
               </template>
            </ez-table>
         </ez-card>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { gettext, useScenario, type EzTableColumn } from '@ez'
import { scenarios } from './mocks'

const theData = useScenario(scenarios) // rebuilt when the scenario changes in the shell
const theUI = reactive({ $dialogs: { extend: false } })

const columns: EzTableColumn[] = [
   { key: 'name', label: gettext('Dossier') },
   { key: 'state', label: gettext('Statut') },
]
</script>
```

`notes.md`: first line = the one-sentence summary shown in the shell.

```md
---
based_on: v001
date: 2026-11-09
---
Liste des dossiers qui expirent bientôt, avec prolongation.

## Changements
- …

## Propositions
- `EzBtnExtendFolder` (domain · folder): pourquoi.

## Signalements
- Bug primitive: ez-dialog déborde à 390 px (contourné ici par la prop width).
- Bug helper: formatRelative ne part pas du même « aujourd'hui » que les mocks.
- Mock manquant: EzsignFolder.daysUntilDue(), calculé localement.

## Questions ouvertes
- …
```

**Something is wrong in `blueprint/`** (a primitive bug, a missing mock method): don't fix it there. Work around it inside the version if needed, and write it under « Signalements » as `Bug primitive: …`, `Bug helper: …`, `Mock manquant: …` or `Composant manquant: …`. `pnpm proto proposals` collects them for the team.

## Commands

One CLI, `pnpm proto` (`pnpm proto help` for everything). In a non-interactive shell it never prompts: pass every argument.

```bash
pnpm proto new 49198 https://www.goodday.work/t/M2nSjU "Titre"            # new task + v001 (blank)
pnpm proto new 49198 https://www.goodday.work/t/M2nSjU "Titre" --from detail-page
pnpm proto iterate <task> -m "Résumé"                    # next version from the latest
pnpm proto iterate <task> -m "Résumé" --from v001        # from an older version
pnpm proto iterate <task> -m "Résumé" --variant          # v002 → v002b
pnpm proto status <task> review|chosen|archived [vNNN]   # team decision, in meta.json
pnpm proto list [--status review] [--mine] [--all]
pnpm proto diff <task> [v001] [v002]
pnpm proto check [task]                                  # rules + types
pnpm proto export <task> [version]                       # → exports/<task>-<version>.html
pnpm proto proposals                                     # components proposed in prototypes, most requested first
pnpm proto catalog                                       # regenerate the catalog after a change in blueprint/ez (only when asked)
pnpm proto tokens [bump patch|minor|major -m "…"]         # shared tokens: version, changelog (only when asked)
pnpm proto open [task] [version]                         # shell on http://localhost:5180
```

`<task>` accepts the GoodDay number (`49198` or `#49198`), the GoodDay link, the folder name or a unique part of it.

## Code conventions (same as production)

- `.vue`: `<template>` first, then `<script setup lang="ts">`, then `<style scoped>` (only if needed — prefer utilities and component props).
- 3-space indentation. English identifiers and comments; **UI text in French** through `$gettext('…')` / `gettext('…')`, interpolation `%{name}`.
- Refs and local state named `the*` (`theData`, `theFolder`); UI state in a `theUI` object (`$isLoading`, `$dialogs`).
- Icons through `ez.icons.<key>` (or the key string).
- Utility classes: `block-name || utilities` when a BEM name helps.
- Semantic utilities: `bg-surface`, `bg-background`, `text-foreground`, `text-foreground-muted`, `text-foreground-subtle`, `border-border`, `text-accent`, `text-positive-strong`, `bg-warning-subtle`… (any `--color-*` in the semantic layer).
- French copy: no space before a colon (« Statut: Complété »).

## Repository map

```
blueprint/             the UI blueprint, what ez-proto maintains
  tokens/                ez-tokens.css (primitives → semantics, the source copied into the mono),
                         components.css (ez- knobs), CHANGELOG.md, COPY.md
  ez/primitives/         generic ez- components (own the visuals)
  ez/domain/<object>/    domain ez- components (assemble primitives)
  ez/CATALOG.md          when to use what + generated API; catalog.json, components.generated.ts are generated
  patterns/              reference pages to copy patterns from (list, detail, form)
  brand/                 mood board, sync procedure, prod screenshots
  mocks/                 shared business objects + factories (seeded)
prototypes/<task>/     meta.json, README.md, v###/{index.vue, mocks.ts, notes.md}
tool/                  the shell, the frame and the proto CLI — not for prototype work
```

Do not modify `blueprint/` while prototyping unless the user asks. If a shared mock concept is reused by several tasks, propose adding it to `blueprint/mocks`.
