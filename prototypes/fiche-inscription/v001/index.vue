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
         <!-- Below md: one sticky line that says where we are and unfolds the navigation -->
         <InscriptionNavCompact class="mb-4 md:hidden" :groups="theNavGroups" :open-key="theOpenKey" :active-id="theUI.activeAnchor" @pick-group="onPickGroup" @pick-item="onPickItem" />

         <!-- A plain row rather than ez-layout: the right column disappears below md and never grows past its max width -->
         <div class="gap-4 md:flex md:items-start">
            <div ref="theSectionsRef" class="flex min-w-0 flex-1 flex-col gap-4">
               <InscriptionSections :inscription="theInscription" />

               <template v-if="theSale">
                  <div class="pt-2 text-center text-xs font-semibold tracking-wide text-foreground-muted uppercase">
                     {{ $gettext('Vente %{id}', { id: theSale.id }) }}
                  </div>
                  <SaleSections :key="theSale.id" :sale="theSale" />
               </template>

               <ez-card v-else>
                  <ez-empty-state :title="$gettext('Aucune vente')" :text="$gettext('Cette inscription n\'a pas encore de vente.')" :icon="ez.icons.file">
                     <template #actions>
                        <ez-btn variant="primary" :icon="ez.icons.add" :label="$gettext('Ajouter une vente')" />
                     </template>
                  </ez-empty-state>
               </ez-card>
            </div>

            <!-- From md: the navigation on the right, stuck under the app toolbar -->
            <div class="nav-column hidden shrink-0 md:sticky md:top-20 md:block md:w-1/4">
               <InscriptionNav :groups="theNavGroups" :open-key="theOpenKey" :active-id="theUI.activeAnchor" @pick-group="onPickGroup" @pick-item="onPickItem" />
            </div>
         </div>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, useTemplateRef } from 'vue'
import { gettext, useScenario } from '@ez'
import InscriptionNav, { type NavGroup } from './components/InscriptionNav.vue'
import InscriptionNavCompact from './components/InscriptionNavCompact.vue'
import InscriptionSections from './components/InscriptionSections.vue'
import SaleSections from './components/SaleSections.vue'
import { scenarios } from './mocks'

const INSCRIPTION_KEY = 'inscription'
const FIRST_SALE_ANCHOR = 'v-apercu'
const SPY_OFFSET = 160 // px from the top of the window under which a section counts as reached
const SCROLL_LOCK_MS = 700 // the spy stays quiet while a click scrolls the page

const theData = useScenario(scenarios)
const theSectionsRef = useTemplateRef<HTMLElement>('theSectionsRef')

const theUI = reactive({ activeAnchor: 'ins-info', saleIndex: 0, isScrollLocked: false })

const theInscription = computed(() => theData.value.inscription)
const theSale = computed(() => theInscription.value.sales[theUI.saleIndex] ?? theInscription.value.sales[0])

// The group whose items show in the navigation: the inscription, or the sale on screen
const theOpenKey = computed(() => (theUI.activeAnchor.startsWith('ins-') ? INSCRIPTION_KEY : saleKey(theUI.saleIndex)))

const theNavGroups = computed<NavGroup[]>(() => [
   {
      key: INSCRIPTION_KEY,
      label: gettext('Inscription #%{id}', { id: theInscription.value.id }),
      icon: 'home',
      items: [
         { id: 'ins-info', label: gettext('Informations') },
         { id: 'ins-statut', label: gettext('Statut et suivi') },
         { id: 'ins-parties', label: gettext('Parties et dossiers') },
         { id: 'ins-fin', label: gettext('Finances') },
      ],
   },
   ...theInscription.value.sales.map((sale, index) => ({
      key: saleKey(index),
      label: gettext('Vente %{id}', { id: sale.id }),
      icon: 'file' as const,
      items: [
         { id: FIRST_SALE_ANCHOR, label: gettext('Aperçu') },
         { id: 'v-dates', label: gettext('Échéancier') },
         { id: 'v-cond', label: gettext('Conditions et suivi') },
         { id: 'v-retrib', label: gettext('Rétributions') },
         { id: 'v-parties', label: gettext('Parties et finances') },
         { id: 'v-conclusion', label: gettext('Conclusion') },
      ],
   })),
])

function saleKey(index: number) {
   return `sale-${index}`
}

function scrollToAnchor(id: string) {
   const theTarget = theSectionsRef.value?.querySelector(`[data-anchor="${id}"]`)
   if (!theTarget) return
   theUI.isScrollLocked = true
   theUI.activeAnchor = id
   theTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
   setTimeout(() => (theUI.isScrollLocked = false), SCROLL_LOCK_MS)
}

async function onPickGroup(key: string) {
   if (key === INSCRIPTION_KEY) return scrollToAnchor('ins-info')
   theUI.saleIndex = Number(key.replace('sale-', ''))
   await nextTick() // the sections of the chosen sale are on the page
   scrollToAnchor(FIRST_SALE_ANCHOR)
}

function onPickItem(id: string) {
   scrollToAnchor(id)
}

function onScroll() {
   if (theUI.isScrollLocked || !theSectionsRef.value) return
   let theCurrent = 'ins-info'
   theSectionsRef.value.querySelectorAll<HTMLElement>('[data-anchor]').forEach((section) => {
      if (section.getBoundingClientRect().top < SPY_OFFSET) theCurrent = section.dataset.anchor ?? theCurrent
   })
   theUI.activeAnchor = theCurrent
}

onMounted(() => window.addEventListener('scroll', onScroll, true)) // capture: whichever element scrolls
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll, true))
</script>

<style scoped>
.nav-column {
   --nav-column-max-width: 275px;

   max-width: var(--nav-column-max-width);
}
</style>
