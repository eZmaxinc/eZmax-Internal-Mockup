<!-- Exemple de la galerie. Une explication au survol ou au focus du clavier, avec ou sans titre. -->
<template>
   <div class="flex flex-wrap items-center gap-6 text-sm">
      <span class="inline-flex items-center gap-1">
         Fuseau horaire
         <ez-tooltip text="Les dates sont affichées dans ce fuseau.">
            <ez-icon name="info" :size="14" class="text-foreground-subtle" />
         </ez-tooltip>
      </span>
      <ez-tooltip title="Brouillon" text="Visible seulement par vous jusqu’à la publication.">
         <ez-badge label="Brouillon" tone="info" />
      </ez-tooltip>
   </div>
</template>
