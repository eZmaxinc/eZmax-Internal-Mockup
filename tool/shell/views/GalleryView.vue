<template>
   <proto-viewer :frames="['gallery']" :scenario-names="[]">
      <template #devbar-start>
         <strong>Galerie des composants</strong>
      </template>
   </proto-viewer>
</template>

<script setup lang="ts">
import ProtoViewer from '../ProtoViewer.vue'
</script>
