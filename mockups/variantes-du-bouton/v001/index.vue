<template>
   <ez-page>
      <ez-page-header
         :title="$gettext('Variantes du bouton')"
         :subtitle="$gettext('ez-btn rehaussé: prop outline, comparée aux variantes et aux états existants')"
      />
      <ez-page-content>
         <div class="flex flex-col gap-4">
            <ez-card v-for="size in sizes" :key="size.key" :title="size.title" :subtitle="size.subtitle">
               <template #actions>
                  <ez-btn
                     variant="flat"
                     size="sm"
                     icon="refresh"
                     :label="$gettext('Simuler un chargement')"
                     :loading="theUI.$loadings.isDemo"
                     @click="onSimulateLoading"
                  />
               </template>

               <div class="btn-grid">
                  <div class="btn-grid__matrix">
                     <div class="btn-grid__row btn-grid__row--head">
                        <span>{{ $gettext('Variante') }}</span>
                        <span v-for="state in states" :key="state.key" class="flex flex-col items-start gap-1">
                           {{ state.label }}
                           <ez-badge v-if="state.isOutline" tone="info" :label="$gettext('Contour')" />
                        </span>
                     </div>

                     <div v-for="sample in theData.samples" :key="sample.variant" class="btn-grid__row">
                        <span class="flex flex-col">
                           <code class="text-sm font-semibold text-foreground">{{ sample.variant }}</code>
                           <span class="text-xs text-foreground-muted">{{ sample.usage }}</span>
                        </span>
                        <span v-for="state in states" :key="state.key">
                           <ez-btn
                              :variant="sample.variant"
                              :size="size.key"
                              :label="state.isIconOnly ? undefined : sample.label"
                              :icon="state.hasIcon ? sample.icon : undefined"
                              :aria-label="state.isIconOnly ? sample.label : undefined"
                              :outline="state.isOutline"
                              :pill="state.isPill"
                              :disabled="state.isDisabled"
                              :loading="state.isLoading || (state.isDemo && theUI.$loadings.isDemo)"
                           />
                        </span>
                     </div>
                  </div>
               </div>
            </ez-card>

            <ez-card :title="$gettext('Mise en situation')" :subtitle="$gettext('Un contour à côté d’un bouton plein du même sens')">
               <p class="m-0 text-sm text-foreground-muted">
                  {{ $gettext('Le dossier est prêt. Vous pouvez l’envoyer maintenant ou enregistrer un brouillon.') }}
               </p>
               <template #footer>
                  <ez-btn as="a" href="#" variant="flat" icon="eye" :label="$gettext('Aperçu (lien)')" />
                  <ez-btn variant="danger" icon="delete" :label="$gettext('Supprimer')" />
                  <ez-btn variant="primary" outline :label="$gettext('Enregistrer le brouillon')" />
                  <ez-btn variant="primary" icon="send" :label="$gettext('Envoyer')" />
               </template>
            </ez-card>
         </div>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { gettext, useScenario } from '@ez'
import EzBtn from './components/EzBtn.vue'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)

const sizes = [
   { key: 'md' as const, title: gettext('Taille md'), subtitle: gettext('La taille par défaut: pages, cartes, dialogues') },
   { key: 'sm' as const, title: gettext('Taille sm'), subtitle: gettext('Dans un tableau, une barre d’outils, l’en-tête d’une carte') },
]

/** The columns of the grid: each one sets a few props on every variant */
const states = [
   { key: 'default', label: gettext('Normal'), hasIcon: true, isDemo: true },
   { key: 'outline', label: gettext('Normal'), hasIcon: true, isOutline: true, isDemo: true },
   { key: 'pill', label: gettext('Pilule'), isPill: true },
   { key: 'pill-outline', label: gettext('Pilule'), isPill: true, isOutline: true },
   { key: 'icon-only', label: gettext('Icône seule'), hasIcon: true, isIconOnly: true },
   { key: 'icon-only-outline', label: gettext('Icône seule'), hasIcon: true, isIconOnly: true, isOutline: true },
   { key: 'disabled', label: gettext('Désactivé'), hasIcon: true, isDisabled: true },
   { key: 'disabled-outline', label: gettext('Désactivé'), hasIcon: true, isDisabled: true, isOutline: true },
   { key: 'loading', label: gettext('Chargement'), isLoading: true },
   { key: 'loading-outline', label: gettext('Chargement'), isLoading: true, isOutline: true },
]

const theUI = reactive({ $loadings: { isDemo: false } })

function onSimulateLoading() {
   theUI.$loadings.isDemo = true
   setTimeout(() => {
      theUI.$loadings.isDemo = false
   }, 1500)
}
</script>

<style scoped>
/* A comparison grid: no ez- component lays out a matrix of samples */
.btn-grid {
   overflow-x: auto;
}

.btn-grid__matrix {
   display: grid;
   grid-template-columns: minmax(12rem, 1fr) repeat(10, max-content);
   column-gap: var(--space-gap-md);
   width: max-content;
   min-width: 100%;
}

.btn-grid__row {
   display: grid;
   grid-column: 1 / -1;
   grid-template-columns: subgrid;
   align-items: center;
   padding-block: var(--space-inset-sm);
   border-bottom: 1px solid var(--color-border-muted);

   &:last-child {
      border-bottom: none;
   }
}

.btn-grid__row--head {
   font-size: var(--text-xs);
   font-weight: 600;
   color: var(--color-foreground-muted);
}
</style>
