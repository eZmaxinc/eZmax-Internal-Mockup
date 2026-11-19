<template>
   <component
      :is="as"
      ref="trigger"
      class="ez-tooltip"
      tabindex="0"
      :aria-describedby="theUI.$isOpen ? theId : undefined"
      @mouseenter="onOpen"
      @mouseleave="onClose"
      @focus="onOpen"
      @blur="onClose"
      @keydown.esc="onClose"
   >
      <slot />
      <!-- Drawn on the body: a scrolling or clipping parent never cuts the bubble -->
      <teleport to="body">
         <span
            v-if="theUI.$isOpen"
            :id="theId"
            class="ez-tooltip__bubble"
            :class="{ 'ez-tooltip__bubble--below': theUI.$isBelow }"
            role="tooltip"
            :style="{ left: `${theUI.$left}px`, top: `${theUI.$top}px` }"
         >
            <strong v-if="title">{{ title }}</strong>
            <slot name="content">{{ text }}</slot>
         </span>
      </teleport>
   </component>
</template>

<script lang="ts">
let theCount = 0
</script>

<script setup lang="ts">
import { reactive, useTemplateRef } from 'vue'

withDefaults(defineProps<{
   /** A short title, in bold */
   title?: string
   /** The explanation; the slot `content` replaces it */
   text?: string
   /** Renders as another element */
   as?: string
}>(), {
   as: 'span',
})

/** Half the widest bubble plus a margin: the bubble stays inside the window */
const EDGE = 152
/** Under this distance from the top of the window, the bubble opens below */
const ROOM_ABOVE = 140

const theId = `ez-tooltip-${++theCount}`
const theTriggerRef = useTemplateRef<HTMLElement>('trigger')
const theUI = reactive({ $isOpen: false, $isBelow: false, $left: 0, $top: 0 })

function onOpen() {
   const rect = theTriggerRef.value?.getBoundingClientRect()
   if (!rect) return
   theUI.$left = Math.min(Math.max(rect.left + rect.width / 2, EDGE), Math.max(EDGE, window.innerWidth - EDGE))
   theUI.$isBelow = rect.top < ROOM_ABOVE
   theUI.$top = theUI.$isBelow ? rect.bottom : rect.top
   theUI.$isOpen = true
}

function onClose() {
   theUI.$isOpen = false
}
</script>

<style scoped>
.ez-tooltip {
   --ez-tooltip-focus: var(--color-accent);

   display: inline-flex;
   border-radius: var(--radius-sm);
   cursor: help;

   &:focus-visible {
      outline: 2px solid var(--ez-tooltip-focus);
      outline-offset: 2px;
   }
}

/* Teleported to the body: it cannot read the variables of its trigger, so it has its own */
.ez-tooltip__bubble {
   --ez-tooltip-surface: var(--color-surface-inverse);
   --ez-tooltip-color: var(--color-foreground-inverse);
   --ez-tooltip-radius: var(--radius-md);
   --ez-tooltip-max-width: 18rem;
   --ez-tooltip-offset: var(--space-gap-sm);

   position: fixed;
   z-index: 1000;
   display: flex;
   flex-direction: column;
   gap: 2px;
   width: max-content;
   max-width: var(--ez-tooltip-max-width);
   padding: var(--space-inset-sm) var(--space-inset-md);
   border-radius: var(--ez-tooltip-radius);
   background: var(--ez-tooltip-surface);
   box-shadow: var(--shadow-overlay);
   color: var(--ez-tooltip-color);
   font-size: var(--text-xs);
   line-height: var(--text-xs--line-height);
   text-align: left;
   white-space: normal;
   pointer-events: none;
   transform: translate(-50%, calc(-100% - var(--ez-tooltip-offset)));

   strong {
      font-size: var(--text-sm);
      font-weight: 600;
      line-height: var(--text-sm--line-height);
   }
}

.ez-tooltip__bubble--below {
   transform: translate(-50%, var(--ez-tooltip-offset));
}
</style>
