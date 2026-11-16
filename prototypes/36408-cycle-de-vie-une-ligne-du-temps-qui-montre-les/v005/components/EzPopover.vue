<!-- @proposal primitive: no ez- component opens a panel anchored to a button (ez-dialog covers the page) -->
<template>
   <span ref="theAnchor" class="popover">
      <slot name="trigger" :toggle="toggle" :open="theUI.$isOpen" />
      <!-- Drawn on the body: a scrolling or clipping parent never cuts the panel -->
      <teleport to="body">
         <div
            v-if="theUI.$isOpen"
            ref="thePanel"
            class="popover__panel"
            role="dialog"
            tabindex="-1"
            :aria-label="title"
            :style="{ left: `${theUI.$left}px`, top: `${theUI.$top}px`, maxHeight: `${theUI.$maxHeight}px` }"
            @keydown.esc="close"
         >
            <header v-if="title" class="popover__header">
               <strong>{{ title }}</strong>
               <ez-btn icon="close" variant="flat" size="sm" :aria-label="$gettext('Fermer')" @click="close" />
            </header>
            <slot />
         </div>
      </teleport>
   </span>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, ref } from 'vue'

defineProps<{
   /** Shown on top of the panel, with a button to close it */
   title?: string
}>()

const theAnchor = ref<HTMLElement>()
const thePanel = ref<HTMLElement>()
const theUI = reactive({ $isOpen: false, $left: 0, $top: 0, $maxHeight: 0 })

/** The room kept between the panel, its trigger and the edges of the window */
const MARGIN = 8

/** Under the trigger, its right edge on the trigger's; pushed back inside the window, and scrolling when it is too tall. */
function place() {
   const rect = theAnchor.value?.getBoundingClientRect()
   if (!rect || !thePanel.value) return
   const width = thePanel.value.offsetWidth
   theUI.$left = Math.max(MARGIN, Math.min(rect.right - width, window.innerWidth - width - MARGIN))
   // Not enough room under the trigger (a short window): the panel takes the height of the window instead
   const below = window.innerHeight - rect.bottom - 2 * MARGIN
   theUI.$top = below < 240 ? MARGIN : rect.bottom + MARGIN
   theUI.$maxHeight = window.innerHeight - theUI.$top - MARGIN
}

/** A press anywhere outside the panel and its trigger closes it. */
function onPointerDown(event: PointerEvent) {
   const target = event.target as Node
   if (theAnchor.value?.contains(target) || thePanel.value?.contains(target)) return
   close()
}

async function open() {
   theUI.$isOpen = true
   await nextTick()
   place()
   thePanel.value?.focus()
   document.addEventListener('pointerdown', onPointerDown)
   window.addEventListener('resize', place)
   window.addEventListener('scroll', place, true)
}

function close() {
   theUI.$isOpen = false
   document.removeEventListener('pointerdown', onPointerDown)
   window.removeEventListener('resize', place)
   window.removeEventListener('scroll', place, true)
}

function toggle() {
   if (theUI.$isOpen) close()
   else open()
}

onBeforeUnmount(close)
</script>

<style scoped>
.popover {
   display: inline-flex;
}

.popover__panel {
   position: fixed;
   z-index: 1000;
   width: min(26rem, calc(100vw - var(--space-inset-md)));
   padding: var(--space-inset-md);
   border: 1px solid var(--color-border);
   border-radius: var(--radius-md);
   background: var(--color-surface);
   box-shadow: var(--shadow-overlay);
   overflow-y: auto;

   &:focus {
      outline: none;
   }
}

.popover__header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: var(--space-gap-md);
   margin-bottom: var(--space-gap-md);

   strong {
      font-weight: 500;
   }
}
</style>
