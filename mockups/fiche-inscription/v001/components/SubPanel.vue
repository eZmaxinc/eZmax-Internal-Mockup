<template>
   <div class="sub-panel overflow-hidden">
      <div class="sub-panel__head flex items-center gap-2 px-3 py-1">
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

defineProps<{ title: string; icon?: IconName; count?: number }>()
</script>

<style scoped>
/* The neutral fill and border of the ez-info tiles beside it */
.sub-panel {
   --sub-panel-surface: color-mix(in srgb, var(--color-foreground-subtle) 4%, var(--color-surface));
   --sub-panel-border: color-mix(in srgb, var(--color-foreground-subtle) 15%, transparent);

   border: 1px solid var(--sub-panel-border);
   border-radius: var(--radius-md);
}

.sub-panel__head {
   border-bottom: 1px solid var(--sub-panel-border);
   background: var(--sub-panel-surface);
}
</style>
