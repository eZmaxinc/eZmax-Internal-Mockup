<template>
   <ul class="grid gap-2 sm:grid-cols-2">
      <li v-for="theFlag in flags" :key="theFlag.label" class="flag flex items-center gap-2 rounded-sm px-3 py-2 text-sm" :class="{ 'flag--on font-medium': theFlag.on }">
         <ez-icon :name="theFlag.on ? 'success' : 'close'" :size="16" />
         {{ theFlag.label }}
      </li>
   </ul>
</template>

<script setup lang="ts">
import type { Flag } from '../mocks'

defineProps<{ flags: Flag[] }>()
</script>

<style scoped>
.flag {
   --flag-background: var(--color-surface-muted);
   --flag-color: var(--color-foreground-muted);
   /* The same quiet outline as the tiles of this version (EzInfoList, TileBox) */
   --flag-border: color-mix(in srgb, var(--color-border-muted) 50%, var(--color-surface-muted));

   border: 1px solid var(--flag-border);
   background: var(--flag-background);
   color: var(--flag-color);
}

.flag--on {
   --flag-background: var(--color-surface-positive);
   --flag-color: var(--color-foreground-positive);
   /* The fill, a touch stronger: like the outline of a badge */
   --flag-border: color-mix(in srgb, var(--flag-color) 14%, var(--flag-background));
}
</style>
