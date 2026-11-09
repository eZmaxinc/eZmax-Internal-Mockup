<template>
   <span class="ez-badge" :class="`ez-badge--${tone}`">
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
   background: var(--color-border-subtle);
   color: var(--color-foreground-muted);
}

.ez-badge--info,
.ez-badge--action {
   background: var(--color-info-subtle);
   color: var(--color-info-strong);
}

.ez-badge--success {
   background: var(--color-positive-subtle);
   color: var(--color-positive-strong);
}

.ez-badge--warning {
   background: var(--color-warning-subtle);
   color: var(--color-warning-strong);
}

.ez-badge--danger {
   background: var(--color-negative-subtle);
   color: var(--color-negative-strong);
}
</style>
