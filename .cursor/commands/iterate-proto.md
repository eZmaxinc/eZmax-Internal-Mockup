# Iterate prototype

Create the next version of an existing prototype from the user's feedback.

1. Identify the task (ask if ambiguous) and read the latest version's `index.vue`, `mocks.ts`, `notes.md`, plus the task `README.md`.
2. Run `pnpm proto iterate <task> -m "<one-line summary of the change>"` (add `--from vNNN` if the user wants to branch from an older version).
3. Edit **only** the new version folder. Apply the feedback; keep everything else identical.
4. Update the new `notes.md`: changes and open questions.
5. Run `pnpm proto check <task>` and fix every ✗.
   Look at it in the browser: `pnpm dev` must run in a background terminal; `pnpm proto open <task> <version>` prints the URLs. Open the **Prototype** URL in your browser (Cursor's browser), check every scenario (`?scenario=<name>`), the dark theme (`&theme=dark`) and a narrow width (390 px), compare with the closest pattern, fix what looks off.
6. Report the new version id and what changed.
