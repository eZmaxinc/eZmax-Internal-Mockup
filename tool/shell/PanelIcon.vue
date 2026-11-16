<template>
   <!-- A window with a side panel, the usual drawer toggle: the panel is filled when it is open -->
   <svg
      class="panel-icon"
      :class="{ 'panel-icon--right': side === 'right' }"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
   >
      <path v-if="open" class="panel-icon__fill" d="M5 3h4v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
   </svg>
</template>

<script setup lang="ts">
/** Shell chrome only, so it stays out of the product's icon set (blueprint/ez/icons.ts). */
defineProps<{
   side: 'left' | 'right'
   open: boolean
}>()
</script>

<style scoped>
.panel-icon {
   display: block;
}

.panel-icon--right {
   transform: scaleX(-1);
}

.panel-icon__fill {
   fill: currentColor;
   stroke: none;
   opacity: 0.35;
}
</style>
