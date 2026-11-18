<template>
   <div class="compact-nav">
      <div class="compact-nav__bar">
         <span class="flex-1 truncate text-sm">
            <strong class="font-semibold">{{ theOpenGroup?.label }}</strong>
            <template v-if="theActiveItem"> - {{ theActiveItem.label }}</template>
         </span>
         <ez-btn
            variant="flat"
            size="sm"
            :icon="theUI.isOpen ? 'close' : 'chevronDown'"
            :aria-label="theUI.isOpen ? $gettext('Fermer la navigation') : $gettext('Ouvrir la navigation')"
            :aria-expanded="theUI.isOpen"
            @click="onToggle"
         />
      </div>

      <template v-if="theUI.isOpen">
         <!-- A click anywhere else closes the panel -->
         <div class="fixed inset-0" @click="onClose" />
         <div class="compact-nav__panel">
            <InscriptionNav :groups="groups" :open-key="openKey" :active-id="activeId" @pick-group="onPickGroup" @pick-item="onPickItem" />
         </div>
      </template>
   </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import InscriptionNav, { type NavGroup } from './InscriptionNav.vue'

const props = defineProps<{ groups: NavGroup[]; openKey: string; activeId: string }>()

const emit = defineEmits<{ 'pick-group': [key: string]; 'pick-item': [id: string] }>()

const theUI = reactive({ isOpen: false })

const theOpenGroup = computed(() => props.groups.find((group) => group.key === props.openKey))
const theActiveItem = computed(() => theOpenGroup.value?.items.find((item) => item.id === props.activeId))

function onToggle() {
   theUI.isOpen = !theUI.isOpen
}

function onClose() {
   theUI.isOpen = false
}

// A group only unfolds its items: the panel stays open to pick one
function onPickGroup(key: string) {
   emit('pick-group', key)
}

function onPickItem(id: string) {
   theUI.isOpen = false
   emit('pick-item', id)
}
</script>

<style scoped>
.compact-nav {
   --compact-nav-top: calc(var(--sizing-toolbar-height, var(--size-control-md)) + var(--space-gap-sm));

   position: sticky;
   top: var(--compact-nav-top);
   z-index: 20;
}

.compact-nav__bar {
   position: relative;
   display: flex;
   align-items: center;
   gap: var(--space-gap-sm);
   padding: var(--space-gap-sm) var(--space-gap-sm) var(--space-gap-sm) var(--space-inset-md);
   border: 1px solid var(--color-border);
   border-radius: var(--radius-sm);
   background: var(--color-surface);
   box-shadow: var(--shadow-card);
}

.compact-nav__panel {
   position: absolute;
   top: calc(100% + var(--space-gap-sm));
   right: 0;
   width: min(100%, 20rem);
   border-radius: var(--radius-sm);
   box-shadow: var(--shadow-overlay);
}
</style>
