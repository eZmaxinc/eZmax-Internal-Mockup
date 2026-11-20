<!-- @proposal primitive: production's ez-menu-action-item, one action of a menu (ez-btn-dropdown), with its icon -->
<template>
   <component
      :is="as"
      class="ez-menu-action-item"
      :class="{ 'ez-menu-action-item--separated': separator, 'ez-menu-action-item--danger': danger, 'ez-menu-action-item--active': active }"
      role="menuitem"
      tabindex="-1"
      :aria-disabled="disabled || undefined"
      :aria-current="active || undefined"
      @click="onClick"
      @keydown.enter.prevent="onKeyActivate"
      @keydown.space.prevent="onKeyActivate"
   >
      <ez-icon v-if="icon" class="ez-menu-action-item__icon" :name="icon" :size="20" />
      <span class="ez-menu-action-item__label">
         <slot>{{ label }}</slot>
      </span>
      <ez-icon v-if="active" class="ez-menu-action-item__check" name="check" :size="18" />
   </component>
</template>

<script setup lang="ts">
import type { IconName } from '@ez'

const props = withDefaults(defineProps<{
   label?: string
   icon?: IconName
   /** A line above: starts a new group of actions */
   separator?: boolean
   /** A destructive action, in red */
   danger?: boolean
   /** The current choice of a menu that picks a value (a check on the right) */
   active?: boolean
   disabled?: boolean
   /** Renders as another element (`a`, `router-link`) */
   as?: string | object
}>(), {
   as: 'div',
})

const emit = defineEmits<{
   click: [event: MouseEvent]
}>()

function onClick(event: MouseEvent) {
   if (props.disabled) return
   emit('click', event)
}

/** Enter or Space act like a click, so the menu closes the same way */
function onKeyActivate(event: KeyboardEvent) {
   (event.currentTarget as HTMLElement).click()
}
</script>

<style scoped>
.ez-menu-action-item {
   --ez-menu-action-item-height: var(--size-control-md);
   --ez-menu-action-item-padding-x: var(--space-inset-sm);
   --ez-menu-action-item-gap: var(--space-gap-sm);
   --ez-menu-action-item-color: var(--color-foreground);
   --ez-menu-action-item-icon-color: var(--color-foreground-muted);
   --ez-menu-action-item-hover: var(--color-surface-muted);
   --ez-menu-action-item-radius: var(--radius-sm);

   display: flex;
   align-items: center;
   gap: var(--ez-menu-action-item-gap);
   min-height: var(--ez-menu-action-item-height);
   padding: 0 var(--ez-menu-action-item-padding-x);
   border-radius: var(--ez-menu-action-item-radius);
   color: var(--ez-menu-action-item-color);
   font-size: var(--text-sm);
   text-decoration: none;
   white-space: nowrap;
   cursor: pointer;
   user-select: none;
   transition: background-color 80ms ease-out, color 80ms ease-out;

   &:hover:not([aria-disabled]),
   &:focus-visible {
      background: var(--ez-menu-action-item-hover);
      outline: none;
   }

   &[aria-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
   }
}

.ez-menu-action-item--separated {
   position: relative;
   margin-top: 0.5rem;

   /* The line sits in the gap above the item, out of its hover fill */
   &::before {
      content: '';
      position: absolute;
      top: -0.25rem;
      right: 0;
      left: 0;
      border-top: 1px solid var(--color-border-muted);
   }
}

.ez-menu-action-item--danger {
   --ez-menu-action-item-color: var(--color-foreground-negative);
   --ez-menu-action-item-icon-color: var(--color-negative);
   --ez-menu-action-item-hover: var(--color-surface-negative);
}

.ez-menu-action-item--active {
   --ez-menu-action-item-color: var(--color-foreground-accent);
   --ez-menu-action-item-icon-color: var(--color-foreground-accent);

   font-weight: 600;
}

.ez-menu-action-item__icon {
   flex: none;
   color: var(--ez-menu-action-item-icon-color);
}

.ez-menu-action-item__label {
   flex: 1;
}

.ez-menu-action-item__check {
   flex: none;
   margin-left: var(--space-gap-md);
}

@media (prefers-reduced-motion: reduce) {
   .ez-menu-action-item {
      transition: none;
   }
}
</style>
