<template>
   <div class="ez-app-shell">
      <div class="ez-app-shell__toolbar" aria-hidden="true" />
      <div class="ez-app-shell__body">
         <div class="ez-app-shell__nav" aria-hidden="true" />
         <main class="ez-app-shell__main">
            <slot />
         </main>
      </div>
   </div>
</template>

<script setup lang="ts">
/**
 * Placeholder frame of the production shell (toolbar + left drawer), empty on purpose:
 * it only gives prototypes their real position and width inside the app.
 */
</script>

<style scoped>
.ez-app-shell {
   min-height: 100vh;
   background: var(--color-background);
}

.ez-app-shell__toolbar {
   position: sticky;
   top: 0;
   z-index: 20;
   height: var(--sizing-toolbar-height);
   background: var(--color-surface-inverse);
}

.ez-app-shell__body {
   display: flex;
}

.ez-app-shell__nav {
   position: sticky;
   top: var(--sizing-toolbar-height);
   flex-shrink: 0;
   width: var(--nav-width);
   height: calc(100vh - var(--sizing-toolbar-height));
   background: var(--color-surface);
   border-right: 1px solid var(--color-border);
}

.ez-app-shell__main {
   flex: 1;
   min-width: 0;
}

@media (width < 64rem) { /* below md: drawer hidden — ⚠ à valider sur la prod */
   .ez-app-shell__nav {
      display: none;
   }
}
</style>
