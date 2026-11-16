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
   /* Variables first: what the list's look depends on, read below */
   --ez-info-list-gap: var(--space-inset-sm);
   --ez-info-list-label: var(--color-foreground-muted);
   --ez-info-list-tile-surface: var(--color-surface-muted);
   --ez-info-list-tile-border: var(--color-border-muted);
   --ez-info-list-tile-radius: var(--radius-sm);

   display: flex;
   flex-direction: column;
   gap: var(--ez-info-list-gap);
   margin: 0;
   font-size: var(--text-sm);
}

dt {
   color: var(--ez-info-list-label);
   font-size: var(--text-xs);
}

dd {
   margin: 2px 0 0;
   font-weight: 500;
}

.ez-info-list--inline {
   --ez-info-list-gap: var(--space-gap-sm);

   .ez-info-list__item {
      display: flex;
      justify-content: space-between;
      gap: var(--space-gap-md);
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

   .ez-info-list__item {
      padding: var(--space-inset-sm);
      border: 1px solid var(--ez-info-list-tile-border);
      border-radius: var(--ez-info-list-tile-radius);
      background: var(--ez-info-list-tile-surface);
   }

   dd {
      font-size: var(--text-base);
   }
}
</style>
