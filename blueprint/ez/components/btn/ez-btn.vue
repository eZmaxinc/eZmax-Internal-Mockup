<template>
   <button
      class="ez-btn"
      :class="[`ez-btn--${variant}`, `ez-btn--${size}`, { 'ez-btn--block': block, 'ez-btn--icon-only': isIconOnly, 'ez-btn--pill': pill }]"
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
import EzIcon from '../icon/ez-icon.vue'
import type { IconName } from '../../icons'

const props = withDefaults(defineProps<{
   label?: string
   icon?: IconName
   iconRight?: IconName
   /** positive: the main action of a page (create, save) · primary: the main action of a zone · secondary: default · flat: low emphasis · danger: destructive */
   variant?: 'positive' | 'primary' | 'secondary' | 'flat' | 'danger'
   /** Rounded ends and uppercase label: the actions of a page header */
   pill?: boolean
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
/*
 * Self-contained: copies into the mono as is. Needs only ez-tokens.css, EzIcon.vue and icons.ts.
 * Its knobs are read here with a scale step as fallback, never defined; a project sets --btn-* on :root
 * or a parent only to change them.
 */
.ez-btn {
   --_height: var(--btn-height, var(--size-control-md));
   --_height-sm: var(--btn-height-sm, var(--size-control-sm));
   --_padding-x: var(--btn-padding-x, 14px);

   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: 6px;
   height: var(--_height);
   padding: 0 var(--_padding-x);
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
   height: var(--_height-sm);
   padding: 0 10px;
   font-size: var(--text-xs);
}

.ez-btn--icon-only {
   width: var(--_height);
   padding: 0;

   &.ez-btn--sm {
      width: var(--_height-sm);
   }
}

.ez-btn--block {
   width: 100%;
}

.ez-btn--pill {
   padding: 0 var(--space-inset-lg);
   border-radius: var(--radius-full);
   text-transform: uppercase;

   &.ez-btn--icon-only {
      padding: 0;
   }
}

.ez-btn--positive {
   background: var(--color-positive);
   color: var(--color-foreground-inverse);

   &:hover:not(:disabled) {
      background: var(--color-foreground-positive);
   }
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
      background: var(--color-surface-accent);
   }
}

/* Outlined, as in production: a destructive action never looks like the main one */
.ez-btn--danger {
   background: var(--color-surface);
   border-color: var(--color-negative);
   color: var(--color-negative);

   &:hover:not(:disabled) {
      background: var(--color-surface-negative);
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
