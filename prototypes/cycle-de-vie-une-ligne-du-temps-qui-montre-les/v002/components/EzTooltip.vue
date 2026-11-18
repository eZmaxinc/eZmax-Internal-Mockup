<!-- @proposal primitive: no ez- component explains an element on hover or on keyboard focus -->
<template>
   <span
      ref="theTrigger"
      class="tooltip"
      tabindex="0"
      :aria-describedby="theUI.$isOpen ? id : undefined"
      @mouseenter="open"
      @mouseleave="close"
      @focus="open"
      @blur="close"
      @keydown.esc="close"
   >
      <slot />
      <!-- Drawn on the body: a scrolling or clipping parent never cuts the bubble -->
      <teleport to="body">
         <span
            v-if="theUI.$isOpen"
            :id="id"
            class="tooltip__bubble"
            :class="{ 'tooltip__bubble--below': theUI.$isBelow }"
            role="tooltip"
            :style="{ left: `${theUI.$left}px`, top: `${theUI.$top}px` }"
         >
            <strong v-if="title">{{ title }}</strong>
            <slot name="content">{{ text }}</slot>
         </span>
      </teleport>
   </span>
</template>

<script lang="ts">
let count = 0
</script>

<script setup lang="ts">
import { reactive, ref } from 'vue'

defineProps<{
   /** A short title, in bold */
   title?: string
   /** The explanation; the slot `content` replaces it */
   text?: string
}>()

const id = `ez-tooltip-${++count}`
const theTrigger = ref<HTMLElement>()
const theUI = reactive({ $isOpen: false, $isBelow: false, $left: 0, $top: 0 })

/** Half the widest bubble plus a margin: the bubble stays inside the window */
const EDGE = 152

function open() {
   const rect = theTrigger.value?.getBoundingClientRect()
   if (!rect) return
   theUI.$left = Math.min(Math.max(rect.left + rect.width / 2, EDGE), Math.max(EDGE, window.innerWidth - EDGE))
   // Above the element, or under it when there is no room above
   theUI.$isBelow = rect.top < 140
   theUI.$top = theUI.$isBelow ? rect.bottom : rect.top
   theUI.$isOpen = true
}

function close() {
   theUI.$isOpen = false
}
</script>

<style scoped>
.tooltip {
   display: inline-flex;
   border-radius: var(--radius-sm);
   cursor: help;

   &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
   }
}

.tooltip__bubble {
   position: fixed;
   z-index: 1000;
   display: flex;
   flex-direction: column;
   gap: 2px;
   width: max-content;
   max-width: 18rem;
   padding: var(--space-inset-sm) var(--space-inset-md);
   border-radius: var(--radius-md);
   background: var(--color-surface-inverse);
   box-shadow: var(--shadow-overlay);
   color: var(--color-foreground-inverse);
   font-size: var(--text-xs);
   line-height: var(--text-xs--line-height);
   text-align: left;
   white-space: normal;
   pointer-events: none;
   transform: translate(-50%, calc(-100% - var(--space-gap-sm)));

   strong {
      font-size: var(--text-sm);
      font-weight: 600;
      line-height: var(--text-sm--line-height);
   }
}

.tooltip__bubble--below {
   transform: translate(-50%, var(--space-gap-sm));
}
</style>
