<template>
   <svg
      class="ez-icon"
      :width="size"
      :height="size"
      :viewBox="theGlyph.viewBox"
      fill="currentColor"
      aria-hidden="true"
   >
      <path v-for="(thePath, index) in theGlyph.paths" :key="index" :d="thePath.d" :style="thePath.style" />
   </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { iconPaths, parseIcon, type IconName } from '../../icons'

const props = withDefaults(defineProps<{
   /** A key of ez.icons; its glyph is production's (@quasar/extras, Material Symbols Outlined) */
   name: IconName
   size?: number
}>(), {
   size: 18,
})

const theGlyph = computed(() => parseIcon(iconPaths[props.name]))
</script>

<style scoped>
.ez-icon {
   flex-shrink: 0;
   display: inline-block;
   vertical-align: middle;
}
</style>
