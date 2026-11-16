<template>
   <div class="ez-layout" :style="{ gap: gap }">
      <slot />
   </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
   gap?: string
}>(), {
   gap: 'var(--card-gap, var(--space-gap-md))',
})
</script>

<style scoped>
/* Self-contained: copies into the mono as is, with ez-layout-col.vue. The default gap is the `gap` prop. */
.ez-layout {
   display: grid;
   grid-template-columns: repeat(12, minmax(0, 1fr));
   align-items: start;
}
</style>
