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
import EzIcon from './EzIcon.vue'
import type { IconName } from '../icons'

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
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 4px;
   padding: 40px 24px;
   text-align: center;
}

.ez-empty-state__icon {
   display: grid;
   place-items: center;
   width: 48px;
   height: 48px;
   margin-bottom: 8px;
   border-radius: var(--radius-full);
   background: var(--color-surface-muted);
   color: var(--color-foreground-subtle);
}

.ez-empty-state__title {
   margin: 0;
   font-weight: 600;
}

.ez-empty-state__text {
   max-width: 40ch;
   margin: 0;
   color: var(--color-foreground-muted);
   font-size: var(--text-sm);
}

.ez-empty-state__actions {
   display: flex;
   gap: 8px;
   margin-top: 12px;
}
</style>
