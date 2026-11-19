<template>
   <ez-card toc-id="ins-info" :title="$gettext('Informations')">
      <template #actions>
         <ez-badge v-for="theCounter in inscription.counters" :key="theCounter.label" as="a" href="#" outline @click.prevent>
            <span class="flex items-center gap-1"><ez-icon :name="theCounter.icon" :size="14" />{{ theCounter.label }}</span>
         </ez-badge>
         <ez-badge tone="success" dot :label="$gettext('Actif')" />
      </template>

      <div class="flex flex-col gap-2">
         <GroupTitle :label="$gettext('Identification')" />
         <ez-info-list :items="inscription.identification" tiles />

         <GroupTitle :label="$gettext('Propriété')" />
         <TileBox :label="$gettext('Adresse')">
            <div class="text-sm font-semibold">{{ inscription.address }}</div>
         </TileBox>
         <div class="grid gap-2 md:grid-cols-3">
            <SubPanel :title="$gettext('Classification')">
               <div class="p-3"><ez-info-list :items="inscription.classification" inline /></div>
            </SubPanel>
            <SubPanel :title="$gettext('Bâtiment')">
               <div class="p-3"><ez-info-list :items="inscription.building" inline /></div>
            </SubPanel>
            <SubPanel :title="$gettext('Prix')">
               <div class="flex flex-col gap-2 p-3">
                  <StatTile v-for="thePrice in inscription.prices" :key="thePrice.label" :stat="thePrice" />
               </div>
            </SubPanel>
         </div>

         <GroupTitle :label="$gettext('Caractéristiques')" />
         <FlagList :flags="inscription.characteristics" />

         <!-- The foot of the card: set apart from its content -->
         <div class="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-subtle">
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
      </div>
   </ez-card>

   <ez-card toc-id="ins-statut" :title="$gettext('Statut et suivi')">
      <div class="flex flex-col gap-2">
         <div class="grid gap-4 md:grid-cols-2">
            <div class="flex flex-col gap-2">
               <GroupTitle :label="$gettext('À traiter')" />
               <StatTile v-for="theStat in inscription.followUp" :key="theStat.label" :stat="theStat" clickable />
               <TileBox :label="$gettext('En attente de validation')">
                  <div v-for="theValidation in inscription.validations" :key="theValidation.label" class="flex items-center justify-between text-sm">
                     {{ theValidation.label }}
                     <ez-badge :label="theValidation.state" />
                  </div>
               </TileBox>
            </div>

            <div class="flex flex-col gap-2">
               <GroupTitle :label="$gettext('Dates et statut')" />
               <ez-info-list :items="theDates" tiles />
               <FlagList :flags="inscription.statusFlags" />
            </div>
         </div>

         <GroupTitle :label="$gettext('Rétributions de l\'inscription')" />
         <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile v-for="theStat in inscription.commissions" :key="theStat.label" :stat="theStat" />
         </div>
      </div>
   </ez-card>

   <ez-card toc-id="ins-parties" :title="$gettext('Parties et dossiers')">
      <div class="flex flex-col gap-2">
         <DataPanel v-for="thePanel in inscription.partyPanels" :key="thePanel.title" :panel="thePanel" addable />
         <EmptySlots :items="inscription.partyEmpty" />
      </div>
   </ez-card>

   <ez-card toc-id="ins-fin" :title="$gettext('Finances et protection')">
      <div class="flex flex-col gap-2">
         <EmptySlots :items="inscription.financeEmpty" />
         <GroupTitle :label="$gettext('Protection propriétaire')" />
         <div class="grid gap-2 sm:grid-cols-2">
            <FlagList :flags="[{ on: false, label: $gettext('Non admissible') }]" class="sm:grid-cols-1" />
            <ez-info-list :items="[{ label: $gettext('Commentaire'), value: '—' }]" tiles />
         </div>
      </div>
   </ez-card>
</template>

<script setup lang="ts">
import { formatDateTime, gettext, type EzInfoItem } from '@ez'
import type { Inscription } from '../mocks'
import DataPanel from './DataPanel.vue'
import EzBadge from './EzBadge.vue'
import EmptySlots from './EmptySlots.vue'
import EzInfoList from './EzInfoList.vue'
import FlagList from './FlagList.vue'
import GroupTitle from './GroupTitle.vue'
import StatTile from './StatTile.vue'
import SubPanel from './SubPanel.vue'
import TileBox from './TileBox.vue'

defineProps<{ inscription: Inscription }>()

const theDates: EzInfoItem[] = [
   { label: gettext("Date d'inscription"), value: '—' },
   { label: gettext("Date d'expiration"), value: '—' },
]
</script>
