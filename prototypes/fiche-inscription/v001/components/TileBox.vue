<template>
   <div class="tile-box flex flex-col gap-1 rounded-sm bg-surface-muted p-3">
      <div v-if="label" class="text-xs text-foreground-muted">{{ label }}</div>
      <slot />
   </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<style scoped>
/* The same outline as the tiles of ez-info-list in this version */
.tile-box {
   border: 1px solid color-mix(in srgb, var(--color-border-muted) 50%, var(--color-surface-muted));
}
</style>
