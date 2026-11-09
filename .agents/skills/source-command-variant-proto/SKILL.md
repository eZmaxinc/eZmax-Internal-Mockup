---
name: "source-command-variant-proto"
description: "Migrated source command `variant-proto`"
---

# source-command-variant-proto

Use this skill when the user asks to run the migrated source command `variant-proto`.

## Command Template

# Variant prototype

Explore an alternative next to an existing version (e.g. v002 → v002b) without replacing it.

1. Read the source version and the task `README.md`.
2. Run `pnpm proto iterate <task> -m "Variante: <summary>" --variant [--from vNNN]`.
3. Change only what the alternative is about, so the two versions compare cleanly in the shell (« Comparer avec »).
4. Notes: say what this variant tries and what question it should answer.
5. `pnpm proto check <task>`, fix every ✗, report.
   Look at it in the browser: `pnpm dev` must run in a background terminal; `pnpm proto open <task> <version>` prints the URLs. Open the **Prototype** URL in your browser (Cursor's browser), check every scenario (`?scenario=<name>`), the dark theme (`&theme=dark`) and a narrow width (390 px), compare with the closest pattern, fix what looks off.
