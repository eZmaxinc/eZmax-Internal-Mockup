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
               <ez-popover :title="$gettext('Signature et rappels')">
                  <template #trigger="{ toggle, open }">
                     <ez-btn class="lifecycle-trigger" variant="flat" size="sm" pill :title="$gettext('Voir le cycle de vie')" :aria-expanded="open" @click="toggle">
                        <span class="lifecycle-trigger__label">{{ $gettext('Voir le cycle de vie') }}</span>
                        <!-- question (circle-help) is missing from ez.icons -->
                        <svg class="lifecycle-trigger__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                           <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                        </svg>
                     </ez-btn>
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
   position: relative;
   width: var(--size-control-sm);
   padding: 0;
   background: var(--color-surface-muted);
   color: var(--color-foreground);

   &:hover:not(:disabled) {
      background: var(--color-border);
   }
}

.lifecycle-trigger__label {
   position: absolute;
   width: 1px;
   height: 1px;
   padding: 0;
   margin: -1px;
   overflow: hidden;
   clip: rect(0, 0, 0, 0);
   white-space: nowrap;
   border: 0;
}

.lifecycle-trigger__icon {
   display: block;
}
</style>
