<template>
   <div class="sub-panel overflow-hidden rounded-sm">
      <div class="sub-panel__head flex items-center gap-2 bg-surface-muted px-3 py-1">
         <span v-if="icon" class="text-foreground-muted"><ez-icon :name="icon" :size="16" /></span>
         <span class="flex flex-1 items-center gap-2 py-1 text-sm font-semibold">
            {{ title }}
            <ez-badge v-if="count !== undefined" tone="action" :label="String(count)" />
         </span>
         <slot name="actions" />
      </div>
      <slot />
   </div>
</template>

<script setup lang="ts">
import type { IconName } from '@ez'
import EzBadge from './EzBadge.vue'

defineProps<{ title: string; icon?: IconName; count?: number }>()
</script>

<style scoped>
/* The same quiet outline as the tiles of this version (EzInfoList, TileBox) */
.sub-panel {
   --sub-panel-border: color-mix(in srgb, var(--color-border-muted) 50%, var(--color-surface-muted));

   border: 1px solid var(--sub-panel-border);
}

.sub-panel__head {
   border-bottom: 1px solid var(--sub-panel-border);
}
</style>
