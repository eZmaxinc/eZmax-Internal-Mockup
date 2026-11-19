<template>
   <ez-card :toc-id="`sale-${sale.id}-apercu`" :title="$gettext('Aperçu')">
      <template #actions>
         <ez-badge v-for="theCounter in sale.counters" :key="theCounter.label" as="a" href="#" outline @click.prevent>
            <span class="flex items-center gap-1"><ez-icon :name="theCounter.icon" :size="14" />{{ theCounter.label }}</span>
         </ez-badge>
         <ez-badge :tone="sale.stateTone" :label="sale.stateLabel" />
      </template>

      <div class="flex flex-col gap-5">
         <!-- The key figures: no ez-info element for a big number with its line of context -->
         <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="theKpi in sale.kpis" :key="theKpi.label" class="kpi" :class="{ 'kpi--total': theKpi.isTotal }">
               <div class="text-xs text-foreground-muted">{{ theKpi.label }}</div>
               <div class="text-lg font-bold">{{ theKpi.value }}</div>
               <div class="text-xs text-foreground-subtle">{{ theKpi.sub }}</div>
            </div>
         </div>

         <ez-info :data="theFinancing" />
      </div>
   </ez-card>

   <ez-card :toc-id="`sale-${sale.id}-dates`" :title="$gettext('Échéancier et notaires')">
      <div class="flex flex-col gap-5">
         <SaleTimeline :steps="sale.timeline" />
         <ez-info :data="theNotaries" />
      </div>
   </ez-card>

   <ez-card :toc-id="`sale-${sale.id}-cond`" :title="$gettext('Conditions, protections et suivi')">
      <div class="flex flex-col gap-5">
         <div class="flex flex-col gap-2">
            <ez-info :data="theToDo" />
            <div class="flex items-center gap-2 text-xs text-foreground-muted">
               {{ $gettext('Validation direction · admin.') }}
               <ez-badge :label="$gettext('Non demandée')" />
            </div>
         </div>

         <div class="grid gap-5 md:grid-cols-2">
            <ez-info :data="theConditions" />
            <ez-info :data="theProtections" />
         </div>
      </div>
   </ez-card>

   <ez-card :toc-id="`sale-${sale.id}-retrib`" :title="$gettext('Rétributions')">
      <div class="flex flex-col gap-2">
         <DataPanel v-for="thePanel in sale.commissionPanels" :key="thePanel.title" :panel="thePanel" addable />
         <EmptySlots :items="sale.commissionEmpty" />
      </div>
   </ez-card>

   <ez-card :toc-id="`sale-${sale.id}-parties`" :title="$gettext('Parties, dossiers et finances')">
      <div class="flex flex-col gap-2">
         <DataPanel v-for="thePanel in sale.partyPanels" :key="thePanel.title" :panel="thePanel" addable />
         <EmptySlots :items="sale.partyEmpty" />
         <ez-info :data="theBalance" />
      </div>
   </ez-card>

   <ez-card :toc-id="`sale-${sale.id}-conclusion`" :title="$gettext('Conclusion de la vente')">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, gettext, type IInfoCategory } from '@ez'
import type { Sale } from '../mocks'
import DataPanel from './DataPanel.vue'
import EzBadge from './EzBadge.vue'
import EmptySlots from './EmptySlots.vue'
import SaleTimeline from './SaleTimeline.vue'
import { flagsOf, statsOf, tilesOf } from './info'

const props = defineProps<{ sale: Sale }>()

const theFinancing = computed<IInfoCategory[]>(() => [
   {
      name: 'financing',
      title: gettext('Transaction et financement'),
      items: [...tilesOf('financing', props.sale.financing), flagsOf('flags', props.sale.flags)],
   },
])

const theNotaries = computed<IInfoCategory[]>(() => [{ name: 'notaries', items: tilesOf('notaries', props.sale.notaries) }])

const theToDo = computed<IInfoCategory[]>(() => [
   { name: 'to-do', title: gettext('À traiter'), items: statsOf('follow-up', props.sale.followUp, { col: { xs: 12, sm: 6, lg: 4 }, isLink: true }) },
])

const theConditions = computed<IInfoCategory[]>(() => [
   {
      name: 'conditions',
      title: gettext('Conditions'),
      items: [
         flagsOf('conditional', [{ on: false, label: gettext('Vente non conditionnelle') }]),
         { key: 'conditions-met', label: gettext("Date d'échéance · Conditions remplies le"), value: '—', col: { xs: 12, sm: 6 } },
         { key: 'promise', label: gettext("# Promesse d'achat"), value: '—', col: { xs: 12, sm: 6 } },
      ],
   },
])

// The coverages are plain facts: neutral pills; the note of each beside it (a tile with pills shows no hint)
const theProtections = computed<IInfoCategory[]>(() => [
   {
      name: 'protections',
      title: gettext('Protections'),
      items: [
         {
            key: 'tranquilli-t',
            label: gettext('Tranquilli-T'),
            value: [{ label: gettext('Non admissible') }, { label: gettext('Vendeur non couvert') }, { label: gettext('Acheteur non couvert') }],
            col: 12,
         },
         { key: 'tranquilli-t-note', label: gettext('Note du courtier'), value: '—', col: 12 },
         {
            key: 'home-protection',
            label: gettext('Protection domiciliaire'),
            value: [{ label: gettext('Non admissible') }],
            col: 12,
         },
         { key: 'home-protection-comment', label: gettext('Commentaire'), value: '—', col: 12 },
      ],
   },
])

const theBalance = computed<IInfoCategory[]>(() => [
   { name: 'balance', items: statsOf('balance', [{ label: gettext('Sommaire des activités bancaires · Solde'), value: props.sale.balance }], { col: 12 }) },
])
</script>

<style scoped>
/* A key figure: the neutral tile of ez-info, the positive tint for the total */
.kpi {
   --kpi-surface: color-mix(in srgb, var(--color-foreground-subtle) 4%, var(--color-surface));
   --kpi-border: color-mix(in srgb, var(--color-foreground-subtle) 15%, transparent);

   padding: var(--space-gap-sm) var(--space-inset-sm);
   border: 1px solid var(--kpi-border);
   border-radius: var(--radius-md);
   background: var(--kpi-surface);
}

.kpi--total {
   --kpi-surface: var(--color-surface-positive);
   --kpi-border: color-mix(in srgb, var(--color-positive) 28%, transparent);
}
</style>
