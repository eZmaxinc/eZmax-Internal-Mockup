# Ce qui vient encore de la prod

Les **tokens** partent maintenant d'ez-proto vers le mono (voir `blueprint/tokens/COPY.md`). Le reste du blueprint s'observe toujours sur la prod et se recopie ici à la main.

## Une seule fois: les vraies couleurs

Les couleurs de `ez-tokens.css` sont provisoires. Relever dans le mono les variables Quasar (`$primary`, `$secondary`, `$positive`, `$negative`, `$warning`, `$info`, `$dark`…, dans `quasar.variables.scss`) et les reporter dans les **primitives** (`--prim-*`) de `blueprint/tokens/ez-tokens.css`. Ne pas toucher aux noms sémantiques. Puis `pnpm proto tokens bump patch -m "Couleurs de la prod"`.

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
