<template>
   <header class="ez-page-header">
      <div class="ez-page-header__inner">
         <ez-btn v-if="cancelable" variant="flat" icon="back" aria-label="Retour" @click="emit('cancel')" />
         <div class="ez-page-header__titles">
            <div class="ez-page-header__title-row">
               <h1 class="ez-page-header__title">{{ title }}</h1>
               <slot name="meta" />
            </div>
            <nav v-if="breadcrumbs?.length" class="ez-page-header__breadcrumbs" aria-label="Fil d'Ariane">
               <template v-for="(theCrumb, index) in breadcrumbs" :key="theCrumb">
                  <ez-icon v-if="index" name="chevronRight" :size="14" />
                  <span :class="{ 'ez-page-header__crumb--current': index === breadcrumbs.length - 1 }">{{ theCrumb }}</span>
               </template>
            </nav>
            <p v-if="subtitle" class="ez-page-header__subtitle">{{ subtitle }}</p>
         </div>
         <div class="ez-page-header__actions">
            <ez-btn v-if="refresh" variant="flat" icon="refresh" aria-label="Actualiser" @click="emit('refresh')" />
            <slot name="actions" />
            <ez-btn v-if="button" :variant="buttonVariant" pill :icon="buttonIcon" :label="button" @click="emit('button')" />
         </div>
      </div>
   </header>
</template>

<script setup lang="ts">
import EzBtn from '../btn/ez-btn.vue'
import EzIcon from '../icon/ez-icon.vue'
import type { IconName } from '../../icons'

withDefaults(defineProps<{
   title: string
   subtitle?: string
   /** Where the page is, from the home down to this page: ['Accueil', 'Administration', 'Types de dossiers'] */
   breadcrumbs?: string[]
   /** Label of the page's primary action (emits `button`) */
   button?: string
   buttonIcon?: IconName
   /** positive (green): create, save · primary (slate): edit */
   buttonVariant?: 'positive' | 'primary'
   /** Shows the refresh action (emits `refresh`) */
   refresh?: boolean
   /** Shows the back action (emits `cancel`) */
   cancelable?: boolean
}>(), {
   buttonVariant: 'positive',
})

const emit = defineEmits<{
   button: []
   refresh: []
   cancel: []
}>()
</script>

<style scoped>
/* Sits on the app background, as in production: no band of its own */
.ez-page-header {
   background: transparent;
}

.ez-page-header__inner {
   display: flex;
   align-items: center;
   gap: 12px;
   max-width: var(--page-max-width);
   margin: 0 auto;
   padding: 16px var(--inset-page) 0;
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
   font-weight: 500;
}

.ez-page-header__breadcrumbs {
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   gap: 4px;
   margin-top: 2px;
   color: var(--color-foreground-accent);
   font-size: var(--text-xs);
}

.ez-page-header__crumb--current {
   color: var(--color-foreground);
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
