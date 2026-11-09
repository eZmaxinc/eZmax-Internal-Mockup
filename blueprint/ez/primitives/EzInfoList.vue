<template>
   <dl class="ez-info-list" :class="{ 'ez-info-list--inline': inline }">
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
</style>
