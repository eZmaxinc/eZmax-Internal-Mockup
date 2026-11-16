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
import EzIcon from '../icon/ez-icon.vue'
import type { IconName } from '../../icons'

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
/*
 * Text and actions share the line while there is room. When there isn't (narrow screen, 4/12 column),
 * the actions wrap below the text instead of crushing it: the body never goes under 14rem.
 */
.ez-message-important {
   display: flex;
   flex-wrap: wrap;
   align-items: flex-start;
   gap: 8px 12px;
   padding: 12px 16px;
   border: 1px solid;
   border-radius: var(--radius-md);
   font-size: var(--text-sm);
}

.ez-message-important__icon {
   margin-top: 1px;
}

.ez-message-important__body {
   flex: 1 1 14rem;
   min-width: 0;
}

.ez-message-important__title {
   margin: 0 0 2px;
   font-weight: 600;
}

/* Right-aligned on the text's line; on their own line when wrapped, still right-aligned, and wrapping between buttons if needed */
.ez-message-important__actions {
   display: flex;
   flex-wrap: wrap;
   justify-content: flex-end;
   gap: 8px;
   max-width: 100%;
   margin-left: auto;
}

.ez-message-important--info {
   background: var(--color-surface-info);
   border-color: color-mix(in srgb, var(--color-info) 25%, transparent);
   color: var(--color-foreground-info);
}

.ez-message-important--success {
   background: var(--color-surface-positive);
   border-color: color-mix(in srgb, var(--color-positive) 25%, transparent);
   color: var(--color-foreground-positive);
}

.ez-message-important--warning {
   background: var(--color-surface-warning);
   border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
   color: var(--color-foreground-warning);
}

.ez-message-important--danger {
   background: var(--color-surface-negative);
   border-color: color-mix(in srgb, var(--color-negative) 25%, transparent);
   color: var(--color-foreground-negative);
}
</style>
