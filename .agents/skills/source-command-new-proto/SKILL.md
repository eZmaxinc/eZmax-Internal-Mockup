---
name: "source-command-new-proto"
description: "Migrated source command `new-proto`"
---

# source-command-new-proto

Use this skill when the user asks to run the migrated source command `new-proto`.

## Command Template

# New prototype

Create a new prototype task from the user's brief.

1. Read `AGENTS.md`, `blueprint/brand/brand.md` and `blueprint/ez/CATALOG.md`.
2. Every prototype belongs to a GoodDay task. Get its number (`#49198`) and its link (`https://www.goodday.work/t/M2nSjU`) from the user; ask if either is missing. Use the French title of the GoodDay task. Pick the closest pattern (`list-page`, `detail-page`, `edit-form`) if one fits.
3. Run `pnpm proto new <number> <link> "<Titre>" [--from <pattern>]`. It creates `prototypes/<number>-<slug>/`, named like the branch (`feature/<number>-<slug>`).
   If it answers that the task already has a prototype (or you find its folder): **stop**. Tell the user the folder and its latest version, and ask what to do. Never reuse or rewrite its existing versions.
4. Fill `prototypes/<task>/README.md` (the brief) from the user's request (context, what to show, constraints, out of scope). Ask the user only if something blocking is missing.
5. Build `v001/index.vue` and `v001/mocks.ts` (at least two scenarios), then `v001/notes.md`.
6. Run `pnpm proto check <task>` and fix every ✗.
   Look at it in the browser: `pnpm dev` must run in a background terminal; `pnpm proto open <task> <version>` prints the URLs. Open the **Prototype** URL in your browser (Cursor's browser), check every scenario (`?scenario=<name>`), the dark theme (`&theme=dark`) and a narrow width (390 px), compare with the closest pattern, fix what looks off.
7. Report: task id, version, one-line summary, scenarios, « Propositions » and « Signalements » (or « aucun »), open questions.
