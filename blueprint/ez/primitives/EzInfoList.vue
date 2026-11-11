<template>
   <dl class="ez-info-list" :class="{ 'ez-info-list--inline': inline, 'ez-info-list--tiles': tiles }">
      <div v-for="theItem in items" :key="theItem.label" class="ez-info-list__item">
         <dt>{{ theItem.label }}</dt>
         <dd>
            <slot :name="`value-${theItem.key ?? theItem.label}`" :item="theItem">{{ theItem.value ?? '—' }}</slot>
         </dd>
      </div>
   </dl>
</template>

<script setup lang="ts">
export interface EzInfoItem {
   label: string
   value?: string | number | null
   /** Slot name suffix: #value-<key> */
   key?: string
}

defineProps<{
   items: EzInfoItem[]
   /** Label and value side by side */
   inline?: boolean
   /** Each pair in a bordered tile, side by side when there is room: the information of a detail page in production */
   tiles?: boolean
}>()
</script>

<style scoped>
.ez-info-list {
   display: flex;
   flex-direction: column;
   gap: 12px;
   margin: 0;
   font-size: var(--text-sm);
}

dt {
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
}

dd {
   margin: 2px 0 0;
   font-weight: 500;
}

.ez-info-list--inline {
   gap: 8px;

   .ez-info-list__item {
      display: flex;
      justify-content: space-between;
      gap: 16px;
   }

   dt {
      font-size: var(--text-sm);
   }

   dd {
      margin: 0;
      text-align: right;
   }
}

.ez-info-list--tiles {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
   gap: var(--space-inset-sm);

   .ez-info-list__item {
      padding: var(--space-inset-sm);
      border: 1px solid var(--color-border-muted);
      border-radius: var(--radius-sm);
      background: var(--color-surface-muted);
   }

   dd {
      font-size: var(--text-base);
   }
}
</style>
