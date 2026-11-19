<template>
   <!-- Private to ez-info. Rounded chips: the entries of an item, or the item itself (its label) -->
   <component :is="as" class="ez-info-element-pill">
      <span
         v-for="thePill in thePills"
         :key="thePill.key"
         class="ez-info-element-pill__pill"
         :class="`ez-info-element-pill__pill--${infoToneClass(thePill.tone)}`"
      >
         <span v-for="theIcon in thePill.icons" :key="theIcon" class="ez-info-element-pill__icon">
            <ez-icon :name="theIcon" :size="12" />
         </span>
         <span v-if="thePill.text">{{ thePill.text }}</span>
      </span>
      <ez-tooltip v-if="!hideTooltip && item.tooltip" :text="item.tooltip">
         <ez-icon name="info" :size="14" class="ez-info-element-pill__hint-icon" />
      </ez-tooltip>
   </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { infoToneClass, isInfoValue, toInfoEntryView, toInfoEntryViews, type IInfoCategoryItems, type TInfoEntry } from './info'

const props = withDefaults(defineProps<{
   item: IInfoCategoryItems
   /** The parent already shows the tooltip (a boxed tile) */
   hideTooltip?: boolean
   /** Renders as another element */
   as?: string
}>(), {
   as: 'div',
})

const thePills = computed(() => {
   const value = props.item.value
   if (Array.isArray(value)) return toInfoEntryViews(value)
   // A single value: the pill carries the label of the item, unless the value has its own
   const view = toInfoEntryView(value as TInfoEntry, 0)
   return [{ ...view, text: isInfoValue(value) ? view.text : (props.item.label ?? '') }]
})
</script>

<style scoped>
.ez-info-element-pill {
   --ez-info-element-pill-gap: var(--space-gap-sm);

   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: var(--ez-info-element-pill-gap);
}

/* neutral: the grey of a boxed tile · muted: the same, its text dimmed · positive: the tint, its border at 28 % */
.ez-info-element-pill__pill {
   --ez-info-element-pill-surface: color-mix(in srgb, var(--color-foreground-subtle) 4%, var(--color-surface));
   --ez-info-element-pill-border: color-mix(in srgb, var(--color-foreground-subtle) 15%, transparent);
   --ez-info-element-pill-color: var(--color-foreground);
   --ez-info-element-pill-badge: transparent;
   --ez-info-element-pill-icon: var(--color-foreground-muted);

   display: inline-flex;
   align-items: center;
   gap: var(--space-gap-sm);
   padding: 0.25rem var(--space-inset-sm);
   border: 1px solid var(--ez-info-element-pill-border);
   border-radius: var(--radius-full);
   background: var(--ez-info-element-pill-surface);
   color: var(--ez-info-element-pill-color);
   font-size: var(--text-sm);
}

.ez-info-element-pill__pill--positive {
   --ez-info-element-pill-surface: var(--color-surface-positive);
   --ez-info-element-pill-border: color-mix(in srgb, var(--color-positive) 28%, transparent);
   --ez-info-element-pill-color: var(--color-foreground-positive);
   --ez-info-element-pill-badge: var(--color-positive);
   --ez-info-element-pill-icon: var(--color-foreground-inverse);

   font-weight: 500;
}

.ez-info-element-pill__pill--muted {
   --ez-info-element-pill-color: var(--color-foreground-muted);
   --ez-info-element-pill-badge: color-mix(in srgb, var(--color-foreground-subtle) 20%, var(--color-surface));
   --ez-info-element-pill-icon: var(--color-foreground-subtle);
}

.ez-info-element-pill__icon {
   display: flex;
   align-items: center;
   justify-content: center;
   width: 1rem;
   aspect-ratio: 1;
   border-radius: var(--radius-full);
   background: var(--ez-info-element-pill-badge);
   color: var(--ez-info-element-pill-icon);
}

.ez-info-element-pill__hint-icon {
   color: var(--color-foreground-subtle);
}
</style>
