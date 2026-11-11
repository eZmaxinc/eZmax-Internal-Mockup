<template>
   <span class="ez-badge" :class="[`ez-badge--${tone}`, { 'ez-badge--solid': solid }]">
      <span v-if="dot" class="ez-badge__dot" />
      <slot>{{ label }}</slot>
   </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
   label?: string
   /** Same tone = same meaning everywhere (see brand.md) */
   tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'action'
   dot?: boolean
   /** Filled with the solid color, squarer: the badges of a table in production */
   solid?: boolean
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

.ez-badge--solid {
   border-radius: var(--radius-sm);
   color: var(--color-foreground-inverse);

   &.ez-badge--neutral {
      background: var(--color-foreground-muted);
   }

   &.ez-badge--info,
   &.ez-badge--action {
      background: var(--color-info);
   }

   &.ez-badge--success {
      background: var(--color-positive);
   }

   &.ez-badge--warning {
      background: var(--color-warning);
   }

   &.ez-badge--danger {
      background: var(--color-negative);
   }
}
</style>
