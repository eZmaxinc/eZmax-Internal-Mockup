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
   /* Variables first: what the badge's look depends on, read below; the tones only change them */
   --ez-badge-height: 22px;
   --ez-badge-padding-x: 8px;
   --ez-badge-radius: var(--radius-full);
   --ez-badge-background: var(--color-border-muted);
   --ez-badge-color: var(--color-foreground-muted);

   display: inline-flex;
   align-items: center;
   gap: 6px;
   height: var(--ez-badge-height);
   padding: 0 var(--ez-badge-padding-x);
   border-radius: var(--ez-badge-radius);
   background: var(--ez-badge-background);
   color: var(--ez-badge-color);
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

.ez-badge--info,
.ez-badge--action {
   --ez-badge-background: var(--color-surface-info);
   --ez-badge-color: var(--color-foreground-info);
}

.ez-badge--success {
   --ez-badge-background: var(--color-surface-positive);
   --ez-badge-color: var(--color-foreground-positive);
}

.ez-badge--warning {
   --ez-badge-background: var(--color-surface-warning);
   --ez-badge-color: var(--color-foreground-warning);
}

.ez-badge--danger {
   --ez-badge-background: var(--color-surface-negative);
   --ez-badge-color: var(--color-foreground-negative);
}

.ez-badge--solid {
   --ez-badge-radius: var(--radius-sm);
   --ez-badge-background: var(--color-foreground-muted);
   --ez-badge-color: var(--color-foreground-inverse);

   &.ez-badge--info,
   &.ez-badge--action {
      --ez-badge-background: var(--color-info);
   }

   &.ez-badge--success {
      --ez-badge-background: var(--color-positive);
   }

   &.ez-badge--warning {
      --ez-badge-background: var(--color-warning);
   }

   &.ez-badge--danger {
      --ez-badge-background: var(--color-negative);
   }
}
</style>
