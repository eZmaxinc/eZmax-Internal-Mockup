<template>
   <teleport to="body">
      <transition name="ez-dialog">
         <div v-if="isOpen" class="ez-dialog" @mousedown.self="onBackdrop">
            <div
               class="ez-dialog__panel"
               role="dialog"
               aria-modal="true"
               :aria-label="title"
               :style="{ width: width }"
            >
               <header class="ez-dialog__header">
                  <h2 class="ez-dialog__title">{{ title }}</h2>
                  <ez-btn variant="flat" size="sm" icon="close" :aria-label="$gettext('Fermer')" @click="onClose" />
               </header>
               <div class="ez-dialog__body">
                  <slot />
               </div>
               <footer v-if="$slots.actions" class="ez-dialog__footer">
                  <slot name="actions" />
               </footer>
            </div>
         </div>
      </transition>
   </teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import EzBtn from '../btn/ez-btn.vue'

const props = withDefaults(defineProps<{
   title: string
   width?: string
   /** Click outside / Escape do not close */
   persistent?: boolean
}>(), {
   width: 'var(--dialog-width)',
})

/** Visibility, like the app's dialogs: v-model */
const isOpen = defineModel<boolean>({ required: true })

function onClose() {
   isOpen.value = false
}

function onBackdrop() {
   if (!props.persistent) onClose()
}

function onKeydown(event: KeyboardEvent) {
   if (event.key === 'Escape' && !props.persistent) onClose()
}

watch(isOpen, (isNowOpen) => {
   if (isNowOpen) document.addEventListener('keydown', onKeydown)
   else document.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.ez-dialog {
   /* Variables first: what the dialog's look depends on, read below */
   --ez-dialog-overlay: var(--color-overlay);
   --ez-dialog-margin: var(--space-inset-md);
   --ez-dialog-padding: var(--card-padding, var(--space-inset-lg));
   --ez-dialog-surface: var(--color-surface);
   --ez-dialog-radius: var(--radius-lg);
   --ez-dialog-shadow: var(--shadow-overlay);

   position: fixed;
   inset: 0;
   z-index: 100;
   display: grid;
   /* One column as wide as the screen: without it, the column takes the panel's width and max-width: 100% never applies */
   grid-template-columns: minmax(0, 1fr);
   place-items: center;
   padding: var(--ez-dialog-margin);
   background: var(--ez-dialog-overlay);
}

@media (width < 37.5rem) { /* below sm */
   .ez-dialog {
      --ez-dialog-padding: var(--card-padding, var(--space-inset-md));
   }
}

.ez-dialog__panel {
   display: flex;
   flex-direction: column;
   max-width: 100%;
   max-height: calc(100vh - 2 * var(--ez-dialog-margin));
   border-radius: var(--ez-dialog-radius);
   background: var(--ez-dialog-surface);
   box-shadow: var(--ez-dialog-shadow);
}

.ez-dialog__header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: var(--space-inset-sm);
   padding: var(--space-inset-md) var(--space-inset-md) 0 var(--ez-dialog-padding);
}

.ez-dialog__title {
   margin: 0;
   font-size: var(--text-lg);
   font-weight: 600;
}

.ez-dialog__body {
   padding: var(--space-inset-md) var(--ez-dialog-padding);
   overflow-y: auto;
}

.ez-dialog__footer {
   display: flex;
   justify-content: flex-end;
   gap: var(--space-gap-sm);
   padding: var(--space-inset-sm) var(--ez-dialog-padding) var(--ez-dialog-padding);
}

.ez-dialog-enter-active,
.ez-dialog-leave-active {
   transition: opacity 140ms;

   .ez-dialog__panel {
      transition: transform 140ms;
   }
}

.ez-dialog-enter-from,
.ez-dialog-leave-to {
   opacity: 0;

   .ez-dialog__panel {
      transform: translateY(8px);
   }
}
</style>
