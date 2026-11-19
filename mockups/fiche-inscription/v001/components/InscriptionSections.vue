<template>
   <ez-card toc-id="ins-info" :title="$gettext('Informations')">
      <template #actions>
         <ez-badge v-for="theCounter in inscription.counters" :key="theCounter.label" as="a" href="#" outline @click.prevent>
            <span class="flex items-center gap-1"><ez-icon :name="theCounter.icon" :size="14" />{{ theCounter.label }}</span>
         </ez-badge>
         <ez-badge tone="success" dot :label="$gettext('Actif')" />
      </template>

      <ez-info :data="theInformations" />

      <!-- The foot of the card: set apart from its content -->
      <div class="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-subtle">
         <span class="font-mono">
            {{
               $gettext('Créé le %{created} par %{author} · Modifié le %{modified} par %{author}', {
                  created: formatDateTime(inscription.createdAt),
                  modified: formatDateTime(inscription.modifiedAt),
                  author: inscription.author,
               })
            }}
         </span>
         <code class="rounded-sm border border-border px-2 py-1 font-mono text-foreground-muted">pkiInscriptionID: {{ inscription.id }}</code>
      </div>
   </ez-card>

   <ez-card toc-id="ins-statut" :title="$gettext('Statut et suivi')">
      <div class="flex flex-col gap-5">
         <div class="grid gap-5 md:grid-cols-2">
            <ez-info :data="theToDo" />
            <ez-info :data="theDates" />
         </div>
         <ez-info :data="theCommissions" />
      </div>
   </ez-card>

   <ez-card toc-id="ins-parties" :title="$gettext('Parties et dossiers')">
      <div class="flex flex-col gap-2">
         <DataPanel v-for="thePanel in inscription.partyPanels" :key="thePanel.title" :panel="thePanel" addable />
         <EmptySlots :items="inscription.partyEmpty" />
      </div>
   </ez-card>

   <ez-card toc-id="ins-fin" :title="$gettext('Finances et protection')">
      <div class="flex flex-col gap-5">
         <EmptySlots :items="inscription.financeEmpty" />
         <ez-info :data="theProtection" />
      </div>
   </ez-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDateTime, gettext, type IInfoCategory } from '@ez'
import type { Inscription } from '../mocks'
import DataPanel from './DataPanel.vue'
import EmptySlots from './EmptySlots.vue'
import { flagsOf, statsOf, tilesOf } from './info'

const props = defineProps<{ inscription: Inscription }>()

const theInformations = computed<IInfoCategory[]>(() => [
   { name: 'identification', title: gettext('Identification'), items: tilesOf('identification', props.inscription.identification) },
   {
      name: 'property',
      title: gettext('Propriété'),
      items: [{ key: 'address', label: gettext('Adresse'), value: props.inscription.address, col: 12 }],
      // Three framed groups side by side from md, their facts one under the other
      groups: [
         { name: 'classification', title: gettext('Classification'), col: { xs: 12, md: 4 }, items: tilesOf('classification', props.inscription.classification, 12) },
         { name: 'building', title: gettext('Bâtiment'), col: { xs: 12, md: 4 }, items: tilesOf('building', props.inscription.building, 12) },
         { name: 'prices', title: gettext('Prix'), col: { xs: 12, md: 4 }, items: statsOf('prices', props.inscription.prices, { col: 12 }) },
      ],
   },
   { name: 'characteristics', title: gettext('Caractéristiques'), items: [flagsOf('characteristics', props.inscription.characteristics)] },
])

const theToDo = computed<IInfoCategory[]>(() => [
   {
      name: 'to-do',
      title: gettext('À traiter'),
      items: [
         ...statsOf('follow-up', props.inscription.followUp, { col: 12, isLink: true }),
         {
            key: 'validations',
            label: gettext('En attente de validation'),
            value: props.inscription.validations.map((theValidation) => ({ label: `${theValidation.label}: ${theValidation.state}` })),
            col: 12,
         },
      ],
   },
])

const theDates = computed<IInfoCategory[]>(() => [
   {
      name: 'dates',
      title: gettext('Dates et statut'),
      items: [
         { key: 'listed-at', label: gettext("Date d'inscription"), value: '—', col: { xs: 12, sm: 6 } },
         { key: 'expires-at', label: gettext("Date d'expiration"), value: '—', col: { xs: 12, sm: 6 } },
         flagsOf('status', props.inscription.statusFlags),
      ],
   },
])

const theCommissions = computed<IInfoCategory[]>(() => [
   { name: 'commissions', title: gettext('Rétributions de l\'inscription'), items: statsOf('commissions', props.inscription.commissions, { col: { xs: 12, sm: 6, lg: 3 } }) },
])

const theProtection = computed<IInfoCategory[]>(() => [
   {
      name: 'protection',
      title: gettext('Protection propriétaire'),
      items: [
         flagsOf('protection', [{ on: false, label: gettext('Non admissible') }], { xs: 12, sm: 6 }),
         { key: 'protection-comment', label: gettext('Commentaire'), value: '—', col: { xs: 12, sm: 6 } },
      ],
   },
])
</script>
