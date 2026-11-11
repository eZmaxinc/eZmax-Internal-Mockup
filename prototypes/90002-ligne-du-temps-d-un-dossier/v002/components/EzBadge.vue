<template>
   <span class="ez-badge" :class="`ez-badge--${tone}`">
      <span v-if="dot" class="ez-badge__dot" />
      <ez-icon v-if="icon" :name="icon" :size="12" />
      <slot>{{ label }}</slot>
   </span>
</template>

<script setup lang="ts">
import type { IconName } from '@ez'

withDefaults(defineProps<{
   label?: string
   /** Same tone = same meaning everywhere (see brand.md) */
   tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'action'
   dot?: boolean
   /** Enhanced here: an icon before the label */
   icon?: IconName
}>(), {
   tone: 'neutral',
})
</script>

<style scoped>
.ez-badge {
   display: inline-flex;
   align-items: center;
   gap: 6px;
   height: 22px;
   padding: 0 8px;
   border-radius: var(--radius-full);
   font-size: var(--text-xs);
   font-weight: 600;
   white-space: nowrap;
}

.ez-badge__dot {
   width: 6px;
   height: 6px;
   border-radius: var(--radius-full);
   background: currentColor;
}

.ez-badge--neutral {
   background: var(--color-border-muted);
   color: var(--color-foreground-muted);
}

.ez-badge--info,
.ez-badge--action {
   background: var(--color-surface-info);
   color: var(--color-foreground-info);
}

.ez-badge--success {
   background: var(--color-surface-positive);
   color: var(--color-foreground-positive);
}

.ez-badge--warning {
   background: var(--color-surface-warning);
   color: var(--color-foreground-warning);
}

.ez-badge--danger {
   background: var(--color-surface-negative);
   color: var(--color-foreground-negative);
}
</style>
