<template>
   <div class="ez-empty-state">
      <span class="ez-empty-state__icon">
         <ez-icon :name="icon" :size="24" />
      </span>
      <p class="ez-empty-state__title">{{ title }}</p>
      <p v-if="text" class="ez-empty-state__text">{{ text }}</p>
      <div v-if="$slots.actions" class="ez-empty-state__actions">
         <slot name="actions" />
      </div>
   </div>
</template>

<script setup lang="ts">
import EzIcon from '../icon/ez-icon.vue'
import type { IconName } from '../../icons'

withDefaults(defineProps<{
   title: string
   text?: string
   icon?: IconName
}>(), {
   icon: 'inbox',
})
</script>

<style scoped>
.ez-empty-state {
   /* Variables first: what the empty state's look depends on, read below */
   --ez-empty-state-padding: 40px var(--space-inset-xl);
   --ez-empty-state-icon-size: 48px;
   --ez-empty-state-icon-surface: var(--color-surface-muted);
   --ez-empty-state-icon-color: var(--color-foreground-subtle);
   --ez-empty-state-text: var(--color-foreground-muted);

   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 4px;
   padding: var(--ez-empty-state-padding);
   text-align: center;
}

.ez-empty-state__icon {
   display: grid;
   place-items: center;
   width: var(--ez-empty-state-icon-size);
   height: var(--ez-empty-state-icon-size);
   margin-bottom: var(--space-gap-sm);
   border-radius: var(--radius-full);
   background: var(--ez-empty-state-icon-surface);
   color: var(--ez-empty-state-icon-color);
}

.ez-empty-state__title {
   margin: 0;
   font-weight: 600;
}

.ez-empty-state__text {
   max-width: 40ch;
   margin: 0;
   color: var(--ez-empty-state-text);
   font-size: var(--text-sm);
}

.ez-empty-state__actions {
   display: flex;
   gap: var(--space-gap-sm);
   margin-top: var(--space-inset-sm);
}
</style>
