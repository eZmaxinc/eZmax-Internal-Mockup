<template>
   <ez-page>
      <ez-page-header
         :title="$gettext('Inscription #%{id}', { id: theInscription.id })"
         :breadcrumbs="[$gettext('Accueil'), $gettext('Inscriptions'), `#${theInscription.id}`]"
         :button="$gettext('Modifier l\'inscription')"
         button-icon="edit"
         button-variant="primary"
         refresh
      />

      <ez-page-content>
         <!-- One section per group of the navigation: the inscription, then each sale; their cards are the sub-entries -->
         <ez-page-sections>
            <ez-page-section id="inscription" :label="$gettext('Inscription #%{id}', { id: theInscription.id })" icon="home" hide-label>
               <InscriptionSections :inscription="theInscription" />
            </ez-page-section>

            <ez-page-section
               v-for="theSale in theInscription.sales"
               :id="`sale-${theSale.id}`"
               :key="theSale.id"
               :label="$gettext('Vente #%{id}', { id: theSale.id })"
               icon="file"
            >
               <SaleSections :sale="theSale" />
            </ez-page-section>

            <ez-page-section v-if="!theInscription.sales.length" id="sales" :label="$gettext('Ventes')" icon="file">
               <ez-card>
                  <ez-empty-state :title="$gettext('Aucune vente')" :text="$gettext('Cette inscription n\'a pas encore de vente.')" :icon="ez.icons.file">
                     <template #actions>
                        <ez-btn variant="primary" :icon="ez.icons.add" :label="$gettext('Ajouter une vente')" />
                     </template>
                  </ez-empty-state>
               </ez-card>
            </ez-page-section>
         </ez-page-sections>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScenario } from '@ez'
import InscriptionSections from './components/InscriptionSections.vue'
import SaleSections from './components/SaleSections.vue'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theInscription = computed(() => theData.value.inscription)
</script>
