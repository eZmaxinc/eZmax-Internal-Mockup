---
name: "source-command-export-proto"
description: "Migrated source command `export-proto`"
---

# source-command-export-proto

Use this skill when the user asks to run the migrated source command `export-proto`.

## Command Template

# Export prototype

Export a prototype version as a single interactive HTML file.

1. Identify task and version (default: the `chosen` version, else the latest).
2. Run `pnpm proto check <task>` first; fix every ✗.
3. Run `pnpm proto export <task> [version]`.
4. Report the output path `exports/<task>-<version>.html`. It opens offline in any browser and includes a scenario switcher.
