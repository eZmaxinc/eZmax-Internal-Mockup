<!-- @proposal primitive: production's ez-btn-dropdown (a button that opens a menu of actions); no ez- component opens a menu -->
<template>
   <component :is="as" ref="theRootRef" class="ez-btn-dropdown">
      <ez-btn
         ref="theTriggerRef"
         :label="label"
         :icon="icon"
         icon-right="chevronDown"
         :variant="variant"
         :outline="outline"
         :pill="pill"
         :size="size"
         :disabled="disabled"
         aria-haspopup="menu"
         :aria-expanded="theUI.$isOpen"
         :class="{ 'ez-btn-dropdown__trigger--open': theUI.$isOpen }"
         @click="onToggle"
         @keydown.down.prevent="onOpenFromKeyboard"
      />

      <!-- Drawn on the body: a scrolling or clipping parent never cuts the menu -->
      <teleport to="body">
         <transition name="ez-btn-dropdown-menu">
            <div
               v-if="theUI.$isOpen"
               ref="theMenuRef"
               class="ez-btn-dropdown__menu"
               :class="{ 'ez-btn-dropdown__menu--above': theUI.$isAbove }"
               role="menu"
               :aria-label="label"
               :style="{ left: `${theUI.$left}px`, top: `${theUI.$top}px`, minWidth: `${theUI.$minWidth}px`, maxHeight: `${theUI.$maxHeight}px` }"
               @click="onMenuClick"
               @keydown="onMenuKeydown"
            >
               <slot />
            </div>
         </transition>
      </teleport>
   </component>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, useTemplateRef } from 'vue'
import type { IconName } from '@ez'
// The enhanced ez-btn of this version (outline); once it is promoted, this import goes and the global one is used
import EzBtn from './EzBtn.vue'

const props = withDefaults(defineProps<{
   label?: string
   icon?: IconName
   /** The trigger's look: the variants of ez-btn */
   variant?: 'positive' | 'primary' | 'secondary' | 'flat' | 'danger'
   outline?: boolean
   /** Rounded ends and uppercase label: the actions of a page header (production's `rounded`) */
   pill?: boolean
   size?: 'md' | 'sm'
   disabled?: boolean
   /** Which edge of the trigger the menu lines up with (production's menu-anchor / menu-self) */
   align?: 'left' | 'right'
   /** Renders as another element (`li`, `div`) */
   as?: string
}>(), {
   variant: 'secondary',
   size: 'md',
   align: 'left',
   as: 'span',
})

const emit = defineEmits<{
   open: []
   close: []
}>()

/** The room kept between the menu, its trigger and the edges of the window */
const MARGIN = 4

const theRootRef = useTemplateRef<HTMLElement>('theRootRef')
const theTriggerRef = useTemplateRef<{ $el: HTMLElement }>('theTriggerRef')
const theMenuRef = useTemplateRef<HTMLElement>('theMenuRef')
const theUI = reactive({ $isOpen: false, $isAbove: false, $left: 0, $top: 0, $minWidth: 0, $maxHeight: 0 })

/** Under the trigger, on its left or right edge; above it when the room below is too short. */
function place() {
   const rect = theRootRef.value?.getBoundingClientRect()
   const menu = theMenuRef.value
   if (!rect || !menu) return
   theUI.$minWidth = rect.width
   const width = Math.max(menu.offsetWidth, rect.width)
   const left = props.align === 'right' ? rect.right - width : rect.left
   theUI.$left = Math.max(MARGIN, Math.min(left, window.innerWidth - width - MARGIN))
   const below = window.innerHeight - rect.bottom - 2 * MARGIN
   const above = rect.top - 2 * MARGIN
   const isAbove = below < menu.scrollHeight && above > below
   theUI.$isAbove = isAbove
   theUI.$maxHeight = isAbove ? above : below
   theUI.$top = isAbove ? rect.top - MARGIN - Math.min(menu.scrollHeight, above) : rect.bottom + MARGIN
}

function items(): HTMLElement[] {
   return [...(theMenuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])]
}

function focusItem(index: number) {
   const list = items()
   if (!list.length) return
   list[(index + list.length) % list.length].focus()
}

async function open(focusFirst = false) {
   theUI.$isOpen = true
   emit('open')
   await nextTick()
   place()
   if (focusFirst) focusItem(0)
   else theMenuRef.value?.focus()
   document.addEventListener('pointerdown', onPointerDown)
   window.addEventListener('resize', place)
   window.addEventListener('scroll', place, true)
}

function close(returnFocus = false) {
   if (!theUI.$isOpen) return
   theUI.$isOpen = false
   emit('close')
   document.removeEventListener('pointerdown', onPointerDown)
   window.removeEventListener('resize', place)
   window.removeEventListener('scroll', place, true)
   if (returnFocus) theTriggerRef.value?.$el.focus()
}

function onToggle() {
   if (theUI.$isOpen) close()
   else open()
}

function onOpenFromKeyboard() {
   if (!theUI.$isOpen) open(true)
}

/** A press anywhere outside the menu and its trigger closes it. */
function onPointerDown(event: PointerEvent) {
   const target = event.target as Node
   if (theRootRef.value?.contains(target) || theMenuRef.value?.contains(target)) return
   close()
}

/** Like production's v-close-popup: choosing an item closes the menu. A disabled item does nothing. */
function onMenuClick(event: MouseEvent) {
   const item = (event.target as HTMLElement).closest('[role="menuitem"]')
   if (item && item.getAttribute('aria-disabled') !== 'true') close(true)
}

function onMenuKeydown(event: KeyboardEvent) {
   const index = items().indexOf(document.activeElement as HTMLElement)
   if (event.key === 'ArrowDown') focusItem(index + 1)
   else if (event.key === 'ArrowUp') focusItem(index < 0 ? -1 : index - 1)
   else if (event.key === 'Home') focusItem(0)
   else if (event.key === 'End') focusItem(-1)
   else if (event.key === 'Escape') close(true)
   else if (event.key === 'Tab') close()
   else return
   event.preventDefault()
}

defineExpose({ open, close })

onBeforeUnmount(() => close())
</script>

<style scoped>
.ez-btn-dropdown {
   display: inline-flex;
}

/* The chevron (the trigger's last icon) turns while the menu is open */
.ez-btn-dropdown :deep(.ez-btn > :last-child) {
   transition: transform 120ms;
}

.ez-btn-dropdown :deep(.ez-btn-dropdown__trigger--open > :last-child) {
   transform: rotate(180deg);
}

/* Teleported to the body, out of the root: the menu carries its own variables */
.ez-btn-dropdown__menu {
   --ez-btn-dropdown-menu-background: var(--color-surface);
   --ez-btn-dropdown-menu-border: var(--color-border);
   --ez-btn-dropdown-menu-radius: var(--radius-md);
   --ez-btn-dropdown-menu-shadow: var(--shadow-overlay);
   --ez-btn-dropdown-menu-padding: 0.25rem; /* the same all around: the items' hover never touches the edge */

   position: fixed;
   z-index: 1000;
   max-width: calc(100vw - 2 * var(--space-gap-sm));
   padding: var(--ez-btn-dropdown-menu-padding);
   border: 1px solid var(--ez-btn-dropdown-menu-border);
   border-radius: var(--ez-btn-dropdown-menu-radius);
   background: var(--ez-btn-dropdown-menu-background);
   box-shadow: var(--ez-btn-dropdown-menu-shadow);
   overflow-y: auto;

   &:focus {
      outline: none;
   }
}

/*
 * Micro-animation: a short fade and a 4px slide from the trigger, nothing more. Leaving is quicker
 * than entering, and both stop when the user reduces motion.
 */
.ez-btn-dropdown-menu-enter-active {
   transition: opacity 140ms ease-out, transform 140ms ease-out;
}

.ez-btn-dropdown-menu-leave-active {
   transition: opacity 90ms ease-in, transform 90ms ease-in;
}

.ez-btn-dropdown-menu-enter-from,
.ez-btn-dropdown-menu-leave-to {
   opacity: 0;
   transform: translateY(-4px);

   &.ez-btn-dropdown__menu--above {
      transform: translateY(4px);
   }
}

@media (prefers-reduced-motion: reduce) {
   .ez-btn-dropdown-menu-enter-active,
   .ez-btn-dropdown-menu-leave-active,
   .ez-btn-dropdown :deep(.ez-btn > :last-child) {
      transition: none;
   }
}
</style>
