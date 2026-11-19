<template>
   <ez-page>
      <ez-page-header
         :title="theData.lifecycle.name"
         :breadcrumbs="[$gettext('Accueil'), $gettext('Administration'), $gettext('Types de dossiers'), $gettext('Informations')]"
         :button="$gettext('Modifier le type de dossiers')"
         button-icon="edit"
         button-variant="primary"
         refresh
      />
      <ez-page-content>
         <ez-card :title="$gettext('Rappels et dates')">
            <lifecycle-timeline :lifecycle="theData.lifecycle" />

            <!-- The same boxes as the production page, even where they repeat the timeline -->
            <h4 class="mt-6 mb-2 text-sm font-medium">{{ $gettext('Signature et rappels') }}</h4>
            <ez-info-list :items="signatureItems" tiles />

            <ez-layout class="mt-6">
               <ez-layout-col :cols="{ base: 12, md: 6 }">
                  <div>
                     <h4 class="mb-2 text-sm font-medium">{{ $gettext('Finalisation') }}</h4>
                     <ez-info-list :items="finalizationItems" tiles />
                  </div>
               </ez-layout-col>
               <ez-layout-col :cols="{ base: 12, md: 6 }">
                  <div>
                     <h4 class="mb-2 text-sm font-medium">{{ $gettext('Archivage et élimination') }}</h4>
                     <ez-info-list :items="archiveItems" tiles />
                  </div>
               </ez-layout-col>
            </ez-layout>
         </ez-card>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { gettext, useScenario } from '@ez'
import EzInfoList from './components/EzInfoList.vue'
import LifecycleTimeline from './components/LifecycleTimeline.vue'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)

const days = (count: number) => gettext(count > 1 ? '%{count} jours' : '%{count} jour', { count })

const signatureItems = computed(() => {
   const { signatureDays, reminders } = theData.value.lifecycle
   return [
      { label: gettext('Délai de signature'), value: days(signatureDays) },
      { label: gettext('Fréquence des rappels'), value: reminders ? gettext('Personnalisée') : gettext('Aucun rappel') },
      ...(reminders
         ? [
            { label: gettext('Jours avant l\'envoi du premier rappel'), value: days(reminders.firstAfterDays) },
            { label: gettext('Jours entre les rappels suivants'), value: days(reminders.everyDays) },
         ]
         : []),
   ]
})

const finalizationItems = computed(() => {
   const { finalizationRule, earlyCompletionDays } = theData.value.lifecycle
   return [
      { label: gettext('Règle de finalisation des documents'), value: finalizationRule },
      { label: gettext('Achèvement prématuré des documents'), value: earlyCompletionDays === null ? gettext('Manuel') : gettext('Automatique') },
      ...(earlyCompletionDays === null ? [] : [{ label: gettext('Jours avant l\'achèvement prématuré des documents'), value: days(earlyCompletionDays) }]),
   ]
})

const archiveItems = computed(() => {
   const { archiveDays, eliminationDays } = theData.value.lifecycle
   return [
      { label: gettext('Délai d\'archivage des dossiers'), value: days(archiveDays) },
      { label: gettext('Élimination des données'), value: eliminationDays === null ? gettext('Manuelle') : gettext('Automatique') },
      ...(eliminationDays === null ? [] : [{ label: gettext('Jours avant l\'élimination des données'), value: days(eliminationDays) }]),
   ]
})
</script>
