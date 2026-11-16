<template>
   <div
      class="ez-reveal"
      :class="{
         'ez-reveal--expanded': !isCollapsed,
         'ez-reveal--fade-muted': fadeTo === 'muted',
      }"
      :style="{
         '--ez-reveal-collapsed-height': collapsedHeight,
         '--ez-reveal-full-height': theFullHeight,
      }"
   >
      <div ref="content" class="ez-reveal__content">
         <slot />
      </div>

      <transition name="ez-reveal-scrim">
         <div
            v-if="isMobile && hasOverflow && isCollapsed"
            class="ez-reveal__scrim"
            role="button"
            tabindex="0"
            :aria-expanded="false"
            :aria-label="expandLabel"
            @click="onExpand"
            @keydown.enter.prevent="onExpand"
            @keydown.space.prevent="onExpand"
         >
            <span class="ez-reveal__scrim-label">
               {{ expandLabel }}
               <ez-icon name="chevronDown" :size="16" />
            </span>
         </div>
      </transition>

      <transition name="ez-reveal-footer">
         <div v-if="isMobile && hasOverflow && !isCollapsed" class="ez-reveal__footer">
            <ez-btn
               variant="flat"
               size="sm"
               :icon="ez.icons.chevronDown"
               class="ez-reveal__collapse-btn"
               :label="collapseLabel"
               :aria-expanded="true"
               @click="onCollapse"
            />
         </div>
      </transition>
   </div>
</template>

<script setup lang="ts">
/**
 * Hides the bottom of a long content behind a fade on narrow screens and reveals it on tap or click; collapsed by default on mobile.
 */
import { gettext } from '../../i18n'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, useTemplateRef, watch } from 'vue'

const theSlots = useSlots()

const props = withDefaults(
   defineProps<{
      /** Max height while collapsed (CSS length) */
      collapsedHeight?: string
      /** Color the fade blends into: card surface, or muted inset panels */
      fadeTo?: 'surface' | 'muted'
      expandLabel?: string
      collapseLabel?: string
   }>(),
   {
      collapsedHeight: '10rem',
      fadeTo: 'surface',
      expandLabel: undefined,
      collapseLabel: undefined,
   },
)

const MOTION_MS = 280

const theContentRef = useTemplateRef<HTMLElement>('content')
/** Always start collapsed; entering mobile resets to collapsed */
const isCollapsed = ref(true)
/** Assume overflow until measured, so the fade can show on first paint */
const hasOverflow = ref(true)
const isMobile = ref(false)
/** Full content height, so max-height can ease between collapsed and open */
const theFullHeight = ref('none')
/** Skip measuring while max-height is easing; a measure would snap the motion */
const isMoving = ref(false)

const expandLabel = computed(() => props.expandLabel ?? gettext('Voir plus'))
const collapseLabel = computed(() => props.collapseLabel ?? gettext('Réduire'))

let theObserver: ResizeObserver | null = null
let theMedia: MediaQueryList | null = null
let theMotionTimer: ReturnType<typeof setTimeout> | null = null

function collapsedBudgetPx(el: HTMLElement): number {
   const probe = document.createElement('div')
   probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;height:${props.collapsedHeight}`
   el.appendChild(probe)
   const px = probe.offsetHeight
   probe.remove()
   return px
}

function measure() {
   const el = theContentRef.value
   if (!el || isMoving.value) return
   // Temporarily reveal full height so scrollHeight is trustworthy while collapsed via CSS.
   // Kill the transition for this read, or the restore would play the open animation.
   const prevMax = el.style.maxHeight
   const prevTransition = el.style.transition
   el.style.transition = 'none'
   el.style.maxHeight = 'none'
   const full = el.scrollHeight
   hasOverflow.value = full > collapsedBudgetPx(el) + 8
   theFullHeight.value = `${full}px`
   el.style.maxHeight = prevMax
   void el.offsetHeight
   el.style.transition = prevTransition
}

function playMotion() {
   isMoving.value = true
   if (theMotionTimer) clearTimeout(theMotionTimer)
   const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
   theMotionTimer = setTimeout(() => {
      isMoving.value = false
      theMotionTimer = null
      measure()
   }, reduce ? 0 : MOTION_MS)
}

function onExpand() {
   playMotion()
   isCollapsed.value = false
}

function onCollapse() {
   playMotion()
   isCollapsed.value = true
}

function syncMobile(matches: boolean) {
   isMobile.value = matches
   if (matches) isCollapsed.value = true
   nextTick(() => measure())
}

function onMediaChange(event: MediaQueryListEvent) {
   syncMobile(event.matches)
}

onMounted(() => {
   // The same breakpoint as the style: --breakpoint-sm of ez-tokens.css, read from the component's variable
   const breakpoint = theContentRef.value ? getComputedStyle(theContentRef.value).getPropertyValue('--ez-reveal-breakpoint').trim() : ''
   theMedia = window.matchMedia(`(width < ${breakpoint || '37.5rem'})`)
   syncMobile(theMedia.matches)
   theMedia.addEventListener('change', onMediaChange)

   requestAnimationFrame(() => measure())

   if (!theContentRef.value || typeof ResizeObserver === 'undefined') return
   theObserver = new ResizeObserver(() => measure())
   theObserver.observe(theContentRef.value)
})

onBeforeUnmount(() => {
   theObserver?.disconnect()
   theMedia?.removeEventListener('change', onMediaChange)
   if (theMotionTimer) clearTimeout(theMotionTimer)
})

watch(
   () => theSlots.default?.(),
   async () => {
      await nextTick()
      measure()
   },
)
</script>

<style scoped>
@reference "../../../tokens/ez-tokens.css";

.ez-reveal {
   /* Variables first: what the reveal's look depends on, read below (the two heights also come from the props) */
   --ez-reveal-breakpoint: theme(--breakpoint-sm); /* collapsed below it; also read by the script */
   --ez-reveal-collapsed-height: 10rem;
   --ez-reveal-full-height: none;
   --ez-reveal-fade-to: var(--color-surface);
   --ez-reveal-label-color: var(--color-accent);
   --ez-reveal-label-hover: var(--color-surface-accent);

   position: relative;
}

.ez-reveal--fade-muted {
   --ez-reveal-fade-to: var(--color-surface-muted);
}

.ez-reveal__content {
   min-width: 0;
}

/* Reduced by default under sm; only .ez-reveal--expanded shows the full content.
   Both heights are lengths, so the open and the close can ease instead of snapping. */
@media (width < theme(--breakpoint-sm)) {
   .ez-reveal__content {
      max-height: var(--ez-reveal-full-height);
      overflow: hidden;
      transition: max-height 220ms cubic-bezier(0.16, 1, 0.3, 1);
   }

   .ez-reveal:not(.ez-reveal--expanded) .ez-reveal__content {
      max-height: var(--ez-reveal-collapsed-height);
   }

   .ez-reveal__scrim {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      height: 5.5rem;
      margin: 0;
      padding: 0;
      border: 0;
      /* Long ease into the surface: the last stretch to solid is slow, then opaque under the label */
      background: linear-gradient(
         to bottom,
         color-mix(in srgb, var(--ez-reveal-fade-to) 0%, transparent) 0%,
         color-mix(in srgb, var(--ez-reveal-fade-to) 8%, transparent) 18%,
         color-mix(in srgb, var(--ez-reveal-fade-to) 24%, transparent) 36%,
         color-mix(in srgb, var(--ez-reveal-fade-to) 48%, transparent) 52%,
         color-mix(in srgb, var(--ez-reveal-fade-to) 72%, transparent) 66%,
         color-mix(in srgb, var(--ez-reveal-fade-to) 90%, transparent) 78%,
         var(--ez-reveal-fade-to) 90%,
         var(--ez-reveal-fade-to) 100%
      );
      cursor: pointer;
   }

   .ez-reveal__scrim-label {
      display: inline-flex;
      align-items: center;
      gap: var(--space-gap-sm);
      min-height: var(--size-control-sm);
      padding: 0 var(--space-gap-sm);
      border-radius: var(--radius-md);
      color: var(--ez-reveal-label-color);
      font-size: var(--text-sm);
      font-weight: 600;
      transition: background-color 120ms, color 120ms;
   }

   .ez-reveal__scrim-label :deep(svg) {
      transition: transform 120ms ease;
   }

   /* Same wash as a flat button; the chevron dips so the control feels alive */
   .ez-reveal__scrim:hover .ez-reveal__scrim-label,
   .ez-reveal__scrim:focus-visible .ez-reveal__scrim-label {
      background: var(--ez-reveal-label-hover);
   }

   .ez-reveal__scrim:hover .ez-reveal__scrim-label :deep(svg),
   .ez-reveal__scrim:focus-visible .ez-reveal__scrim-label :deep(svg) {
      transform: translateY(0.125rem);
   }

   .ez-reveal__scrim:focus-visible {
      outline: none;
   }

   .ez-reveal__footer {
      display: flex;
      justify-content: center;
      padding-top: var(--space-gap-sm);
   }

   .ez-reveal__collapse-btn :deep(svg) {
      transform: rotate(180deg);
   }

   .ez-reveal-scrim-enter-active,
   .ez-reveal-scrim-leave-active {
      transition: opacity 180ms ease;
   }

   .ez-reveal-scrim-enter-from,
   .ez-reveal-scrim-leave-to {
      opacity: 0;
   }

   .ez-reveal-footer-enter-active {
      transition: opacity 160ms ease 60ms;
   }

   .ez-reveal-footer-leave-active {
      transition: opacity 120ms ease;
   }

   .ez-reveal-footer-enter-from,
   .ez-reveal-footer-leave-to {
      opacity: 0;
   }
}

@media (width < theme(--breakpoint-sm)) and (prefers-reduced-motion: reduce) {
   .ez-reveal__content,
   .ez-reveal-scrim-enter-active,
   .ez-reveal-scrim-leave-active,
   .ez-reveal-footer-enter-active,
   .ez-reveal-footer-leave-active,
   .ez-reveal__scrim-label,
   .ez-reveal__scrim-label :deep(svg) {
      transition: none;
   }

   .ez-reveal__scrim:hover .ez-reveal__scrim-label :deep(svg),
   .ez-reveal__scrim:focus-visible .ez-reveal__scrim-label :deep(svg) {
      transform: none;
   }
}

@media (width >= theme(--breakpoint-sm)) {
   .ez-reveal__scrim,
   .ez-reveal__footer {
      display: none;
   }
}
</style>
