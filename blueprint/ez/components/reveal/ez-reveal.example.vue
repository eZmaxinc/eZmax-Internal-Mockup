<!-- Exemple de la galerie. Réduit sous 640 px seulement: le voir avec la largeur Mobile du shell. -->
<template>
   <div class="flex flex-col gap-2">
      <p class="m-0 text-sm text-foreground-muted">Sur téléphone, la liste est réduite; au-dessus de 640 px, elle s'affiche en entier.</p>
      <ez-reveal collapsed-height="6rem">
         <ol class="m-0 flex flex-col gap-2 pl-5 text-sm">
            <li v-for="theStep in steps" :key="theStep">{{ theStep }}</li>
         </ol>
      </ez-reveal>
   </div>
</template>

<script setup lang="ts">
const steps = [
   'Envoi du dossier aux signataires',
   'Premier rappel, 2 jours après l\'envoi',
   'Rappels, un par jour',
   'Dernier rappel, la veille de la date limite',
   'Date limite: 60 jours après l\'envoi',
   'Fermeture du dossier',
   'Archivage, 180 jours après la fermeture',
   'Élimination, 5 jours après l\'archivage',
]
</script>
