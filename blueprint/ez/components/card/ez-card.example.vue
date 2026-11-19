<!-- Exemple de la galerie. Une carte complète (icône, sous-titre, actions, pied), une carte flush pour une liste, une carte réduite à son en-tête. -->
<template>
   <div class="flex flex-col gap-4">
      <ez-card title="Préférences" subtitle="S’appliquent à tout l’espace de travail" icon="settings">
         <template #actions>
            <ez-btn variant="flat" size="sm" icon="edit" label="Modifier" />
         </template>
         <p class="m-0 text-sm text-foreground-muted">Le contenu de la carte, avec la marge intérieure des cartes.</p>
         <template #footer>
            <ez-btn variant="flat" label="Annuler" />
            <ez-btn variant="primary" label="Enregistrer" />
         </template>
      </ez-card>

      <ez-card title="Membres" flush>
         <ul class="example-list">
            <li v-for="theMember in members" :key="theMember">{{ theMember }}</li>
         </ul>
      </ez-card>

      <ez-card title="Une carte sans contenu: son en-tête seul" />
   </div>
</template>

<script setup lang="ts">
const members = ['Alex Martin', 'Camille Roy', 'Sam Gagnon']
</script>

<style scoped>
/* flush: the rows touch the edges of the card */
.example-list {
   margin: 0;
   padding: 0;
   list-style: none;

   li {
      padding: var(--space-gap-sm) var(--space-inset-lg);
      border-top: 1px solid var(--color-border-muted);
      font-size: var(--text-sm);
   }
}
</style>
