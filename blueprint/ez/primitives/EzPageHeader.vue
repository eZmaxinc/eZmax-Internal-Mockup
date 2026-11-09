<template>
   <header class="ez-page-header">
      <div class="ez-page-header__inner">
         <ez-btn v-if="cancelable" variant="flat" icon="back" aria-label="Retour" @click="emit('cancel')" />
         <div class="ez-page-header__titles">
            <div class="ez-page-header__title-row">
               <h1 class="ez-page-header__title">{{ title }}</h1>
               <slot name="meta" />
            </div>
            <p v-if="subtitle" class="ez-page-header__subtitle">{{ subtitle }}</p>
         </div>
         <div class="ez-page-header__actions">
            <ez-btn v-if="refresh" variant="flat" icon="refresh" aria-label="Actualiser" @click="emit('refresh')" />
            <slot name="actions" />
            <ez-btn v-if="button" variant="primary" :icon="buttonIcon" :label="button" @click="emit('button')" />
         </div>
      </div>
   </header>
</template>

<script setup lang="ts">
import EzBtn from './EzBtn.vue'
import type { IconName } from '../icons'

defineProps<{
   title: string
   subtitle?: string
   /** Label of the page's primary action (emits `button`) */
   button?: string
   buttonIcon?: IconName
   /** Shows the refresh action (emits `refresh`) */
   refresh?: boolean
   /** Shows the back action (emits `cancel`) */
   cancelable?: boolean
}>()

const emit = defineEmits<{
   button: []
   refresh: []
   cancel: []
}>()
</script>

<style scoped>
.ez-page-header {
   background: var(--color-surface);
   border-bottom: 1px solid var(--color-border);
}

.ez-page-header__inner {
   display: flex;
   align-items: center;
   gap: 12px;
   max-width: var(--page-max-width);
   margin: 0 auto;
   padding: 16px var(--inset-page);
}

.ez-page-header__titles {
   flex: 1;
   min-width: 0;
}

.ez-page-header__title-row {
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   gap: 8px 12px;
}

.ez-page-header__title {
   margin: 0;
   font-size: var(--text-xl);
   line-height: var(--text-xl--line-height);
   font-weight: 700;
}

.ez-page-header__subtitle {
   margin: 2px 0 0;
   color: var(--color-foreground-muted);
   font-size: var(--text-sm);
}

.ez-page-header__actions {
   display: flex;
   align-items: center;
   gap: 8px;
   flex-shrink: 0;
}

@media (width < 37.5rem) { /* below sm */
   .ez-page-header__inner {
      flex-wrap: wrap;
   }

   .ez-page-header__actions {
      width: 100%;
      justify-content: flex-end;
   }
}
</style>
