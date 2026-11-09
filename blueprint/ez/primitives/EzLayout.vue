<template>
   <div class="ez-layout" :style="{ gap: gap }">
      <slot />
   </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
   gap?: string
}>(), {
   gap: 'var(--card-gap)',
})
</script>

<style scoped>
.ez-layout {
   display: grid;
   grid-template-columns: repeat(12, minmax(0, 1fr));
   align-items: start;
}
</style>
