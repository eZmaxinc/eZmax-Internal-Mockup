# AGENTS.md — ez-proto

You build **prototypes** of eZsign/eZmax screens: minimal, but indistinguishable in look and structure from production. You compose; you never invent design.

## Golden rules

1. **Compose, don't invent.** Only `ez-` components (`blueprint/ez/CATALOG.md`), semantic tokens (`blueprint/tokens/ez-tokens.css`, semantic layer) and the patterns in `blueprint/patterns/`. No raw colors, no Tailwind palette (`bg-blue-500` doesn't exist here), no `--prim-*`. `proto check` rejects an unknown `ez-` component, prop or value, and flags raw `<button>`, `<input>`, `<table>`.
2. **Two tiers of components.** *Primitives* (`blueprint/ez/primitives/`: `ez-btn`, `ez-card`…) are generic and own the visuals. *Domain components* (`blueprint/ez/domain/<object>/`: `ez-badge-folder-state`, `ez-btn-submit-folder`…) know one business object and only assemble primitives: no colors, borders, shadows or radius of their own. Prefer, in this order: an existing domain component → primitives assembled → **propose** a domain component → (last resort) propose a primitive. A proposal lives in the version (`vNNN/components/EzName.vue`), starts with `<!-- @proposal domain <object>: why -->` and is imported by `index.vue`. Only a human promotes it (`pnpm proto promote`). Never edit `blueprint/ez/` yourself unless asked.
3. **One prototype = one GoodDay task.** Every task folder is `prototypes/<GoodDay number>-<slug>/`, named like the branch (`feature/49198-la-tache` → `49198-la-tache`), with `goodday: { number, url }` in `meta.json`. No number or link? Ask the user. **The task already has a folder** (`proto new` says so, or you find one): stop and tell the user (folder, latest version). Don't start it over; go on only on their instruction (golden rule 4 says where the changes go).
4. **The human marks the versions.** Feedback is applied in place, in the **working version**: the latest version of the task. Create a new version (`pnpm proto iterate`) only when the user asks for one (« nouvelle version », `/iterate-proto`, `/variant-proto`); never on your own. A version is **frozen** when a later one exists, when it is the `chosen` one, or when the task has left `draft` (teammates have looked at it): never edit a frozen version. Feedback on a frozen version: say so and ask whether to create a new one. `proto check` flags an edited frozen version.
5. **One version = one folder, self-contained.** It imports only from `vue`, `@ez`, `@mocks` and its own files. Never `../` into another version.
6. **Data lives in `mocks.ts` as named scenarios** (first = default). Cover at least the main state plus one edge state (empty, error, closed…). Use the business objects from `@mocks` and their methods (`stateLabel()`, `stateTone()`, `isStateClosed()`…).
7. **Keep `notes.md` short.** First line = one-sentence summary: it labels the version in the shell, for the teammates who open it. Then only what must outlive the conversation, and only what is new in this version: « Signalements » and « Questions ouvertes ». No list of changes (`pnpm proto diff` shows them), no list of proposals (the `@proposal` header says why). Nothing to report: the summary alone is a complete `notes.md`.
8. **Run `pnpm proto check <task>` and look at the result before saying you're done.** Fix every ✗. Look at it in the browser: `pnpm proto open <task> <version>` prints the URLs, and says so if the shell is not running; only then start `pnpm dev` in a background terminal. There is one shell, on one port: never start a second one, a new version shows up in the running shell without a restart (`proto new` and `proto iterate` tell it). Open the **Prototype** URL in your browser (Cursor's browser) and size the look to the change:
   - **Quick look** (the default when adjusting, iterating or making a variant): the default scenario, plus the scenario or the width your change touches. One or two page loads, read the page rather than screenshot it when text is enough, fix what looks off.
   - **Full tour** (a first version `v001`, a change of layout or of structure, when the user asks, or before `pnpm proto status <task> review`): every scenario (`?scenario=<name>`), the dark theme (`&theme=dark`) and a narrow width (390 px), compared with the closest pattern.

   Say in your final message which one you did.
9. **Tokens change only on purpose.** Never add a token in a prototype. A new or changed token is an explicit edit of `blueprint/tokens/ez-tokens.css` followed by `pnpm proto tokens bump`, and only when the user asks.
10. **Flat files only.** No database: structured data in JSON (`meta.json`), prose in Markdown, history in git and in the version folders. Change a task's status with `pnpm proto status`, not by hand.

## Read before building

| When | Read |
|---|---|
| Always | `blueprint/brand/brand.md`, `blueprint/ez/CATALOG.md` (when to use what + generated API of components and `@ez` helpers) |
| Using business data | `blueprint/mocks/API.md` (generated: `EzsignFolder`, `EzsignSigner`… their properties and methods, the factories) |
| Building a page | the closest `blueprint/patterns/*/index.vue`: a list → `list-page` (filters above, table in `<ez-card flush>`); a long detail → `detail-page` (`ez-page-sections`, TOC on the right, cards with `toc-id`); edit or create → `edit-form` (`ez-layout` 8/4, right column `first-below-md`, buttons in the summary card `#footer`) |
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

## Signalements
- Bug primitive: ez-dialog déborde à 390 px (contourné ici par la prop width).
- Bug helper: formatRelative ne part pas du même « aujourd'hui » que les mocks.
- Mock manquant: EzsignFolder.daysUntilDue(), calculé localement.

## Questions ouvertes
- …
```

**Something is wrong in `blueprint/`** (a primitive bug, a missing mock method): don't fix it there. Work around it inside the version if needed, and write it under « Signalements » as `Bug primitive: …`, `Bug helper: …`, `Mock manquant: …` or `Composant manquant: …`. `pnpm proto proposals` collects them for the team. For a `Bug primitive` or `Bug helper`, add **the fix you suggest** (which file, what to change, e.g. « `EzMessageImportant.vue`: `flex-wrap` on the container, body `flex: 1 1 14rem` »), so the reviewer only has to validate it; and work around it in the version so the prototype stays presentable.

**Your final message** is the report, said once and briefly: the task, the version, what changed in a few lines, the scenarios, the components you proposed, the « Signalements » and the open questions (or « aucun »). Don't paste `notes.md` into it, and don't repeat what an earlier version already reported. Give the user the **Shell** URL of the version you worked in, never the Prototype one: the Prototype page is for your own checks and stays on the version it was opened at, so a user left on it would not see the next version.

## Workflows

This file is the only place the rules live: `.cursor/rules`, `.cursor/commands` and `.agents/skills` point here. Every workflow ends the same way: golden rule 8 (check, then the browser: a quick look or the full tour), then the final message described above.

**New** (`/new-proto`)
1. Get the GoodDay number and link (ask if either is missing). Use the French title of the GoodDay task. Pick the closest pattern if one fits.
2. `pnpm proto new <number> <link> "<Titre>" [--from <pattern>]`. The task already has a prototype: stop (golden rule 3).
3. The brief is the GoodDay task: `README.md` already links it. Add a « Contraintes » section only for the constraints or the out-of-scope the user stated, in their words; don't paraphrase the request. Ask only if something blocking is missing.
4. Build `v001/index.vue`, `v001/mocks.ts` (at least two scenarios) and `v001/notes.md`.

**Adjust** (the default for any feedback on a prototype): change the working version in place.
1. Identify the task (ask if ambiguous). Read only what the feedback touches in the working version; no need to re-read files you wrote in this conversation.
2. Edit the working version's files. No `proto iterate`. The version is frozen (golden rule 4): stop and ask.
3. Keep its `notes.md` true: fix the summary if it no longer describes the version, add the new « Signalements » and « Questions ouvertes », remove the ones the change settled.

**Iterate** (`/iterate-proto`, or the user asks for a new version): mark a step, then go on in the new version.
1. Identify the task (ask if ambiguous). Read the latest version's `index.vue`, `mocks.ts`, `notes.md`, and the task `README.md`, unless they are already in this conversation.
2. `pnpm proto iterate <task> -m "<one-line summary>"` (`--from vNNN` to start from an older version).
3. Edit only the new folder: apply the feedback, keep everything else identical. Its `notes.md` starts empty of the previous version's reports: write only the new ones.

**Variant** (`/variant-proto`, or the user asks for another approach to compare): an alternative next to a version (`v002` → `v002b`), not a replacement.
1. Read the source version and the task `README.md`.
2. `pnpm proto iterate <task> -m "Variante: <summary>" --variant [--from vNNN]`.
3. Change only what the alternative is about, so the two compare cleanly in the shell (« Comparer avec »). Its summary says what the variant tries; its open question is the one the comparison should answer.

**Export** (`/export-proto`)
1. Identify the task and version (default: the `chosen` version, else the latest).
2. `pnpm proto check <task>`, fix every ✗, then `pnpm proto export <task> [version]`.
3. Report the path, `exports/<task>-<version>.html`: one file, offline, with the scenario switcher.

**Team decision**: `pnpm proto status <task> review|chosen|archived [vNNN]`. Set `chosen` only when the user says which version is retained.

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
- Business logic stays in the mock objects' methods (`folder.isStateClosed()`, `signer.canBeReminded()`), not re-implemented in templates.
- Scenarios are named in kebab-case after the situation (`some-pending`, `all-signed`, `empty`, `error`). Loading is simulated with `setTimeout`.
- Icons through `ez.icons.<key>` (or the key string).
- Utility classes: `block-name || utilities` when a BEM name helps.
- Semantic utilities: `bg-surface`, `bg-background`, `text-foreground`, `text-foreground-muted`, `text-foreground-subtle`, `border-border`, `text-accent`, `bg-surface-warning`, `text-foreground-positive`… (any `--color-*` in the semantic layer). A tinted fill is `surface-{variant}` and the text on it `foreground-{variant}` (`accent`, `positive`, `negative`, `warning`, `info`); the bare name (`positive`) is the solid, for an icon, a dot or an outline.
- Sizes and spaces in a scoped style come from the scales: `--space-gap-*` between things, `--space-inset-*` inside a surface, `--size-control-*` for the height of a button or a field, `--radius-*`. A component knob is read with a step as fallback and never defined: `var(--card-padding, var(--space-inset-lg))`.
- Tailwind layout and spacing utilities are fine (`flex`, `gap-3`, `grid`, `p-4`, `text-sm`, `font-semibold`). Avoid arbitrary pixel values and inline styles: use component props and tokens.
- Dark theme: the same semantic names change value under `.body--dark`, so a prototype that only uses semantic tokens works in both. Never test the theme, never use `dark:`.
- No raw HTML in `index.vue` for something a component should be: propose the component (golden rule 2).
- French copy: no space before a colon (« Statut: Complété »).
- Readable over clever: the team lead prefers simple code.

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
