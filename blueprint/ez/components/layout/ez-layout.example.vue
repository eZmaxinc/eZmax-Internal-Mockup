<!-- Exemple de la galerie. La grille de 12 colonnes: spans par seuil, colonnes responsives, wrap. -->
<template>
   <div class="flex flex-col gap-8">
      <section class="flex flex-col gap-2">
         <ez-heading variant="group">Grille: une colonne sous md, 8/4 au-dessus (debug allumé)</ez-heading>
         <ez-layout debug>
            <ez-layout-col :span="{ xs: 12, md: 8 }" name="principale"><div class="example-cell">8 colonnes</div></ez-layout-col>
            <ez-layout-col :span="{ xs: 12, md: 4 }" name="droite" first-below-md><div class="example-cell">4 colonnes, en premier sous md</div></ez-layout-col>
         </ez-layout>
      </section>

      <section class="flex flex-col gap-2">
         <ez-heading variant="group">Colonnes responsives: 2, puis 3 à 600 px, puis 6 à 1440 px</ez-heading>
         <ez-layout :columns="{ xs: 2, sm: 3, lg: 6 }" :gap="3">
            <ez-layout-col v-for="index in 6" :key="index" :span="1"><div class="example-cell">{{ index }}</div></ez-layout-col>
         </ez-layout>
      </section>

      <section class="flex flex-col gap-2">
         <ez-heading variant="group">wrap: côte à côte; le span devient une largeur</ez-heading>
         <ez-layout direction="wrap" :gap="2">
            <ez-layout-col><div class="example-cell">Taille naturelle</div></ez-layout-col>
            <ez-layout-col :span="6"><div class="example-cell">La moitié</div></ez-layout-col>
            <ez-layout-col><div class="example-cell">Encore une</div></ez-layout-col>
         </ez-layout>
      </section>
   </div>
</template>

<style scoped>
.example-cell {
   padding: var(--space-gap-sm) var(--space-inset-sm);
   border: 1px dashed var(--color-border);
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
   color: var(--color-foreground-muted);
   font-size: var(--text-sm);
}
</style>
