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
            <!-- The frieze is not on the page: a round button next to the title opens it in a popover -->
            <template #actions>
               <ez-popover :title="$gettext('Cycle de vie')">
                  <template #trigger="{ toggle, open }">
                     <ez-btn class="lifecycle-trigger" icon="clock" variant="flat" size="sm" pill :aria-label="$gettext('Voir le cycle de vie')" :aria-expanded="open" @click="toggle" />
                  </template>
                  <lifecycle-timeline :lifecycle="theData.lifecycle" />
               </ez-popover>
            </template>

            <!-- The same boxes as the production page -->
            <h4 class="mb-2 text-sm font-medium">{{ $gettext('Signature et rappels') }}</h4>
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
import EzPopover from './components/EzPopover.vue'
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

<style scoped>
/* The button that opens the frieze: no outline, the pale grey of the data tiles, darker under the pointer */
.lifecycle-trigger.ez-btn {
   background: var(--color-surface-muted);
   color: var(--color-foreground);

   &:hover:not(:disabled) {
      background: var(--color-border);
   }
}
</style>
