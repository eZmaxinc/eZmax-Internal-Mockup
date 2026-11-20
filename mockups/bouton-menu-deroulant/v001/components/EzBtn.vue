<template>
   <component
      :is="as"
      class="ez-btn"
      :href="href"
      :class="[`ez-btn--${variant}`, `ez-btn--${size}`, { 'ez-btn--block': block, 'ez-btn--icon-only': isIconOnly, 'ez-btn--pill': pill, 'ez-btn--outline': outline }]"
      :type="isNativeButton ? type : undefined"
      :disabled="isNativeButton ? isInactive : undefined"
      :aria-disabled="!isNativeButton && isInactive ? true : undefined"
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
   </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { IconName } from '@ez'

const props = withDefaults(defineProps<{
   label?: string
   icon?: IconName
   iconRight?: IconName
   /** positive: the main action of a page (create, save) · primary: the main action of a zone · secondary: default · flat: low emphasis · danger: destructive */
   variant?: 'positive' | 'primary' | 'secondary' | 'flat' | 'danger'
   /** No fill, the outline and the label in the variant's color: a second action of the same meaning beside a filled one (danger is always outlined) */
   outline?: boolean
   /** Rounded ends and uppercase label: the actions of a page header */
   pill?: boolean
   size?: 'md' | 'sm'
   loading?: boolean
   disabled?: boolean
   block?: boolean
   type?: 'button' | 'submit' | 'reset'
   /** Required for icon-only buttons (shown as tooltip) */
   ariaLabel?: string
   /** Renders as another element or component with the same look (`a`, `router-link`) */
   as?: string | object
   /** With as="a": where the link goes */
   href?: string
}>(), {
   as: 'button',
   variant: 'secondary',
   size: 'md',
   type: 'button',
})

const theSlots = useSlots()
const isIconOnly = computed(() => !props.label && !theSlots.default && !!props.icon)
const isNativeButton = computed(() => props.as === 'button')
const isInactive = computed(() => props.disabled || props.loading)
</script>

<style scoped>
/*
 * Self-contained: copies into the mono as is. Needs only ez-tokens.css, ez-icon.vue and icons.ts.
 * Its knobs (--btn-height, --btn-height-sm, --btn-padding-x) are read with a scale step as fallback,
 * never defined; a project sets them on :root or a parent only to change them.
 */
.ez-btn {
   /* Variables first: what the button's look depends on, read below; the variants only change them */
   --ez-btn-height: var(--btn-height, var(--size-control-md));
   --ez-btn-height-sm: var(--btn-height-sm, var(--size-control-sm));
   --ez-btn-padding-x: var(--btn-padding-x, 14px);
   --ez-btn-gap: 6px;
   --ez-btn-radius: var(--radius-md);
   --ez-btn-background: var(--color-surface);
   --ez-btn-border: transparent;
   --ez-btn-color: var(--color-foreground);
   --ez-btn-hover: var(--ez-btn-background);

   /* The variant's tone, read by outline: its border, its label, its hover fill */
   --ez-btn-tone: var(--color-border-strong);
   --ez-btn-tone-color: var(--color-foreground);
   --ez-btn-tone-surface: color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface));

   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: var(--ez-btn-gap);
   height: var(--ez-btn-height);
   padding: 0 var(--ez-btn-padding-x);
   border: 1px solid var(--ez-btn-border);
   border-radius: var(--ez-btn-radius);
   background: var(--ez-btn-background);
   color: var(--ez-btn-color);
   font: inherit;
   font-weight: 600;
   font-size: var(--text-sm);
   white-space: nowrap;
   cursor: pointer;
   transition: background-color 120ms, border-color 120ms, color 120ms;

   text-decoration: none;

   &:hover:not(:disabled, [aria-disabled]) {
      background: var(--ez-btn-hover);
   }

   &:disabled,
   &[aria-disabled] {
      opacity: 0.55;
      cursor: not-allowed;
   }
}

.ez-btn--sm {
   --ez-btn-height: var(--ez-btn-height-sm);
   --ez-btn-padding-x: 10px;

   font-size: var(--text-xs);
}

.ez-btn--icon-only {
   --ez-btn-padding-x: 0px;

   width: var(--ez-btn-height);
}

.ez-btn--block {
   width: 100%;
}

.ez-btn--pill {
   --ez-btn-padding-x: var(--space-inset-lg);
   --ez-btn-radius: var(--radius-full);

   text-transform: uppercase;

   &.ez-btn--icon-only {
      --ez-btn-padding-x: 0px;
   }
}

.ez-btn--positive {
   --ez-btn-background: var(--color-positive);
   --ez-btn-color: var(--color-foreground-inverse);
   --ez-btn-hover: var(--color-foreground-positive);
   --ez-btn-tone: var(--color-positive);
   --ez-btn-tone-color: var(--color-foreground-positive);
   --ez-btn-tone-surface: var(--color-surface-positive);
}

.ez-btn--primary {
   --ez-btn-background: var(--color-accent);
   --ez-btn-color: var(--color-accent-foreground);
   --ez-btn-hover: color-mix(in srgb, var(--color-accent) 85%, var(--color-foreground));
   --ez-btn-tone: var(--color-accent);
   --ez-btn-tone-color: var(--color-foreground-accent);
   --ez-btn-tone-surface: var(--color-surface-accent);
}

.ez-btn--secondary {
   --ez-btn-border: var(--color-border-strong);
   --ez-btn-hover: color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface));
}

.ez-btn--flat {
   --ez-btn-background: transparent;
   --ez-btn-color: var(--color-accent);
   --ez-btn-hover: var(--color-surface-accent);
   --ez-btn-tone: var(--color-accent);
   --ez-btn-tone-color: var(--color-accent);
   --ez-btn-tone-surface: var(--color-surface-accent);
}

/* Outlined, as in production: a destructive action never looks like the main one */
.ez-btn--danger {
   --ez-btn-border: var(--color-negative);
   --ez-btn-color: var(--color-negative);
   --ez-btn-hover: var(--color-surface-negative);
   --ez-btn-tone: var(--color-negative);
   --ez-btn-tone-color: var(--color-negative);
   --ez-btn-tone-surface: var(--color-surface-negative);
}

/* After the variants: it reads their tone and replaces their fill */
.ez-btn--outline {
   --ez-btn-background: transparent;
   --ez-btn-border: var(--ez-btn-tone);
   --ez-btn-color: var(--ez-btn-tone-color);
   --ez-btn-hover: var(--ez-btn-tone-surface);
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
