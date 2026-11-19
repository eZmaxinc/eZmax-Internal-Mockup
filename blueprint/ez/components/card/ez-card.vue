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
               <EzHeading variant="card" class="ez-card__title">
                  <EzIcon v-if="icon" :name="icon" class="ez-card__icon" />
                  {{ title }}
               </EzHeading>
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
import EzHeading from '../heading/ez-heading.vue'
import EzIcon from '../icon/ez-icon.vue'
import type { IconName } from '../../icons'

defineProps<{
   title?: string
   /** A line under the title */
   subtitle?: string
   icon?: IconName
   /** No body padding — for tables and lists that touch the edges */
   flush?: boolean
   /** Makes this card a sub-entry of the parent ez-page-section in the TOC */
   tocId?: string
}>()
</script>

<style scoped>
@reference "../../../tokens/ez-tokens.css";

/*
 * Self-contained: copies into the mono as is. Needs only ez-tokens.css, ez-heading.vue, ez-icon.vue and icons.ts.
 * Its knob is read here with a scale step as fallback, never defined; a project sets --card-padding (and
 * the app's --sizing-toolbar-height) on :root or a parent only to change it.
 */
.ez-card {
   /* Variables first: what the card's look depends on, read below */
   --ez-card-padding: var(--card-padding, var(--space-inset-lg));
   --ez-card-background: var(--color-surface);
   --ez-card-radius: var(--radius-sm);
   --ez-card-shadow: var(--shadow-card);
   --ez-card-muted: var(--color-foreground-muted);
   --ez-card-subtitle: var(--color-foreground-subtle);
   --ez-card-divider: var(--color-border-muted);

   background: var(--ez-card-background);
   border-radius: var(--ez-card-radius);
   box-shadow: var(--ez-card-shadow);
   scroll-margin-top: calc(var(--sizing-toolbar-height, 50px) + var(--space-gap-md));
}

@media (width < theme(--breakpoint-sm)) {
   .ez-card {
      --ez-card-padding: var(--card-padding, var(--space-inset-md));
   }
}

.ez-card__header {
   display: flex;
   align-items: flex-start;
   justify-content: space-between;
   gap: var(--space-inset-sm);
   padding: var(--ez-card-padding) var(--ez-card-padding) 0;
}

.ez-card--flush .ez-card__header {
   padding-bottom: var(--space-inset-sm);
}

.ez-card--header-only .ez-card__header {
   padding-bottom: var(--ez-card-padding);
}

/* The size, weight and color come from ez-heading (variant card); here only the icon beside the text */
.ez-card__title {
   display: flex;
   align-items: center;
   gap: var(--space-gap-sm);
}

.ez-card__icon {
   color: var(--ez-card-muted);
}

.ez-card__titles {
   min-width: 0;
}

.ez-card__subtitle {
   margin: 2px 0 0;
   color: var(--ez-card-subtitle);
   font-size: var(--text-sm);
}

.ez-card__actions {
   display: flex;
   gap: var(--space-gap-sm);
   flex-shrink: 0;
}

.ez-card__body {
   padding: var(--ez-card-padding);
}

.ez-card--flush .ez-card__body {
   padding: 0;
}

.ez-card__footer {
   display: flex;
   justify-content: flex-end;
   gap: var(--space-gap-sm);
   padding: var(--space-inset-sm) var(--ez-card-padding);
   border-top: 1px solid var(--ez-card-divider);
}
</style>
