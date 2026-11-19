<template>
   <!-- Private to ez-info. A group of items framed by a border, no fill, its title inside: tinted when positive -->
   <component :is="as" class="ez-info-item-group" :class="{ 'ez-info-item-group--positive': tone === 'positive' }">
      <ez-heading v-if="title" variant="group" class="ez-info-item-group__title">
         <ez-icon v-if="icon" :name="icon" :size="16" />
         {{ title }}
      </ez-heading>
      <slot />
   </component>
</template>

<script setup lang="ts">
import type { IconName } from '../../icons'
import type { TInfoTone } from './info'

withDefaults(defineProps<{
   /** positive tints the border; any other tone keeps the grey one */
   tone?: TInfoTone
   title?: string
   icon?: IconName
   /** Renders as another element (fieldset, section…) */
   as?: string
}>(), {
   tone: 'neutral',
   as: 'div',
})
</script>

<style scoped>
.ez-info-item-group {
   --ez-info-item-group-border: color-mix(in srgb, var(--color-foreground-subtle) 15%, transparent);
   --ez-info-item-group-radius: var(--radius-md);
   --ez-info-item-group-padding: var(--space-inset-sm);

   min-width: 0;
   padding: var(--ez-info-item-group-padding);
   border: 1px solid var(--ez-info-item-group-border);
   border-radius: var(--ez-info-item-group-radius);
}

/* As production: the positive color at 28 % */
.ez-info-item-group--positive {
   --ez-info-item-group-border: color-mix(in srgb, var(--color-positive) 28%, transparent);
}

.ez-info-item-group__title {
   display: flex;
   align-items: center;
   gap: 0.375rem;
   margin-bottom: var(--space-gap-sm);
}
</style>
