<template>
   <ez-page>
      <ez-page-header title="Galerie ez-" subtitle="Composants disponibles pour les prototypes — voir blueprint/ez/CATALOG.md" />
      <ez-page-content>
         <ez-page-sections>
            <ez-page-section id="tokens" title="Tokens sémantiques">
               <ez-card title="Couleurs" toc-id="tokens-colors">
                  <div class="gallery__swatches">
                     <div v-for="theToken in colorTokens" :key="theToken" class="gallery__swatch">
                        <span class="gallery__chip" :style="{ background: `var(--color-${theToken})` }" />
                        <code>{{ theToken }}</code>
                     </div>
                  </div>
               </ez-card>
               <ez-card title="Typographie" toc-id="tokens-type">
                  <div class="flex flex-col gap-2">
                     <p v-for="theSize in textSizes" :key="theSize" class="m-0" :class="`text-${theSize}`">
                        text-{{ theSize }} — Dossier de signature
                     </p>
                  </div>
               </ez-card>
            </ez-page-section>

            <ez-page-section id="actions" title="Actions">
               <ez-card title="ez-btn" toc-id="actions-btn">
                  <div class="flex flex-wrap items-center gap-2">
                     <ez-btn variant="primary" label="Primaire" icon="send" />
                     <ez-btn label="Secondaire" />
                     <ez-btn variant="flat" label="Flat" icon="add" />
                     <ez-btn variant="danger" label="Supprimer" icon="delete" />
                     <ez-btn icon="more" aria-label="Plus d'actions" />
                     <ez-btn variant="primary" label="Chargement" loading />
                     <ez-btn label="Désactivé" disabled />
                     <ez-btn size="sm" label="Petit" />
                  </div>
               </ez-card>
               <ez-card title="ez-badge" toc-id="actions-badge">
                  <div class="flex flex-wrap gap-2">
                     <ez-badge v-for="theTone in tones" :key="theTone" :tone="theTone" :label="theTone" />
                     <ez-badge tone="success" dot label="Avec point" />
                  </div>
                  <p class="m-0 mt-3 mb-2 text-sm text-foreground-muted">Statut d'un dossier: <code>:tone="folder.stateTone()" :label="folder.stateLabel()"</code></p>
                  <div class="flex flex-wrap gap-2">
                     <ez-badge v-for="theFolder in rows" :key="theFolder.id" :tone="theFolder.stateTone()" :label="theFolder.stateLabel()" />
                  </div>
               </ez-card>
            </ez-page-section>

            <ez-page-section id="feedback" title="Messages et états">
               <ez-card title="ez-message-important" toc-id="feedback-message">
                  <div class="flex flex-col gap-3">
                     <ez-message-important type="info" title="Info">Le dossier sera envoyé aux signataires.</ez-message-important>
                     <ez-message-important type="success">Rappel envoyé à 2 signataires.</ez-message-important>
                     <ez-message-important type="warning" title="Expire bientôt">
                        Ce dossier expire dans 2 jours.
                        <template #actions><ez-btn size="sm" label="Prolonger" /></template>
                     </ez-message-important>
                     <ez-message-important type="danger">Un signataire a refusé de signer.</ez-message-important>
                  </div>
               </ez-card>
               <ez-card title="ez-empty-state" toc-id="feedback-empty" flush>
                  <ez-empty-state title="Aucun dossier" text="Les dossiers que vous créez apparaîtront ici." icon="folder">
                     <template #actions><ez-btn variant="primary" icon="add" label="Créer un dossier" /></template>
                  </ez-empty-state>
               </ez-card>
            </ez-page-section>

            <ez-page-section id="forms" title="Formulaires">
               <ez-card title="ez-field" toc-id="forms-field">
                  <ez-layout>
                     <ez-layout-col :cols="{ base: 12, md: 6 }">
                        <ez-field v-model="theForm.name" label="Nom du dossier" required hint="Visible par les signataires" />
                     </ez-layout-col>
                     <ez-layout-col :cols="{ base: 12, md: 6 }">
                        <ez-field v-model="theForm.email" label="Courriel" type="email" icon="mail" error="Adresse invalide" />
                     </ez-layout-col>
                     <ez-layout-col :cols="{ base: 12, md: 6 }">
                        <ez-field v-model="theForm.lang" label="Langue" type="select" :options="languages" />
                     </ez-layout-col>
                     <ez-layout-col :cols="{ base: 12, md: 6 }">
                        <ez-field v-model="theForm.due" label="Échéance" type="date" />
                     </ez-layout-col>
                     <ez-layout-col>
                        <ez-field v-model="theForm.message" label="Message aux signataires" type="textarea" />
                     </ez-layout-col>
                  </ez-layout>
               </ez-card>
            </ez-page-section>

            <ez-page-section id="data" title="Données">
               <ez-card title="ez-table" toc-id="data-table" flush>
                  <ez-table :columns="columns" :rows="rows" clickable>
                     <template #cell-state="{ row }">
                        <ez-badge :tone="row.stateTone()" :label="row.stateLabel()" />
                     </template>
                     <template #cell-dueAt="{ row }">{{ formatDate(row.dueAt) }}</template>
                  </ez-table>
               </ez-card>
               <ez-card title="ez-info-list" toc-id="data-info">
                  <ez-layout>
                     <ez-layout-col :cols="{ base: 12, md: 6 }">
                        <ez-info-list :items="infoItems" />
                     </ez-layout-col>
                     <ez-layout-col :cols="{ base: 12, md: 6 }">
                        <ez-info-list :items="infoItems" inline />
                     </ez-layout-col>
                  </ez-layout>
               </ez-card>
            </ez-page-section>

            <ez-page-section id="overlays" title="Overlays">
               <ez-card title="ez-dialog" toc-id="overlays-dialog">
                  <ez-btn label="Ouvrir le dialog" @click="isDialogOpen = true" />
                  <ez-dialog v-model="isDialogOpen" title="Annuler le dossier?">
                     Les signataires ne pourront plus signer. Cette action est irréversible.
                     <template #actions>
                        <ez-btn variant="flat" label="Garder le dossier" @click="isDialogOpen = false" />
                        <ez-btn variant="danger" label="Annuler le dossier" @click="isDialogOpen = false" />
                     </template>
                  </ez-dialog>
               </ez-card>
            </ez-page-section>

            <!-- Automatic: every catalog component the sections above don't show, with its example when it has one -->
            <ez-page-section v-if="theOtherComponents.length" id="others" title="Autres composants" subtitle="Automatique: les composants du catalogue absents des sections ci-dessus, avec leur exemple (ez-….example.vue, à côté du composant)">
               <ez-card v-for="theComponent in theOtherComponents" :key="theComponent.tag" :title="theComponent.tag" :subtitle="theComponent.object ?? theComponent.tier" :toc-id="`others-${theComponent.tag}`">
                  <component :is="theComponent.example" v-if="theComponent.example" />
                  <p v-else class="m-0 text-sm text-foreground-muted">Pas encore d'exemple: {{ theComponent.file.replace(/\.vue$/, '.example.vue') }}</p>
               </ez-card>
            </ez-page-section>
         </ez-page-sections>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { reactive, ref, type Component } from 'vue'
import { formatDate, type EzTableColumn } from '@ez'
import { makeFolders } from '@mocks'
import catalog from '@ez/catalog.json'
import gallerySource from './GalleryPage.vue?raw'

// Gallery demos live next to their component: components/reveal/ez-reveal.example.vue (mockup promote creates one).
// A relative glob, like registry.ts: an alias resolves to the real path, which may sit on another drive
// than the checkout (C:\…\git → G:\…), and Vite cannot write a relative import across drives.
const examples = import.meta.glob<Component>('../../blueprint/ez/components/**/*.example.vue', { eager: true, import: 'default' })
const exampleOf = (tag: string) => Object.entries(examples).find(([path]) => path.endsWith(`/${tag}.example.vue`))?.[1]

// Components this page already shows by hand (any <ez-… tag in its own template) are not repeated
const shownByHand = new Set(gallerySource.match(/<ez-[a-z-]+/g)?.map((tag) => tag.slice(1)))
const theOtherComponents = catalog.components
   .filter((component) => !shownByHand.has(component.tag))
   .map((component) => ({ ...component, object: 'object' in component ? String(component.object) : null, example: exampleOf(component.tag) }))

const colorTokens = [
   'background', 'surface', 'surface-muted', 'surface-inverse',
   'foreground', 'foreground-muted', 'foreground-subtle', 'border', 'border-muted', 'border-strong',
   'accent', 'surface-accent', 'positive', 'surface-positive', 'negative', 'surface-negative',
   'warning', 'surface-warning', 'info', 'surface-info',
]
const textSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl']
const tones = ['neutral', 'info', 'success', 'warning', 'danger', 'action'] as const
const languages = [{ label: 'Français', value: 'fr' }, { label: 'English', value: 'en' }]

const theForm = reactive({ name: 'Bail commercial', email: 'marie@', lang: 'fr', due: '2026-11-20', message: '' })
const isDialogOpen = ref(false)

const columns: EzTableColumn[] = [
   { key: 'name', label: 'Dossier' },
   { key: 'state', label: 'Statut' },
   { key: 'owner', label: 'Propriétaire' },
   { key: 'dueAt', label: 'Échéance', align: 'right' },
]
const rows = makeFolders(4)

const infoItems = [
   { label: 'Créé le', value: '28 oct. 2026' },
   { label: 'Propriétaire', value: 'Marie Tremblay' },
   { label: 'Signataires', value: '3' },
]
</script>

<style scoped>
.gallery__swatches {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
   gap: 12px;
}

.gallery__swatch {
   display: flex;
   align-items: center;
   gap: 8px;
   font-size: var(--text-xs);
}

.gallery__chip {
   width: 28px;
   height: 28px;
   border: 1px solid var(--color-border);
   border-radius: var(--radius-md);
}
</style>
