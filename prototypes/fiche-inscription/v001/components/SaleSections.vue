<template>
   <section id="v-apercu" data-anchor="v-apercu" class="scroll-mt-28 md:scroll-mt-20">
      <ez-card :title="$gettext('Vente #%{id}', { id: sale.id })">
         <template #actions>
            <ez-badge v-for="theCounter in sale.counters" :key="theCounter.label">
               <span class="flex items-center gap-1"><ez-icon :name="theCounter.icon" :size="14" />{{ theCounter.label }}</span>
            </ez-badge>
            <ez-badge :tone="sale.stateTone" strong :label="sale.stateLabel" />
         </template>

         <div class="flex flex-col gap-2">
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
               <div
                  v-for="theKpi in sale.kpis"
                  :key="theKpi.label"
                  class="rounded-sm border border-border px-3 py-2"
                  :class="theKpi.isTotal ? 'bg-surface-positive' : 'bg-surface-muted'"
               >
                  <div class="text-xs text-foreground-muted">{{ theKpi.label }}</div>
                  <div class="text-lg font-bold">{{ theKpi.value }}</div>
                  <div class="text-xs text-foreground-subtle">{{ theKpi.sub }}</div>
               </div>
            </div>

            <GroupTitle icon="home" :label="$gettext('Transaction et financement')" />
            <ez-info-list :items="sale.financing" tiles />
            <FlagList :flags="sale.flags" />
         </div>
      </ez-card>
   </section>

   <section id="v-dates" data-anchor="v-dates" class="scroll-mt-28 md:scroll-mt-20">
      <ez-card :title="$gettext('Échéancier et notaires')">
         <div class="flex flex-col gap-2">
            <SaleTimeline :steps="sale.timeline" />
            <ez-info-list :items="sale.notaries" tiles />
         </div>
      </ez-card>
   </section>

   <section id="v-cond" data-anchor="v-cond" class="scroll-mt-28 md:scroll-mt-20">
      <ez-card :title="$gettext('Conditions, protections et suivi')">
         <div class="flex flex-col gap-2">
            <GroupTitle icon="check" :label="$gettext('À traiter')" />
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
               <StatTile v-for="theStat in sale.followUp" :key="theStat.label" :stat="theStat" clickable />
            </div>
            <div class="flex items-center gap-2 text-xs text-foreground-muted">
               {{ $gettext('Validation direction · admin.') }}
               <ez-badge :label="$gettext('Non demandée')" />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
               <div class="flex flex-col gap-2">
                  <GroupTitle icon="filter" :label="$gettext('Conditions')" />
                  <FlagList :flags="[{ on: false, label: $gettext('Vente non conditionnelle') }]" class="sm:grid-cols-1" />
                  <ez-info-list :items="theConditions" tiles />
               </div>

               <div class="flex flex-col gap-2">
                  <GroupTitle icon="success" :label="$gettext('Protections')" />
                  <TileBox :label="$gettext('Tranquilli-T')">
                     <div class="flex flex-wrap gap-2">
                        <ez-badge :label="$gettext('Non admissible')" />
                        <ez-badge :label="$gettext('Vendeur non couvert')" />
                        <ez-badge :label="$gettext('Acheteur non couvert')" />
                     </div>
                     <div class="text-xs text-foreground-subtle">{{ $gettext('Note du courtier · —') }}</div>
                  </TileBox>
                  <TileBox :label="$gettext('Protection domiciliaire')">
                     <div class="flex flex-wrap gap-2">
                        <ez-badge :label="$gettext('Non admissible')" />
                     </div>
                     <div class="text-xs text-foreground-subtle">{{ $gettext('Commentaire · —') }}</div>
                  </TileBox>
               </div>
            </div>
         </div>
      </ez-card>
   </section>

   <section id="v-retrib" data-anchor="v-retrib" class="scroll-mt-28 md:scroll-mt-20">
      <ez-card :title="$gettext('Rétributions')">
         <div class="flex flex-col gap-2">
            <DataPanel v-for="thePanel in sale.commissionPanels" :key="thePanel.title" :panel="thePanel" addable />
            <EmptySlots :items="sale.commissionEmpty" />
         </div>
      </ez-card>
   </section>

   <section id="v-parties" data-anchor="v-parties" class="scroll-mt-28 md:scroll-mt-20">
      <ez-card :title="$gettext('Parties, dossiers et finances')">
         <div class="flex flex-col gap-2">
            <DataPanel v-for="thePanel in sale.partyPanels" :key="thePanel.title" :panel="thePanel" addable />
            <EmptySlots :items="sale.partyEmpty" />
            <StatTile :stat="{ label: $gettext('Sommaire des activités bancaires · Solde'), value: sale.balance }" />
         </div>
      </ez-card>
   </section>

   <section id="v-conclusion" data-anchor="v-conclusion" class="scroll-mt-28 md:scroll-mt-20">
      <ez-card :title="$gettext('Conclusion de la vente')">
         <template #actions>
            <span class="text-xs text-foreground-muted">
               {{ $gettext('Conclue le') }} <strong class="text-foreground">{{ formatDate(sale.concludedAt) }}</strong>
            </span>
         </template>

         <div class="flex flex-col gap-2">
            <DataPanel v-for="thePanel in sale.paymentPanels" :key="thePanel.title" :panel="thePanel" />
            <!-- The foot of the card: set apart from its content -->
            <div class="mt-4 flex justify-end">
               <code class="rounded-sm border border-border px-2 py-1 font-mono text-xs text-foreground-muted">pkiVenteID: {{ sale.id }}</code>
            </div>
         </div>
      </ez-card>
   </section>
</template>

<script setup lang="ts">
import { formatDate, gettext, type EzInfoItem } from '@ez'
import type { Sale } from '../mocks'
import DataPanel from './DataPanel.vue'
import EzBadge from './EzBadge.vue'
import EmptySlots from './EmptySlots.vue'
import EzInfoList from './EzInfoList.vue'
import FlagList from './FlagList.vue'
import GroupTitle from './GroupTitle.vue'
import SaleTimeline from './SaleTimeline.vue'
import StatTile from './StatTile.vue'
import TileBox from './TileBox.vue'

defineProps<{ sale: Sale }>()

const theConditions: EzInfoItem[] = [
   { label: gettext("Date d'échéance · Conditions remplies le"), value: '—' },
   { label: gettext("# Promesse d'achat"), value: '—' },
]
</script>
