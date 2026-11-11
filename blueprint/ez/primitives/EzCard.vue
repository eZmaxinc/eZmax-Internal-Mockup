<template>
   <section
      :id="tocId"
      class="ez-card"
      :class="{ 'ez-card--flush': flush, 'ez-card--header-only': !$slots.default }"
      :data-toc-title="tocId ? title : undefined"
   >
      <header v-if="title || $slots.actions || $slots.header" class="ez-card__header">
         <slot name="header">
            <div class="ez-card__titles">
               <h3 class="ez-card__title">
                  <ez-icon v-if="icon" :name="icon" class="ez-card__icon" />
                  {{ title }}
               </h3>
               <p v-if="subtitle" class="ez-card__subtitle">{{ subtitle }}</p>
            </div>
         </slot>
         <div v-if="$slots.actions" class="ez-card__actions">
            <slot name="actions" />
         </div>
      </header>
      <div v-if="$slots.default" class="ez-card__body">
         <slot />
      </div>
      <footer v-if="$slots.footer" class="ez-card__footer">
         <slot name="footer" />
      </footer>
   </section>
</template>

<script setup lang="ts">
import EzIcon from './EzIcon.vue'
import type { IconName } from '../icons'

defineProps<{
   title?: string
   subtitle?: string
   icon?: IconName
   /** No body padding — for tables and lists that touch the edges */
   flush?: boolean
   /** Makes this card a sub-entry of the parent ez-page-section in the TOC */
   tocId?: string
}>()
</script>

<style scoped>
/*
 * Self-contained: copies into the mono as is. Needs only ez-tokens.css, EzIcon.vue and icons.ts.
 * Its knob is read here with a scale step as fallback, never defined; a project sets --card-padding (and
 * the app's --sizing-toolbar-height) on :root or a parent only to change it.
 */
.ez-card {
   --_padding: var(--card-padding, var(--space-inset-lg));

   background: var(--color-surface);
   border-radius: var(--radius-sm);
   box-shadow: var(--shadow-card);
   scroll-margin-top: calc(var(--sizing-toolbar-height, 50px) + 16px);
}

@media (width < 37.5rem) { /* below sm */
   .ez-card {
      --_padding: var(--card-padding, var(--space-inset-md));
   }
}

.ez-card__header {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: 12px;
   padding: var(--_padding) var(--_padding) 0;
}

.ez-card--flush .ez-card__header {
   padding-bottom: 12px;
}

.ez-card--header-only .ez-card__header {
   padding-bottom: var(--_padding);
}

.ez-card__title {
   display: flex;
   align-items: center;
   gap: 8px;
   margin: 0;
   font-size: var(--text-lg);
   line-height: var(--text-lg--line-height);
   font-weight: 400;
   color: var(--color-foreground-muted);
}

.ez-card__icon {
   color: var(--color-foreground-muted);
}

.ez-card__subtitle {
   margin: 2px 0 0;
   color: var(--color-foreground-muted);
   font-size: var(--text-sm);
}

.ez-card__actions {
   display: flex;
   gap: 8px;
   flex-shrink: 0;
}

.ez-card__body {
   padding: var(--_padding);
}

.ez-card--flush .ez-card__body {
   padding: 0;
}

.ez-card__footer {
   display: flex;
   justify-content: flex-end;
   gap: 8px;
   padding: 12px var(--_padding);
   border-top: 1px solid var(--color-border-muted);
}
</style>
