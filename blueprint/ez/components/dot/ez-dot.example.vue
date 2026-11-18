<!-- Exemple de la galerie. Les tons, puis le pulse: seul, et dans un badge. -->
<template>
   <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
         <ez-dot v-for="theTone in tones" :key="theTone" :tone="theTone" />
      </div>
      <div class="flex items-center gap-4">
         <ez-dot v-for="theTone in tones" :key="theTone" :tone="theTone" pulse />
      </div>
      <div class="flex flex-wrap items-center gap-2">
         <ez-badge tone="success" dot pulse label="Actif" />
         <ez-badge tone="info" dot pulse label="En cours" />
         <ez-badge tone="neutral" dot label="Brouillon" />
      </div>
   </div>
</template>

<script setup lang="ts">
const tones = ['neutral', 'info', 'success', 'warning', 'danger', 'action'] as const
</script>
