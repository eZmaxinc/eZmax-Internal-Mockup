<template>
   <button
      class="ez-btn"
      :class="[`ez-btn--${variant}`, `ez-btn--${size}`, { 'ez-btn--block': block, 'ez-btn--icon-only': isIconOnly }]"
      :type="type"
      :disabled="disabled || loading"
      :aria-busy="loading || undefined"
      :aria-label="isIconOnly ? ariaLabel : undefined"
      :title="isIconOnly ? ariaLabel : undefined"
   >
      <span v-if="loading" class="ez-btn__spinner" />
      <ez-icon v-else-if="icon" :name="icon" :size="size === 'sm' ? 16 : 18" />
      <span v-if="label || $slots.default" class="ez-btn__label">
         <slot>{{ label }}</slot>
      </span>
      <ez-icon v-if="iconRight" :name="iconRight" :size="size === 'sm' ? 16 : 18" />
   </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import EzIcon from './EzIcon.vue'
import type { IconName } from '../icons'

const props = withDefaults(defineProps<{
   label?: string
   icon?: IconName
   iconRight?: IconName
   /** primary: one per zone · secondary: default · flat: low emphasis · danger: destructive */
   variant?: 'primary' | 'secondary' | 'flat' | 'danger'
   size?: 'md' | 'sm'
   loading?: boolean
   disabled?: boolean
   block?: boolean
   type?: 'button' | 'submit' | 'reset'
   /** Required for icon-only buttons (shown as tooltip) */
   ariaLabel?: string
}>(), {
   variant: 'secondary',
   size: 'md',
   type: 'button',
})

const theSlots = useSlots()
const isIconOnly = computed(() => !props.label && !theSlots.default && !!props.icon)
</script>

<style scoped>
.ez-btn {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: 6px;
   height: var(--btn-height);
   padding: 0 var(--btn-padding-x);
   border: 1px solid transparent;
   border-radius: var(--radius-md);
   font: inherit;
   font-weight: 600;
   font-size: var(--text-sm);
   white-space: nowrap;
   cursor: pointer;
   transition: background-color 120ms, border-color 120ms, color 120ms;

   &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
   }
}

.ez-btn--sm {
   height: var(--btn-height-sm);
   padding: 0 10px;
   font-size: var(--text-xs);
}

.ez-btn--icon-only {
   width: var(--btn-height);
   padding: 0;

   &.ez-btn--sm {
      width: var(--btn-height-sm);
   }
}

.ez-btn--block {
   width: 100%;
}

.ez-btn--primary {
   background: var(--color-accent);
   color: var(--color-accent-foreground);

   &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-accent) 85%, var(--color-foreground));
   }
}

.ez-btn--secondary {
   background: var(--color-surface);
   border-color: var(--color-border-strong);
   color: var(--color-foreground);

   &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface));
   }
}

.ez-btn--flat {
   background: transparent;
   color: var(--color-accent);

   &:hover:not(:disabled) {
      background: var(--color-accent-subtle);
   }
}

.ez-btn--danger {
   background: var(--color-negative);
   color: var(--color-foreground-inverse);

   &:hover:not(:disabled) {
      background: var(--color-negative-strong);
   }
}

.ez-btn__spinner {
   width: 14px;
   height: 14px;
   border: 2px solid currentColor;
   border-right-color: transparent;
   border-radius: var(--radius-full);
   animation: ez-spin 700ms linear infinite;
}

@keyframes ez-spin {
   to {
      transform: rotate(360deg);
   }
}
</style>
