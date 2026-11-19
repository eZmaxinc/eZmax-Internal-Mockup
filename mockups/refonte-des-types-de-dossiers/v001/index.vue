<template>
   <ez-page>
      <ez-page-header
         :title="theType.lifecycle.name"
         :breadcrumbs="[$gettext('Accueil'), $gettext('Administration'), $gettext('Types de dossiers'), $gettext('Informations')]"
         :button="$gettext('Modifier le type de dossiers')"
         button-icon="edit"
         button-variant="primary"
         refresh
      />

      <ez-page-content>
         <ez-page-sections>
            <!-- Général -->
            <ez-page-section id="general" :label="$gettext('Général')" icon="info" hide-label>
               <ez-card :title="$gettext('Informations')" toc-id="general-info">
                  <template #actions>
                     <ez-badge :tone="theType.isActive ? 'success' : 'neutral'" :label="theType.isActive ? $gettext('Actif') : $gettext('Inactif')" dot />
                  </template>
                  <ez-info :data="theInfoData" />
                  <template #footer>
                     <ez-btn variant="flat" size="sm" icon="info" :label="$gettext('Info')" />
                     <span class="font-mono text-xs text-foreground-subtle">pkiEzsignfoldertypeID: {{ theType.id }}</span>
                  </template>
               </ez-card>

               <ez-card :title="$gettext('Cycle de vie')" toc-id="general-lifecycle">
                  <div class="grid gap-4 sm:grid-cols-[min(29.5rem,42%)_minmax(0,1fr)]">
                     <div class="min-w-0">
                        <ez-heading variant="group" class="mb-2">{{ $gettext('Parcours d’un dossier') }}</ez-heading>
                        <ez-reveal>
                           <LifecycleTimeline :lifecycle="theType.lifecycle" />
                        </ez-reveal>
                     </div>
                     <ez-info :data="theLifecycleData" class="min-w-0" />
                  </div>
               </ez-card>
            </ez-page-section>

            <!-- Sécurité et accès -->
            <ez-page-section id="security" :label="$gettext('Sécurité et accès')" icon="shieldLock">
               <ez-card :title="$gettext('Accès aux dossiers')" toc-id="security-access">
                  <ez-info :data="theAccessData" />
               </ez-card>

               <ez-card :title="$gettext('Authentification des signataires')" toc-id="security-auth">
                  <ez-info :data="theAuthData" />
               </ez-card>

               <ez-card :title="$gettext('Réassignation des signataires')" toc-id="security-reassign">
                  <ez-info :data="theReassignData" />
               </ez-card>
            </ez-page-section>

            <!-- Notifications -->
            <ez-page-section id="notifications" :label="$gettext('Notifications')" icon="notifications">
               <ez-card :title="$gettext('Envoi du suivi')" toc-id="notifications-follow-up">
                  <ez-info :data="theFollowUpData" />
               </ez-card>

               <ez-card :title="$gettext('Envoi du document signé')" toc-id="notifications-signed">
                  <div class="flex flex-col gap-2">
                     <SettingDisclosure v-for="theGroup in theType.signedDocumentRecipients" :key="theGroup.label" :title="theGroup.label">
                        <ez-info :data="[{ name: theGroup.label, items: [{ key: 'toggles', variant: 'list', value: toEntries(theGroup.toggles) }] }]" />
                     </SettingDisclosure>
                  </div>
               </ez-card>
            </ez-page-section>

            <!-- Personnalisation -->
            <ez-page-section id="customization" :label="$gettext('Personnalisation')" icon="palette">
               <ez-card :title="$gettext('Signatures et formulaires')" toc-id="customization-signatures">
                  <ez-info :data="theSignatureData" />
               </ez-card>
            </ez-page-section>

            <!-- Avancé -->
            <ez-page-section id="advanced" :label="$gettext('Avancé')" icon="tune">
               <ez-card :title="$gettext('Validation des PDF/A')" toc-id="advanced-pdfa">
                  <template #actions>
                     <ez-badge :tone="theType.pdfa.isActive ? 'success' : 'neutral'" :label="theType.pdfa.isActive ? $gettext('Actif') : $gettext('Inactif')" dot />
                  </template>
                  <ez-info v-if="theType.pdfa.isActive" :data="thePdfaData" />
                  <p v-else class="text-sm text-foreground-muted">
                     {{ $gettext('Les PDF envoyés ne sont pas validés. Modifiez le type de dossiers pour activer la validation.') }}
                  </p>
               </ez-card>
            </ez-page-section>
         </ez-page-sections>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { gettext, useScenario, type IconName, type IInfoCategory, type IInfoCategoryItems, type IInfoMetric, type IInfoValue, type TInfoCol } from '@ez'
import LifecycleTimeline from './components/LifecycleTimeline.vue'
import SettingDisclosure from './components/SettingDisclosure.vue'
import { scenarios, type Toggle } from './mocks'

const theData = useScenario(scenarios)
const theType = computed(() => theData.value.folderType)

const plural = (count: number, one: string, many: string) => (count > 1 ? many : one)
const days = (count: number): IInfoMetric => ({ amount: count, unit: plural(count, gettext('jour'), gettext('jours')) })

/** The on/off settings as entries of a list: on = positive, off = neutral */
function toEntries(toggles: Toggle[]): IInfoValue[] {
   return toggles.map((theToggle) => ({ label: theToggle.label, value: theToggle.isEnabled }))
}

/** A neutral pill with the icon of the method (no value: neither on nor off) */
function authIconOf(method: string): IconName {
   if (method.startsWith('Intégrée')) return 'signature'
   if (method.startsWith('En personne')) return 'user'
   return 'mail'
}

function onBrandingClick() {
   // Production opens the brand image; nothing to open in the mockup
}

function onCountClick() {
   // Production opens the list (groups, users); nothing to open in the mockup
}

const theInfoData = computed<IInfoCategory[]>(() => {
   const type = theType.value
   return [
      {
         name: 'informations',
         items: [
            { key: 'name', label: gettext('Nom du type de dossiers'), value: type.lifecycle.name, col: 12 },
            { key: 'privacy', label: gettext('Confidentialité'), value: type.confidentiality, col: { xs: 12, md: 4, lg: 3 } },
            { key: 'branding', label: gettext('Image de marque'), value: type.brandImage, col: { xs: 12, md: 4, lg: 3 }, onClick: type.brandImage ? onBrandingClick : undefined },
            { key: 'billing', label: gettext('Entité de facturation'), value: type.billingEntity, col: { xs: 12, md: 4, lg: 3 } },
            { key: 'tsa', label: gettext('Tiers horodateur - eZsign'), value: type.timestampAuthority, col: { xs: 12, md: 4, lg: 3 } },
            { key: 'merge', label: gettext('Permettre le téléchargement du document de travail unifié'), value: type.unifiedDownload, col: { xs: 12, md: 8, lg: 6 }, tooltip: gettext('Un seul PDF qui regroupe tous les documents du dossier.') },
            { key: 'dependency', label: gettext('Interdiction de signer des documents dépendants d’autres documents'), value: type.dependentDocuments, col: { xs: 12, lg: 6 } },
         ],
      },
      {
         name: 'informations-opts',
         title: gettext('Fonctionnalités autorisées'),
         items: [{ key: 'informations-options', variant: 'list', col: 12, value: toEntries(type.features) }],
      },
   ]
})

const theLifecycleData = computed<IInfoCategory[]>(() => {
   const { signatureDays, reminders, finalizationRule, earlyCompletionDays, archiveDays, eliminationDays } = theType.value.lifecycle
   const quarter: TInfoCol = { xs: 12, md: 6, lg: 3 }
   return [
      {
         name: 'signature',
         title: gettext('Signature et rappels'),
         items: [
            { key: 'signature-days', label: gettext('Délai de signature'), value: days(signatureDays), col: quarter },
            { key: 'reminders', label: gettext('Fréquence des rappels'), value: reminders ? gettext('Personnalisée') : gettext('Aucun rappel'), col: quarter },
            ...(reminders
               ? [
                    { key: 'first-reminder', label: gettext('Jours avant l’envoi du premier rappel'), value: days(reminders.firstAfterDays), col: quarter },
                    { key: 'every-reminder', label: gettext('Jours entre les rappels suivants'), value: days(reminders.everyDays), col: quarter },
                 ] as IInfoCategoryItems[]
               : []),
         ],
      },
      {
         name: 'finalization',
         title: gettext('Finalisation'),
         items: [
            { key: 'rule', label: gettext('Règle de finalisation des documents'), value: finalizationRule, col: 12, tooltip: gettext('Quand les documents d’un dossier sont considérés comme complétés.') },
            { key: 'early', label: gettext('Achèvement prématuré des documents'), value: earlyCompletionDays === null ? gettext('Manuel') : gettext('Automatique'), col: 12 },
            ...(earlyCompletionDays === null ? [] : [{ key: 'early-days', label: gettext('Jours avant l’achèvement prématuré des documents'), value: days(earlyCompletionDays), col: 12 }] as IInfoCategoryItems[]),
         ],
      },
      {
         name: 'archive',
         title: gettext('Archivage et élimination'),
         items: [
            { key: 'archive-days', label: gettext('Délai d’archivage des dossiers'), value: days(archiveDays), col: 12 },
            { key: 'elimination', label: gettext('Élimination des données'), value: eliminationDays === null ? gettext('Manuelle') : gettext('Automatique'), col: { xs: 12, md: 6 } },
            ...(eliminationDays === null ? [] : [{ key: 'elimination-days', label: gettext('Jours avant l’élimination des données'), value: days(eliminationDays), col: { xs: 12, md: 6 } }] as IInfoCategoryItems[]),
         ],
      },
   ]
})

const theAccessData = computed<IInfoCategory[]>(() => [
   {
      name: 'usergroups',
      title: gettext('Groupes d’utilisateurs'),
      items: theType.value.accessGroups.map((theGroup, index): IInfoCategoryItems => ({
         key: `usergroup-${index}`,
         label: theGroup.label,
         value: { amount: theGroup.count, unit: plural(theGroup.count, gettext('groupe'), gettext('groupes')) },
         col: { xs: 12, md: 4 },
         onClick: onCountClick,
      })),
   },
   {
      name: 'participants',
      title: gettext('Signataires participants'),
      items: [{ key: 'participant-access', label: gettext('Accès des signataires participants aux dossiers'), value: theType.value.participantAccess, col: 12 }],
   },
])

const theAuthData = computed<IInfoCategory[]>(() => [
   {
      name: 'auth',
      items: [{ key: 'auth-methods', label: gettext('Méthodes d’authentification autorisées'), value: theType.value.authMethods.map((theMethod) => ({ label: theMethod, icon: authIconOf(theMethod) })), col: 12 }],
   },
])

const theReassignData = computed<IInfoCategory[]>(() => [
   {
      name: 'reassign',
      items: [{ key: 'reassign-behaviour', label: gettext('Comportement lors de la réassignation d’un groupe'), value: theType.value.reassignBehaviour, col: 12 }],
   },
   {
      name: 'reassign-opts',
      title: gettext('Réassignations autorisées'),
      items: [{ key: 'reassign-options', variant: 'list', value: toEntries(theType.value.reassignments) }],
   },
])

const theFollowUpData = computed<IInfoCategory[]>(() => {
   const type = theType.value
   return [
      {
         name: 'recipients',
         title: gettext('Destinataires'),
         items: [{ key: 'recipients-options', variant: 'list', value: toEntries(type.followUpRecipients) }],
      },
      {
         name: 'additional',
         title: gettext('Destinataires additionnels'),
         items: [
            { key: 'email', label: gettext('Courriel'), value: type.additionalEmail },
            { key: 'users', label: gettext('Utilisateurs sélectionnés'), value: { amount: type.additionalUsers, unit: plural(type.additionalUsers, gettext('utilisateur'), gettext('utilisateurs')) }, onClick: onCountClick },
         ],
      },
   ]
})

const theSignatureData = computed<IInfoCategory[]>(() => {
   const type = theType.value
   return [
      {
         name: 'fonts',
         title: gettext('Polices par défaut'),
         items: type.fonts.map((theFont, index): IInfoCategoryItems => ({
            key: `font-${index}`,
            label: theFont.label,
            value: gettext('Aa — Exemple de texte'),
            hint: `${theFont.family} · ${theFont.size} pt`,
            valueStyle: { fontFamily: theFont.family, fontSize: `${theFont.size + 2}px` },
            col: { xs: 12, md: 4 },
         })),
      },
      {
         name: 'dates',
         title: gettext('Dates de signature'),
         items: [
            {
               key: 'date-format',
               label: gettext('Affichage des dates de signature'),
               value: type.signatureDateSample,
               hint: type.signatureDateFormat ? gettext('Format personnalisé: %{format}', { format: type.signatureDateFormat }) : undefined,
               col: { xs: 12, md: 4 },
            },
         ],
      },
      {
         name: 'customization',
         title: gettext('Personnalisation des signatures'),
         items: [{ key: 'customization-options', variant: 'list', value: toEntries(type.signatureCustomization) }],
      },
   ]
})

const thePdfaData = computed<IInfoCategory[]>(() => {
   const { validationType, onError, conversionLevel, levels } = theType.value.pdfa
   return [
      {
         name: 'pdfa',
         items: [
            { key: 'validation', label: gettext('Type de validation des PDF/A'), value: validationType, col: { xs: 12, md: 4 } },
            { key: 'on-error', label: gettext('Action en cas d’erreur de validation'), value: onError, col: { xs: 12, md: 4 } },
            { key: 'conversion', label: gettext('Niveau de PDF/A lors de la conversion'), value: conversionLevel, col: { xs: 12, md: 4 } },
            { key: 'levels', label: gettext('Niveaux des PDF/A qui seront validés'), value: levels, col: 12 },
         ],
      },
   ]
})
</script>
