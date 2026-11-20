<template>
   <ez-page>
      <ez-page-header :title="theData.folder.name" :breadcrumbs="[$gettext('Accueil'), $gettext('Dossiers eZsign'), $gettext('Informations du dossier')]" refresh @refresh="onRefresh">
         <template #actions>
            <!-- Production: the access menu, for developers only -->
            <ez-btn-dropdown v-if="theData.hasDevAccess" :label="theData.access" icon="eye" variant="primary" outline pill align="left">
               <ez-menu-action-item
                  v-for="level in ACCESS_LEVELS"
                  :key="level"
                  :label="level"
                  :active="level === theData.access"
                  @click="onChooseAccess(level)"
               />
            </ez-btn-dropdown>

            <ez-btn-dropdown :label="$gettext('Actions du dossier')" variant="positive" pill align="right">
               <ez-menu-action-item icon="edit" :label="$gettext('Modifier les informations du dossier eZsign')" @click="onAction($gettext('Modifier'))" />
               <ez-menu-action-item icon="inbox" :label="theData.isArchived ? $gettext('Désarchiver le dossier eZsign') : $gettext('Archiver le dossier eZsign')" @click="onArchive" />
               <ez-menu-action-item icon="file" :label="$gettext('Copier le dossier eZsign')" separator @click="onAction($gettext('Copier'))" />
               <ez-menu-action-item icon="delete" :label="$gettext('Supprimer le dossier eZsign')" danger :disabled="!theData.folder.isStateDraft()" @click="onAction($gettext('Supprimer'))" />
            </ez-btn-dropdown>
         </template>
      </ez-page-header>

      <ez-page-content>
         <ez-layout>
            <ez-layout-col :span="{ xs: 12, md: 8 }">
               <ez-card :title="$gettext('Variantes du déclencheur')" :subtitle="$gettext('Les variantes de ez-btn, pleines puis en contour. Chaque bouton ouvre le même menu.')">
                  <div class="demo-grid || grid gap-4">
                     <div v-for="variant in VARIANTS" :key="variant" class="flex flex-wrap items-center gap-3">
                        <span class="demo-grid__name || text-sm text-foreground-muted">{{ variant }}</span>
                        <ez-btn-dropdown :label="$gettext('Actions')" :variant="variant">
                           <ez-menu-action-item v-for="item in SAMPLE_ITEMS" :key="item.label" v-bind="item" @click="onAction(item.label)" />
                        </ez-btn-dropdown>
                        <ez-btn-dropdown v-if="variant !== 'danger'" :label="$gettext('Actions')" :variant="variant" outline>
                           <ez-menu-action-item v-for="item in SAMPLE_ITEMS" :key="item.label" v-bind="item" @click="onAction(item.label)" />
                        </ez-btn-dropdown>
                        <ez-btn-dropdown :label="$gettext('Actions')" :variant="variant" pill>
                           <ez-menu-action-item v-for="item in SAMPLE_ITEMS" :key="item.label" v-bind="item" @click="onAction(item.label)" />
                        </ez-btn-dropdown>
                     </div>
                  </div>
               </ez-card>
            </ez-layout-col>

            <ez-layout-col :span="{ xs: 12, md: 4 }" first-below-md>
               <ez-card :title="$gettext('Cas particuliers')">
                  <div class="grid gap-4">
                     <div class="flex flex-wrap items-center gap-3">
                        <ez-btn-dropdown :label="$gettext('Petit')" size="sm">
                           <ez-menu-action-item v-for="item in SAMPLE_ITEMS" :key="item.label" v-bind="item" @click="onAction(item.label)" />
                        </ez-btn-dropdown>
                        <ez-btn-dropdown :label="$gettext('Avec icône')" icon="settings">
                           <ez-menu-action-item v-for="item in SAMPLE_ITEMS" :key="item.label" v-bind="item" @click="onAction(item.label)" />
                        </ez-btn-dropdown>
                        <ez-btn-dropdown :label="$gettext('Désactivé')" disabled />
                     </div>
                     <div class="flex justify-end">
                        <ez-btn-dropdown :label="$gettext('Aligné à droite')" align="right">
                           <ez-menu-action-item v-for="item in SAMPLE_ITEMS" :key="item.label" v-bind="item" @click="onAction(item.label)" />
                        </ez-btn-dropdown>
                     </div>
                     <ez-info :data="[{ name: 'last', items: [{ key: 'last', label: $gettext('Dernière action'), value: theUI.$lastAction || $gettext('Aucune'), col: 12 }] }]" />
                  </div>
               </ez-card>
            </ez-layout-col>
         </ez-layout>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { gettext, useScenario } from '@ez'
import { ACCESS_LEVELS, scenarios, type AccessLevel } from './mocks'
import EzBtnDropdown from './components/EzBtnDropdown.vue'
import EzMenuActionItem from './components/EzMenuActionItem.vue'

const theData = useScenario(scenarios)

const VARIANTS = ['positive', 'primary', 'secondary', 'flat', 'danger'] as const

/** Every state of a menu item: icon, separator, disabled, destructive */
const SAMPLE_ITEMS = [
   { label: gettext('Modifier'), icon: 'edit' },
   { label: gettext('Envoyer'), icon: 'send' },
   { label: gettext('Télécharger'), icon: 'download', separator: true },
   { label: gettext('Indisponible'), icon: 'clock', disabled: true },
   { label: gettext('Supprimer'), icon: 'delete', danger: true },
] as const

const theUI = reactive({ $lastAction: '' })

function onAction(label: string) {
   theUI.$lastAction = label
}

function onChooseAccess(level: AccessLevel) {
   theData.value.access = level
   onAction(gettext('Accès: %{level}').replace('%{level}', level))
}

function onArchive() {
   theData.value.isArchived = !theData.value.isArchived
   onAction(theData.value.isArchived ? gettext('Archivé') : gettext('Désarchivé'))
}

function onRefresh() {
   onAction(gettext('Actualiser'))
}
</script>

<style scoped>
.demo-grid__name {
   width: 6rem;
}
</style>
