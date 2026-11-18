<template>
   <ez-page>
      <ez-page-header :title="$gettext('Titre de la page')" refresh />
      <ez-page-content>
         <ez-layout>
            <ez-layout-col :cols="{ base: 12, md: 8 }">
               <ez-card :title="$gettext('Contenu principal')">
                  <p class="m-0 text-foreground-muted">{{ theData.message }}</p>
               </ez-card>
            </ez-layout-col>
            <ez-layout-col :cols="{ base: 12, md: 4 }" first-below-md>
               <ez-card :title="$gettext('Résumé')">
                  <ez-info-list :items="[{ label: $gettext('Statut'), value: 'Brouillon' }]" />
               </ez-card>
            </ez-layout-col>
         </ez-layout>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { useScenario } from '@ez'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
</script>
