<template>
   <header class="ez-page-header">
      <div class="ez-page-header__inner">
         <ez-btn v-if="cancelable" variant="flat" icon="back" :aria-label="$gettext('Retour')" @click="onCancel" />
         <div class="ez-page-header__titles">
            <div class="ez-page-header__title-row">
               <h1 class="ez-page-header__title">{{ title }}</h1>
               <slot name="meta" />
            </div>
            <nav v-if="breadcrumbs?.length" class="ez-page-header__breadcrumbs" :aria-label="$gettext('Fil d\'Ariane')">
               <template v-for="(theCrumb, index) in breadcrumbs" :key="theCrumb">
                  <ez-icon v-if="index" name="chevronRight" :size="14" />
                  <span :class="{ 'ez-page-header__crumb--current': index === breadcrumbs.length - 1 }">{{ theCrumb }}</span>
               </template>
            </nav>
            <p v-if="subtitle" class="ez-page-header__subtitle">{{ subtitle }}</p>
         </div>
         <div class="ez-page-header__actions">
            <ez-btn v-if="refresh" variant="flat" icon="refresh" :aria-label="$gettext('Actualiser')" @click="onRefresh" />
            <slot name="actions" />
            <ez-btn v-if="button" :variant="buttonVariant" pill :icon="buttonIcon" :label="button" @click="onButton" />
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

function onCancel() {
   emit('cancel')
}

function onRefresh() {
   emit('refresh')
}

function onButton() {
   emit('button')
}
</script>

<style scoped>
@reference "../../../tokens/ez-tokens.css";

/* Sits on the app background, as in production: no band of its own */
.ez-page-header {
   /* Variables first: what the header's look depends on, read below */
   --ez-page-header-padding-top: var(--space-inset-md);
   --ez-page-header-padding-x: var(--inset-page);
   --ez-page-header-gap: var(--space-inset-sm);
   --ez-page-header-color: var(--color-foreground);
   --ez-page-header-muted: var(--color-foreground-muted);
   --ez-page-header-crumbs: var(--color-foreground-accent);

   background: transparent;
}

.ez-page-header__inner {
   display: flex;
   align-items: center;
   gap: var(--ez-page-header-gap);
   max-width: var(--page-max-width);
   margin: 0 auto;
   padding: var(--ez-page-header-padding-top) var(--ez-page-header-padding-x) 0;
}

.ez-page-header__titles {
   flex: 1;
   min-width: 0;
}

.ez-page-header__title-row {
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   gap: var(--space-gap-sm) var(--ez-page-header-gap);
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
   color: var(--ez-page-header-crumbs);
   font-size: var(--text-xs);
}

.ez-page-header__crumb--current {
   color: var(--ez-page-header-color);
}

.ez-page-header__subtitle {
   margin: 2px 0 0;
   color: var(--ez-page-header-muted);
   font-size: var(--text-sm);
}

.ez-page-header__actions {
   display: flex;
   align-items: center;
   gap: var(--space-gap-sm);
   flex-shrink: 0;
}

@media (width < theme(--breakpoint-sm)) {
   .ez-page-header__inner {
      flex-wrap: wrap;
   }

   .ez-page-header__actions {
      width: 100%;
      justify-content: flex-end;
   }
}
</style>
