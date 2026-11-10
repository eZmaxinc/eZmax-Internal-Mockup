# Ce qui vient encore de la prod

Les **tokens** partent maintenant d'ez-proto vers le mono (voir `blueprint/tokens/COPY.md`). Le reste du blueprint s'observe toujours sur la prod et se recopie ici à la main.

## Une seule fois: les vraies couleurs

Fait dans `ez-tokens` 2.0.0. On n'a pas recopié `quasar.variables.scss`: on en a gardé les couleurs d'ancrage (marquées ◆ dans les primitives de `ez-tokens.css`: charbon, marine, accent, gris de fond, `positive`, `negative`, `warning`, `info`) et dérivé le reste. Ses rampes générées (`$primary-1` à `-9`) et ses variantes sombres en `rgba` ne sont pas reprises. Reste à valider à l'œil, contre des captures de prod: la police, le thème sombre.

## À chaque changement visible en prod

1. **Typo**: police, tailles de texte de base, interlignage. Une police web va dans `blueprint/tokens/` (fichier local, pour que l'export HTML reste autonome).
2. **Icônes**: aligner les clés de `blueprint/ez/icons.ts` sur celles d'`ez.icons` en prod.
3. **Composants**: noms, props, slots et émissions des composants `ez-` de `ezmax-library-quasar`; noter les écarts dans `blueprint/ez/CATALOG.md` (« ⚠ à valider »).
4. **Captures**: rafraîchir `blueprint/brand/screens/`.
5. **Vérifier**: `pnpm dev`, ouvrir la galerie et un patron de `blueprint/patterns/` à côté de la vraie app.
6. Ajouter une ligne au tableau ci-dessous.

## Dernières observations

| Date | Par | Source (commit / version prod) | Ce qui a changé |
|---|---|---|---|
| 2026-11-09 | Claude | ezmax `021e5df` | Breakpoints et rayons repris de `ezmax-library-quasar/src/css/tailwind.css` |
