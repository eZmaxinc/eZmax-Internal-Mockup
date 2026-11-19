<template>
   <!-- Private to ez-info. One row per entry, on two columns from md past two rows; without entries, the label and the value -->
   <component :is="as" v-if="theRows.length" class="ez-info-element-list" :class="{ 'ez-info-element-list--two-cols': theRows.length > 2 }">
      <span
         v-for="theRow in theRows"
         :key="theRow.key"
         class="ez-info-element-list__row"
         :class="`ez-info-element-list__row--${infoToneClass(theRow.tone)}`"
      >
         <span v-if="theRow.icons.length" class="ez-info-element-list__badge">
            <ez-icon :name="theRow.icons[0]" :size="12" />
         </span>
         <span class="truncate" :title="theRow.text">{{ theRow.text }}</span>
      </span>
      <ez-tooltip v-if="item.tooltip" class="self-center" :text="item.tooltip">
         <ez-icon name="info" :size="14" class="ez-info-element-list__hint-icon" />
      </ez-tooltip>
   </component>
   <component :is="as" v-else class="ez-info-element-list__plain">
      <span v-if="item.label" class="ez-info-element-list__label">{{ item.label }}</span>
      <span class="ez-info-element-list__value">{{ item.value || '—' }}</span>
   </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { infoToneClass, toInfoEntryViews, type IInfoCategoryItems } from './info'

const props = withDefaults(defineProps<{
   item: IInfoCategoryItems
   /** Renders as another element */
   as?: string
}>(), {
   as: 'div',
})

const theRows = computed(() => (Array.isArray(props.item.value) ? toInfoEntryViews(props.item.value) : []))
</script>

<style scoped>
@reference "../../../tokens/ez-tokens.css";

.ez-info-element-list {
   --ez-info-element-list-gap: var(--space-inset-sm);
   --ez-info-element-list-row-height: var(--size-control-md);

   display: grid;
   grid-template-columns: minmax(0, 1fr);
   align-items: start;
   gap: var(--ez-info-element-list-gap);
}

@media (width >= theme(--breakpoint-md)) {
   .ez-info-element-list--two-cols {
      grid-template-columns: repeat(2, minmax(0, 1fr));
   }
}

/* neutral: the grey of a boxed tile · muted: the same, its text dimmed · positive: the tint; every row keeps the grey border */
.ez-info-element-list__row {
   --ez-info-element-list-surface: color-mix(in srgb, var(--color-foreground-subtle) 4%, var(--color-surface));
   --ez-info-element-list-color: var(--color-foreground);
   --ez-info-element-list-badge: transparent;
   --ez-info-element-list-icon: var(--color-foreground-muted);

   display: flex;
   align-items: center;
   gap: var(--space-inset-sm);
   min-width: 0;
   height: var(--ez-info-element-list-row-height);
   padding: 0 var(--space-inset-sm);
   border: 1px solid color-mix(in srgb, var(--color-foreground-subtle) 15%, transparent);
   border-radius: var(--radius-md);
   background: var(--ez-info-element-list-surface);
   color: var(--ez-info-element-list-color);
   font-size: var(--text-sm);
}

.ez-info-element-list__row--positive {
   --ez-info-element-list-surface: var(--color-surface-positive);
   --ez-info-element-list-color: var(--color-foreground-positive);
   --ez-info-element-list-badge: var(--color-positive);
   --ez-info-element-list-icon: var(--color-foreground-inverse);

   font-weight: 500;
}

.ez-info-element-list__row--muted {
   --ez-info-element-list-color: var(--color-foreground-muted);
   --ez-info-element-list-badge: color-mix(in srgb, var(--color-foreground-subtle) 20%, var(--color-surface));
   --ez-info-element-list-icon: var(--color-foreground-subtle);
}

.ez-info-element-list__badge {
   display: flex;
   flex: none;
   align-items: center;
   justify-content: center;
   width: 1rem;
   aspect-ratio: 1;
   border-radius: var(--radius-full);
   background: var(--ez-info-element-list-badge);
   color: var(--ez-info-element-list-icon);
}

.ez-info-element-list__hint-icon {
   color: var(--color-foreground-subtle);
}

.ez-info-element-list__plain {
   min-width: 0;
}

.ez-info-element-list__label {
   display: block;
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
   font-weight: 500;
}

.ez-info-element-list__value {
   display: block;
   font-size: var(--text-sm);
   font-weight: 500;
}
</style>
