# Export prototype

Export a prototype version as a single interactive HTML file.

1. Identify task and version (default: the `chosen` version, else the latest).
2. Run `pnpm proto check <task>` first; fix every ✗.
3. Run `pnpm proto export <task> [version]`.
4. Report the output path `exports/<task>-<version>.html`. It opens offline in any browser and includes a scenario switcher.
