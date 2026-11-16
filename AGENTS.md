# AGENTS.md — ez-proto

You build **prototypes** of eZsign/eZmax screens, fast: existing screens look like production, and a new interface looks like it belongs to the same product. You reuse what exists and invent only what doesn't.

## Golden rules

1. **Reuse what exists, invent the rest in the same family.** What exists is mandatory: an `ez-` component whenever one does the job (`blueprint/ez/CATALOG.md`), semantic tokens for every color (`blueprint/tokens/ez-tokens.css`, semantic layer), the scales for sizes and spaces, a pattern from `blueprint/patterns/` when the page is a list, a detail or a form. What doesn't exist, you build: a new interface (a timeline, a board, a canvas, a wizard…) is plain HTML, utilities and a scoped style in the version, made only of tokens. Never rebuild by hand something an `ez-` component already is (a button, a field, a table, a card, a badge, a dialog…). No raw colors, no Tailwind palette (`bg-blue-500` doesn't exist here), no `--prim-*`. `proto check` rejects a raw color, an unknown `ez-` component, prop or value, and a raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<table>`.
2. **Create or enhance in the version; the human syncs the app.** Everything you add lives in `vNNN/components/`, imported by `index.vue`, free in its markup and style (tokens only), with no header and no ceremony. *Create*: a piece that is big or used twice (`FolderTimeline.vue`). *Enhance*: an existing `ez-` component that lacks something (a prop, a slot, a state): copy its file from `blueprint/ez/` into `components/` under the same name (`EzCard.vue`), change the copy, import it; in that version it replaces the original. *Suggest*, optional, when a generic piece (no business object) would clearly serve other tasks: name it `Ez…` and start it with `<!-- @proposal primitive: why -->`. A business component (it knows a folder, a signer…) is never proposed: keep it local and write `Composant métier manquant: …` under « Signalements »; it gets built in the app. None of this blocks or slows the prototype: `yarn proto proposals` finds what was created, enhanced and suggested by itself, and a human decides what goes into `blueprint/ez/` (`yarn proto promote`) and into the app. Never edit `blueprint/ez/` yourself unless asked.
3. **One prototype = one task.** Every task folder is `prototypes/<slug>/`, a slug of its French title (`relance-signataires`), never a number. GoodDay is a nice to have: when the user gives a number or a link, pass it to `proto new` and it is kept in `meta.json` (`goodday`); otherwise don't ask for it, the task lives without it. **The task already has a folder** (`proto new` says so, or you find one): stop and tell the user (folder, latest version). Don't start it over; go on only on their instruction (golden rule 4 says where the changes go).
4. **The human marks the versions.** Feedback is applied in place, in the **working version**: the latest version of the task. Create a new version (`yarn proto iterate`) only when the user asks for one (« nouvelle version », `/iterate-proto`, `/variant-proto`); never on your own. A version is **frozen** when a later one exists, when it is the `chosen` one, or when the task has left `draft` (teammates have looked at it): never edit a frozen version. Feedback on a frozen version: say so and ask whether to create a new one. `proto check` flags an edited frozen version.
5. **One version = one folder, self-contained.** It imports only from `vue`, `@ez`, `@mocks` and its own files. Never `../` into another version.
6. **Data lives in `mocks.ts` as named scenarios** (first = default). Cover at least the main state plus one edge state (empty, error, closed…). Use the business objects from `@mocks` and their methods (`stateLabel()`, `stateTone()`, `isStateClosed()`…).
7. **Keep `notes.md` short.** First line = one-sentence summary: it labels the version in the shell, for the teammates who open it. Then only what must outlive the conversation, and only what is new in this version: « Signalements » and « Questions ouvertes ». No list of changes (`yarn proto diff` shows them), no list of proposals (the `@proposal` header says why). Nothing to report: the summary alone is a complete `notes.md`.
8. **Check every time, look in the browser only when it pays.** Run `yarn proto check <task>` before saying you're done, and fix every ✗: it is the conformity gate, and it is fast. The browser is the user's: they watch the **Shell** (the versions and the dev bar around the prototype), and see your change as you save. So:
   - **Adjusting** (the default): check, then stop. No browser.
   - **A new version** (`v001`, an iteration, a variant): check, then load its Shell URL once and read the page (no screenshot) to confirm the default scenario renders. Fix what is broken.
   - **Full tour**, only when the user asks or before `yarn proto status <task> review`: every scenario (`?scenario=<name>`), the dark theme (`&theme=dark`) and a narrow width (`&width=mobile`, 390 px).

   `yarn proto open <task> <version>` prints the Shell URL, and says so if the shell is not running; only then start `yarn dev` in a background terminal. There is one shell, on one port: never start a second one, a new version shows up in the running shell without a restart. Never open `frame.html` yourself. Drive the shell by its address, no clicking in the dev bar: `?scenario=<name>&theme=dark&width=mobile` (or `tablet`, `desktop`); a parameter left out is the default. A new version says « Introuvable »: the shell missed it, tell the user instead of touching `tool/` or starting a second server.
9. **Tokens change only on purpose.** Never add a token in a prototype. A new or changed token is an explicit edit of `blueprint/tokens/ez-tokens.css` followed by `yarn proto tokens bump`, and only when the user asks.
10. **Flat files only.** No database: structured data in JSON (`meta.json`), prose in Markdown, history in git and in the version folders. Change a task's status with `yarn proto status`, not by hand.

## Read before building

| When | Read |
|---|---|
| Always | `blueprint/brand/brand.md`, `blueprint/ez/CATALOG.md` (when to use what + generated API of components and `@ez` helpers) |
| Using business data | `blueprint/mocks/API.md` (generated: `EzsignFolder`, `EzsignSigner`… their properties and methods, the factories) |
| Building a page | the closest `blueprint/patterns/*/index.vue`: a list → `list-page` (one titled card: filters, then the table); a long detail → `detail-page` (`ez-page-sections`, TOC on the right, cards with `toc-id`); edit or create → `edit-form` (`ez-layout` 8/4, right column `first-below-md`, buttons in the summary card `#footer`) |
| Building something no component covers | the semantic layer of `blueprint/tokens/ez-tokens.css` (the names of the colors, spaces, sizes and radii your scoped style may use) |
| Starting a task | `prototypes/<task>/README.md`, when there is one (the constraints given with the request) |
| Iterating | the source version's `index.vue`, `mocks.ts`, `notes.md` |

That is enough to build. **Don't read `tool/`** (the CLI explains itself: `yarn proto help`) **nor the source of `blueprint/ez` or `blueprint/mocks`**: the catalog and `API.md` are generated from it. The one exception is the file of a component you are enhancing (golden rule 2), which you copy.

## Starter: a version in three files

`yarn proto new` (or `iterate`) creates them; this is the shape to aim for.

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
                  <ez-badge :tone="row.stateTone()" :label="row.stateLabel()" />
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

**Something is wrong in `blueprint/`**: don't fix it there. A component that is wrong or lacks something: enhance it in the version (golden rule 2), the copy is the suggested fix. A helper or a mock that is wrong or missing: work around it in the version and write one line under « Signalements » (`Bug helper: …`, `Mock manquant: …`). `yarn proto proposals` collects both for the team.

**Your final message** is the report, said once and briefly: the task, the version, what changed in a few lines, the scenarios, one line naming the components you created, enhanced or suggested (or none), the « Signalements » and the open questions (or « aucun »). Don't paste `notes.md` into it, and don't repeat what an earlier version already reported. Give the user the **Shell** URL of the version you worked in, without parameters.

## Workflows

This file is the only place the rules live: `.cursor/rules`, `.cursor/commands` and `.agents/skills` point here. Every workflow ends the same way: golden rule 8 (check; the browser only as it says), then the final message described above.

**New** (`/new-proto`)
1. Pick a short French title for the task (the GoodDay title when there is one) and the closest pattern if one fits.
2. `yarn proto new "<Titre>" [<GoodDay number>] [<GoodDay link>] [--from <pattern>] [--slug <short-name>]`: the GoodDay number and link only when the user gave them. The task already has a prototype: stop (golden rule 3).
3. The brief is the user's request (and the GoodDay task, when there is one: its title and link are in `meta.json`, nothing to copy). Only when the user stated constraints or an out-of-scope, write them in `prototypes/<task>/README.md`, in their words: a list, no title, no link, no paraphrase of the request. No constraints: no `README.md`. Ask only if something blocking is missing.
4. Build `v001/index.vue`, `v001/mocks.ts` (at least two scenarios) and `v001/notes.md`: the smallest screen that answers the task, not every idea around it. Don't read other prototypes to get started: the catalog, the patterns and the starter below are the references.

**Adjust** (the default for any feedback on a prototype): change the working version in place.
1. Identify the task (ask if ambiguous). Read only what the feedback touches in the working version; no need to re-read files you wrote in this conversation.
2. Edit the working version's files. No `proto iterate`. The version is frozen (golden rule 4): stop and ask.
3. Keep its `notes.md` true: fix the summary if it no longer describes the version, add the new « Signalements » and « Questions ouvertes », remove the ones the change settled.

**Iterate** (`/iterate-proto`, or the user asks for a new version): mark a step, then go on in the new version.
1. Identify the task (ask if ambiguous). Read the latest version's `index.vue`, `mocks.ts`, `notes.md`, and the task `README.md` if there is one, unless they are already in this conversation.
2. `yarn proto iterate <task> -m "<one-line summary>"` (`--from vNNN` to start from an older version).
3. Edit only the new folder: apply the feedback, keep everything else identical. Its `notes.md` starts empty of the previous version's reports: write only the new ones.

**Variant** (`/variant-proto`, or the user asks for another approach to compare): an alternative to a version, not a replacement. Versions stay linear (`v001`, `v002`, `v003`…, no letters): a variant is simply the next version, and its `based_on` says which one it starts from.
1. Read the source version, and the task `README.md` if there is one.
2. `yarn proto iterate <task> -m "Variante: <summary>" [--from vNNN]` (default source: the latest version).
3. Change only what the alternative is about, so the two compare cleanly in the shell (« Comparer avec »). Its summary says what the variant tries; its open question is the one the comparison should answer.

**Export** (`/export-proto`)
1. Identify the task and version (default: the `chosen` version, else the latest).
2. `yarn proto check <task>`, fix every ✗, then `yarn proto export <task> [version]`.
3. Report the path, `exports/<task>-<version>.html`: one file, offline, with the scenario switcher.

**Team decision**: the human retains a version themselves, in the shell: the star (☆) on the line of the version, in the left panel. The status of the task is changed there too, by a click on it. Don't do it for them, and don't spend a turn on it. `yarn proto status <task> review|chosen|archived [vNNN]` is for the other statuses, or when the user asks you to; set `chosen` only when the user says which version is retained.

## Commands

One CLI, `yarn proto` (`yarn proto help` for everything). In a non-interactive shell it never prompts: pass every argument.

```bash
yarn proto new "Titre"                                   # new task + v001 (blank), in prototypes/titre/
yarn proto new "Titre" --from detail-page
yarn proto new "Titre" 49198 https://www.goodday.work/t/M2nSjU   # GoodDay, when known: kept in meta.json
yarn proto iterate <task> -m "Résumé"                    # next version from the latest
yarn proto iterate <task> -m "Résumé" --from v001        # from an older version
yarn proto iterate <task> -m "Variante: Résumé" --from v001   # a variant is the next version too
yarn proto status <task> review|chosen|archived [vNNN]   # team decision, in meta.json
yarn proto list [--status review] [--mine] [--all]
yarn proto diff <task> [v001] [v002]
yarn proto check [task]                                  # rules + types
yarn proto export <task> [version]                       # → exports/<task>-<version>.html
yarn proto proposals                                     # components proposed in prototypes, most requested first
yarn proto catalog                                       # regenerate the catalog after a change in blueprint/ez (only when asked)
yarn proto tokens [bump patch|minor|major -m "…"]         # shared tokens: version, changelog (only when asked)
yarn proto open [task] [version]                         # shell on http://localhost:5180
```

`<task>` accepts the folder name or a unique part of it, and the GoodDay number (`49198` or `#49198`) or link when the task has one.

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
- Raw HTML in a version is for what no `ez-` component covers (golden rule 1); a piece worth sharing becomes a proposal (golden rule 2).
- French copy: no space before a colon (« Statut: Complété »).
- Readable over clever: the team lead prefers simple code.

## Repository map

```
blueprint/             the UI blueprint, what ez-proto maintains
  tokens/                ez-tokens.css (primitives → semantics, the source copied into the mono),
                         components.css (ez- knobs), CHANGELOG.md, COPY.md
  ez/primitives/         generic ez- components (own the visuals)
  ez/domain/<object>/    mirror of the app's business components, never proposed here (empty for now)
  ez/CATALOG.md          when to use what + generated API; catalog.json, components.generated.ts are generated
  patterns/              reference pages to copy patterns from (list, detail, form)
  brand/                 mood board, sync procedure, prod screenshots
  mocks/                 shared business objects + factories (seeded)
prototypes/<task>/     meta.json, v###/{index.vue, mocks.ts, notes.md}, README.md only for stated constraints
tool/                  the shell, the frame and the proto CLI — not for prototype work
```

Do not modify `blueprint/` while prototyping unless the user asks. If a shared mock concept is reused by several tasks, propose adding it to `blueprint/mocks`.
