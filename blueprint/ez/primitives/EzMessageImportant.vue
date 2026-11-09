<template>
   <div class="ez-message-important" :class="`ez-message-important--${type}`" role="status">
      <ez-icon :name="iconByType[type]" class="ez-message-important__icon" />
      <div class="ez-message-important__body">
         <p v-if="title" class="ez-message-important__title">{{ title }}</p>
         <div class="ez-message-important__text"><slot /></div>
      </div>
      <div v-if="$slots.actions" class="ez-message-important__actions">
         <slot name="actions" />
      </div>
   </div>
</template>

<script setup lang="ts">
import EzIcon from './EzIcon.vue'
import type { IconName } from '../icons'

withDefaults(defineProps<{
   type?: 'info' | 'success' | 'warning' | 'danger'
   title?: string
}>(), {
   type: 'info',
})

const iconByType: Record<string, IconName> = {
   info: 'info',
   success: 'success',
   warning: 'warning',
   danger: 'error',
}
</script>

<style scoped>
.ez-message-important {
   display: flex;
   align-items: flex-start;
   gap: 12px;
   padding: 12px 16px;
   border: 1px solid;
   border-radius: var(--radius-md);
   font-size: var(--text-sm);
}

.ez-message-important__icon {
   margin-top: 1px;
}

.ez-message-important__body {
   flex: 1;
   min-width: 0;
}

.ez-message-important__title {
   margin: 0 0 2px;
   font-weight: 600;
}

.ez-message-important__actions {
   display: flex;
   gap: 8px;
   flex-shrink: 0;
}

.ez-message-important--info {
   background: var(--color-info-subtle);
   border-color: color-mix(in srgb, var(--color-info) 25%, transparent);
   color: var(--color-info-strong);
}

.ez-message-important--success {
   background: var(--color-positive-subtle);
   border-color: color-mix(in srgb, var(--color-positive) 25%, transparent);
   color: var(--color-positive-strong);
}

.ez-message-important--warning {
   background: var(--color-warning-subtle);
   border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
   color: var(--color-warning-strong);
}

.ez-message-important--danger {
   background: var(--color-negative-subtle);
   border-color: color-mix(in srgb, var(--color-negative) 25%, transparent);
   color: var(--color-negative-strong);
}
</style>
