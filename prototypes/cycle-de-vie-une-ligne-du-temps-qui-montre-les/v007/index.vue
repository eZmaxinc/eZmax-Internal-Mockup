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
         <ez-card :title="$gettext('Cycle de vie')">
            <!--
               The frieze on a bit more than a third of the card, never wider than 472 px (29.5rem); the boxes of the
               production page take the rest. A plain grid: the two columns hold from 640 px, and ez-layout-col only
               splits from md (1024 px).
            -->
            <div class="grid gap-4 sm:grid-cols-[min(29.5rem,42%)_minmax(0,1fr)]">
               <div class="min-w-0">
                  <h4 class="mb-2 text-sm font-medium">{{ $gettext('Ligne du temps') }}</h4>
                  <lifecycle-timeline :lifecycle="theData.lifecycle" />
               </div>
               <div class="min-w-0">
                  <div>
                     <h4 class="mb-2 text-sm font-medium">{{ $gettext('Signature et rappels') }}</h4>
                     <ez-info-list :items="signatureItems" tiles />

                     <h4 class="mt-6 mb-2 text-sm font-medium">{{ $gettext('Finalisation') }}</h4>
                     <ez-info-list :items="finalizationItems" tiles />

                     <h4 class="mt-6 mb-2 text-sm font-medium">{{ $gettext('Archivage et élimination') }}</h4>
                     <ez-info-list :items="archiveItems" tiles />
                  </div>
               </div>
            </div>
         </ez-card>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { gettext, useScenario } from "@ez";
import { computed } from "vue";
import EzInfoList from "./components/EzInfoList.vue";
import LifecycleTimeline from "./components/LifecycleTimeline.vue";
import { scenarios } from "./mocks";

const theData = useScenario(scenarios);

const days = (count: number) =>
	gettext(count > 1 ? "%{count} jours" : "%{count} jour", { count });

const signatureItems = computed(() => {
	const { signatureDays, reminders } = theData.value.lifecycle;
	return [
		{ label: gettext("Délai de signature"), value: days(signatureDays) },
		{
			label: gettext("Fréquence des rappels"),
			value: reminders ? gettext("Personnalisée") : gettext("Aucun rappel"),
		},
		...(reminders
			? [
					{
						label: gettext("Jours avant l'envoi du premier rappel"),
						value: days(reminders.firstAfterDays),
					},
					{
						label: gettext("Jours entre les rappels suivants"),
						value: days(reminders.everyDays),
					},
				]
			: []),
	];
});

const finalizationItems = computed(() => {
	const { finalizationRule, earlyCompletionDays } = theData.value.lifecycle;
	return [
		{
			label: gettext("Règle de finalisation des documents"),
			value: finalizationRule,
		},
		{
			label: gettext("Achèvement prématuré des documents"),
			value:
				earlyCompletionDays === null
					? gettext("Manuel")
					: gettext("Automatique"),
		},
		...(earlyCompletionDays === null
			? []
			: [
					{
						label: gettext("Jours avant l'achèvement prématuré des documents"),
						value: days(earlyCompletionDays),
					},
				]),
	];
});

const archiveItems = computed(() => {
	const { archiveDays, eliminationDays } = theData.value.lifecycle;
	return [
		{
			label: gettext("Délai d'archivage des dossiers"),
			value: days(archiveDays),
		},
		{
			label: gettext("Élimination des données"),
			value:
				eliminationDays === null ? gettext("Manuelle") : gettext("Automatique"),
		},
		...(eliminationDays === null
			? []
			: [
					{
						label: gettext("Jours avant l'élimination des données"),
						value: days(eliminationDays),
					},
				]),
	];
});
</script>
