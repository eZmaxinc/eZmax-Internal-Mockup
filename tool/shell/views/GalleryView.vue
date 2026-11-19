<template>
   <mockup-viewer :frames="['gallery']" :scenario-names="[]">
      <template #devbar-start>
         <strong>Galerie des composants</strong>
      </template>
   </mockup-viewer>
</template>

<script setup lang="ts">
import MockupViewer from '../MockupViewer.vue'
</script>
