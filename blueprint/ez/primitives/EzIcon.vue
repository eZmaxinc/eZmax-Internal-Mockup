<template>
   <svg
      class="ez-icon"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
   >
      <path :d="iconPaths[name]" />
   </svg>
</template>

<script setup lang="ts">
import { iconPaths, type IconName } from '../icons'

withDefaults(defineProps<{
   name: IconName
   size?: number
}>(), {
   size: 18,
})
</script>

<style scoped>
.ez-icon {
   flex-shrink: 0;
   display: inline-block;
   vertical-align: middle;
}
</style>
