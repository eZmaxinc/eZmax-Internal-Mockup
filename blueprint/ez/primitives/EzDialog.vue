<template>
   <teleport to="body">
      <transition name="ez-dialog">
         <div v-if="modelValue" class="ez-dialog" @mousedown.self="!persistent && close()">
            <div
               class="ez-dialog__panel"
               role="dialog"
               aria-modal="true"
               :aria-label="title"
               :style="{ width: width }"
            >
               <header class="ez-dialog__header">
                  <h2 class="ez-dialog__title">{{ title }}</h2>
                  <ez-btn variant="flat" size="sm" icon="close" aria-label="Fermer" @click="close" />
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
import EzBtn from './EzBtn.vue'

const props = withDefaults(defineProps<{
   modelValue: boolean
   title: string
   width?: string
   /** Click outside / Escape do not close */
   persistent?: boolean
}>(), {
   width: 'var(--dialog-width)',
})

const emit = defineEmits<{
   'update:modelValue': [value: boolean]
}>()

function close() {
   emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent) {
   if (event.key === 'Escape' && !props.persistent) close()
}

watch(() => props.modelValue, (isOpen) => {
   if (isOpen) document.addEventListener('keydown', onKeydown)
   else document.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.ez-dialog {
   position: fixed;
   inset: 0;
   z-index: 100;
   display: grid;
   /* One column as wide as the screen: without it, the column takes the panel's width and max-width: 100% never applies */
   grid-template-columns: minmax(0, 1fr);
   place-items: center;
   padding: 16px;
   background: var(--color-overlay);
}

.ez-dialog__panel {
   --_padding: var(--card-padding, var(--space-inset-lg));

   display: flex;
   flex-direction: column;
   max-width: 100%;
   max-height: calc(100vh - 32px);
   border-radius: var(--radius-lg);
   background: var(--color-surface);
   box-shadow: var(--shadow-overlay);
}

@media (width < 37.5rem) { /* below sm */
   .ez-dialog__panel {
      --_padding: var(--card-padding, var(--space-inset-md));
   }
}

.ez-dialog__header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 12px;
   padding: 16px 16px 0 var(--_padding);
}

.ez-dialog__title {
   margin: 0;
   font-size: var(--text-lg);
   font-weight: 600;
}

.ez-dialog__body {
   padding: 16px var(--_padding);
   overflow-y: auto;
}

.ez-dialog__footer {
   display: flex;
   justify-content: flex-end;
   gap: 8px;
   padding: 12px var(--_padding) var(--_padding);
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
