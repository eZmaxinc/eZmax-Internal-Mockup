<template>
   <!-- Private to ez-info. The grey tile: a label and its value, a count boxed on the right, or pills -->
   <component
      :is="as"
      class="ez-info-element-boxed"
      :class="{
         'ez-info-element-boxed--metric': theMetric,
         'ez-info-element-boxed--grows': hasEntries || item.hint || item.valueStyle,
         'ez-info-element-boxed--link': item.onClick,
      }"
      :role="item.onClick ? 'button' : undefined"
      :tabindex="item.onClick ? 0 : undefined"
      @click="onClick"
      @keydown.enter="onClick"
   >
      <div v-if="item.label || item.tooltip" class="ez-info-element-boxed__head">
         <span v-if="item.label" class="ez-info-element-boxed__label" :title="item.label">{{ item.label }}</span>
         <ez-tooltip v-if="item.tooltip" :text="item.tooltip">
            <ez-icon name="info" :size="14" class="ez-info-element-boxed__hint-icon" />
         </ez-tooltip>
      </div>

      <InfoElementPill v-if="hasEntries" :item="item" hide-tooltip />

      <div v-else-if="theMetric" class="ez-info-element-boxed__metric">
         <strong>{{ theMetric.amount }}</strong>
         <span v-if="theMetric.unit">{{ theMetric.unit }}</span>
      </div>

      <div v-else class="ez-info-element-boxed__body">
         <p class="ez-info-element-boxed__value" :style="item.valueStyle">
            <span class="truncate" :title="String(item.value ?? '')">{{ item.value || '—' }}</span>
            <ez-icon v-if="item.onClick" name="chevronRight" :size="14" />
         </p>
         <p v-if="item.hint" class="ez-info-element-boxed__hint">{{ item.hint }}</p>
      </div>
   </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InfoElementPill from './info-element-pill.vue'
import { isInfoMetric, type IInfoCategoryItems } from './info'

const props = withDefaults(defineProps<{
   item: IInfoCategoryItems
   /** Renders as another element */
   as?: string
}>(), {
   as: 'div',
})

const hasEntries = computed(() => Array.isArray(props.item.value) && props.item.value.length > 0)
const theMetric = computed(() => (isInfoMetric(props.item.value) ? props.item.value : undefined))

function onClick() {
   props.item.onClick?.()
}
</script>

<style scoped>
.ez-info-element-boxed {
   /* Neutral greys, as production (#B8B8B8 at 8 % and 28 % on white: #f9f9f9, #ebebeb), from the neutral subtle text color */
   --ez-info-element-boxed-height: 3.625rem;
   /* The box of a count: one width for every tile, so the counts line up from tile to tile (« utilisateurs » fits) */
   --ez-info-element-boxed-metric-width: 5rem;
   --ez-info-element-boxed-metric-shadow: var(--shadow-raised);
   --ez-info-element-boxed-surface: color-mix(in srgb, var(--color-foreground-subtle) 4%, var(--color-surface));
   --ez-info-element-boxed-surface-hover: color-mix(in srgb, var(--color-foreground-subtle) 8%, var(--color-surface));
   --ez-info-element-boxed-border: color-mix(in srgb, var(--color-foreground-subtle) 15%, transparent);
   --ez-info-element-boxed-radius: var(--radius-md);
   --ez-info-element-boxed-label: var(--color-foreground-muted);
   --ez-info-element-boxed-value: var(--color-foreground);

   display: flex;
   flex-direction: column;
   gap: 0.125rem;
   min-width: 0;
   height: var(--ez-info-element-boxed-height);
   padding: var(--space-gap-sm) var(--space-inset-sm);
   border: 1px solid var(--ez-info-element-boxed-border);
   border-radius: var(--ez-info-element-boxed-radius);
   background: var(--ez-info-element-boxed-surface);
}

/* Pills, a hint or a styled value: the tile grows, and its row with it */
.ez-info-element-boxed--grows {
   height: 100%;
   min-height: var(--ez-info-element-boxed-height);
}

/* A link: the value in the accent color; on hover, only the fill darkens */
.ez-info-element-boxed--link {
   --ez-info-element-boxed-value: var(--color-accent);

   cursor: pointer;

   &:hover {
      --ez-info-element-boxed-surface: var(--ez-info-element-boxed-surface-hover);
   }

   &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
   }
}

.ez-info-element-boxed__head {
   display: flex;
   align-items: flex-start;
   gap: 0.375rem;
   min-width: 0;
}

.ez-info-element-boxed__label {
   min-width: 0;
   overflow: hidden;
   color: var(--ez-info-element-boxed-label);
   font-size: var(--text-xs);
   line-height: 1.375;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.ez-info-element-boxed__hint-icon {
   color: var(--color-foreground-subtle);
}

.ez-info-element-boxed__body {
   min-width: 0;
   margin-top: auto;
}

.ez-info-element-boxed__value {
   display: inline-flex;
   align-items: center;
   gap: 0.25rem;
   max-width: 100%;
   margin: 0;
   color: var(--ez-info-element-boxed-value);
   font-size: var(--text-sm);
   font-weight: 500;
   line-height: 1.25;
}

.ez-info-element-boxed__hint {
   margin: 0.125rem 0 0;
   color: var(--color-foreground-subtle);
   font-size: var(--text-xs);
}

/* A count: the label on the left, the number and its unit boxed on the right */
.ez-info-element-boxed--metric {
   flex-direction: row;
   align-items: stretch;
   justify-content: space-between;
   gap: var(--space-gap-md);
   padding: 0.375rem 0.375rem 0.375rem var(--space-inset-sm);

   .ez-info-element-boxed__head {
      flex: 1;
      align-items: center;
   }

   .ez-info-element-boxed__label {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      white-space: normal;
   }
}

.ez-info-element-boxed__metric {
   display: flex;
   flex: none;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   width: var(--ez-info-element-boxed-metric-width);
   padding: 0 0.25rem;
   border-radius: var(--ez-info-element-boxed-radius);
   background: var(--color-surface);
   box-shadow: var(--ez-info-element-boxed-metric-shadow);
   color: var(--color-foreground);
   line-height: 1;

   strong {
      font-size: var(--text-sm);
      font-weight: 600;
   }

   /* Cut when too long: a line box tall enough that a descender (the g of « groupe ») is not cut with it */
   strong,
   span {
      max-width: 100%;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
   }

   span {
      font-size: var(--text-xs);
   }
}
</style>
