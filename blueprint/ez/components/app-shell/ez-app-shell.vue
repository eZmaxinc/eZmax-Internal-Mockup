<template>
   <div
      ref="theRootRef"
      class="ez-app-shell"
      :class="{
         'ez-app-shell--collapsed': !isDesktopOpen,
         'ez-app-shell--mobile-open': isMobileOpen,
      }"
   >
      <header class="ez-app-shell__toolbar">
         <button
            type="button"
            class="ez-app-shell__burger"
            :aria-label="theToggleLabel"
            :aria-expanded="isDrawerCurrentlyOpen"
            @click="onToggleNav"
         >
            <ez-icon name="menu" :size="20" />
         </button>
      </header>
      <div class="ez-app-shell__body">
         <aside class="ez-app-shell__nav" aria-hidden="true">
            <ul v-if="isWithSkeleton" class="ez-app-shell__skeleton-menu">
               <li
                  v-for="(theItem, theIndex) in SKELETON_MENU_ITEMS"
                  :key="theIndex"
                  class="ez-app-shell__skeleton-item"
                  :class="{ 'ez-app-shell__skeleton-item--active': theItem.active }"
               >
                  <span class="ez-app-shell__skeleton-icon" />
                  <span class="ez-app-shell__skeleton-labels">
                     <span class="ez-app-shell__skeleton-bar" :style="{ width: theItem.width }" />
                     <span
                        v-if="theItem.secondLineWidth"
                        class="ez-app-shell__skeleton-bar"
                        :style="{ width: theItem.secondLineWidth }"
                     />
                  </span>
                  <span v-if="theItem.hasChevron" class="ez-app-shell__skeleton-chevron" />
               </li>
            </ul>
         </aside>
         <div v-if="isMobileOpen" class="ez-app-shell__backdrop" @click="isMobileOpen = false" />
         <main class="ez-app-shell__main">
            <slot />
         </main>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, useTemplateRef } from 'vue'
import EzIcon from '../icon/ez-icon.vue'
import { appShellKey } from './app-shell'

interface SkeletonMenuItem {
   width: string
   secondLineWidth?: string
   active?: boolean
   hasChevron?: boolean
}

const SKELETON_MENU_ITEMS: SkeletonMenuItem[] = [
   { width: '38%', active: true },
   { width: '58%' },
   { width: '54%' },
   { width: '58%' },
   { width: '74%', secondLineWidth: '32%' },
   { width: '68%' },
   { width: '72%' },
   { width: '52%', hasChevron: true },
   { width: '24%', hasChevron: true },
]

/**
 * Placeholder frame of the production shell (toolbar + collapsible left drawer):
 * places mockups at their real position and width inside the app, with a burger toggle.
 */
const props = withDefaults(defineProps<{
   /** Shows pale grey skeleton placeholders in the left navigation drawer, shaped like the production menu */
   withSkeleton?: boolean
}>(), {
   withSkeleton: false,
})

const theRootRef = useTemplateRef<HTMLElement>('theRootRef')
const isDesktopOpen = ref(false)
const isMobileOpen = ref(false)
const isMobileViewport = ref(false)
const hasSkeletonOverride = ref<boolean | null>(null)

const isWithSkeleton = computed(() => hasSkeletonOverride.value ?? props.withSkeleton)

provide(appShellKey, {
   setWithSkeleton(value: boolean | null) {
      hasSkeletonOverride.value = value
   },
})

const isDrawerCurrentlyOpen = computed(() =>
   isMobileViewport.value ? isMobileOpen.value : isDesktopOpen.value,
)

const theToggleLabel = computed(() =>
   isDrawerCurrentlyOpen.value ? 'Fermer le menu' : 'Ouvrir le menu',
)

let theMediaQuery: MediaQueryList | null = null

function onMediaChange(event: MediaQueryListEvent) {
   isMobileViewport.value = event.matches
   if (!event.matches) {
      isMobileOpen.value = false
   }
}

function onToggleNav() {
   if (isMobileViewport.value) {
      isMobileOpen.value = !isMobileOpen.value
   } else {
      isDesktopOpen.value = !isDesktopOpen.value
   }
}

onMounted(() => {
   const root = theRootRef.value
   const breakpoint = root ? getComputedStyle(root).getPropertyValue('--ez-app-shell-breakpoint').trim() : ''
   if (breakpoint) {
      theMediaQuery = window.matchMedia(`(width < ${breakpoint})`)
      isMobileViewport.value = theMediaQuery.matches
      theMediaQuery.addEventListener('change', onMediaChange)
   }
})

onBeforeUnmount(() => {
   theMediaQuery?.removeEventListener('change', onMediaChange)
})
</script>

<style scoped>
@reference "../../../tokens/ez-tokens.css";

.ez-app-shell {
   /* Variables first: what the shell's look depends on, read below */
   --ez-app-shell-breakpoint: theme(--breakpoint-md);
   --ez-app-shell-background: var(--color-background);
   --ez-app-shell-toolbar: var(--color-surface-inverse);
   --ez-app-shell-toolbar-foreground: var(--color-foreground-inverse);
   --ez-app-shell-nav: var(--color-surface);
   --ez-app-shell-nav-border: var(--color-border);
   --ez-app-shell-skeleton: var(--color-border-muted);
   --ez-app-shell-skeleton-active-bg: var(--color-surface-accent);
   --ez-app-shell-skeleton-active-bar: var(--color-border);
   --ez-app-shell-backdrop: var(--color-overlay);
   --ez-app-shell-shadow: var(--shadow-overlay);

   min-height: 100vh;
   background: var(--ez-app-shell-background);
}

.ez-app-shell__toolbar {
   position: sticky;
   top: 0;
   z-index: 30;
   display: flex;
   align-items: center;
   height: var(--sizing-toolbar-height);
   padding: 0 var(--space-inset-sm);
   background: var(--ez-app-shell-toolbar);
   color: var(--ez-app-shell-toolbar-foreground);
}

.ez-app-shell__burger {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   width: var(--size-control-md);
   height: var(--size-control-md);
   padding: 0;
   border: none;
   border-radius: var(--radius-md);
   background: transparent;
   color: var(--ez-app-shell-toolbar-foreground);
   cursor: pointer;

   &:hover {
      background: color-mix(in srgb, var(--ez-app-shell-toolbar-foreground) 14%, transparent);
   }

   &:focus-visible {
      outline: 2px solid var(--ez-app-shell-toolbar-foreground);
      outline-offset: 2px;
   }
}

.ez-app-shell__body {
   display: flex;
}

.ez-app-shell__nav {
   position: sticky;
   top: var(--sizing-toolbar-height);
   flex-shrink: 0;
   width: var(--nav-width);
   height: calc(100vh - var(--sizing-toolbar-height));
   background: var(--ez-app-shell-nav);
   border-right: 1px solid var(--ez-app-shell-nav-border);
   transition: width 180ms ease;
   overflow: hidden;
}

.ez-app-shell__skeleton-menu {
   display: flex;
   flex-direction: column;
   margin: 0;
   padding: 0;
   list-style: none;
}

.ez-app-shell__skeleton-item {
   display: flex;
   align-items: center;
   gap: 14px;
   min-height: 44px;
   padding: 10px var(--space-inset-md);
}

.ez-app-shell__skeleton-item--active {
   background: var(--ez-app-shell-skeleton-active-bg);

   .ez-app-shell__skeleton-icon,
   .ez-app-shell__skeleton-bar {
      background: var(--ez-app-shell-skeleton-active-bar);
   }
}

.ez-app-shell__skeleton-icon {
   width: 20px;
   height: 20px;
   flex-shrink: 0;
   border-radius: var(--radius-sm);
   background: var(--ez-app-shell-skeleton);
}

.ez-app-shell__skeleton-labels {
   display: flex;
   flex: 1;
   flex-direction: column;
   gap: 6px;
   min-width: 0;
}

.ez-app-shell__skeleton-bar {
   display: block;
   height: 11px;
   border-radius: var(--radius-full);
   background: var(--ez-app-shell-skeleton);
}

.ez-app-shell__skeleton-chevron {
   width: 12px;
   height: 8px;
   flex-shrink: 0;
   margin-left: auto;
   border-radius: var(--radius-sm);
   background: var(--ez-app-shell-skeleton);
}

.ez-app-shell--collapsed .ez-app-shell__nav {
   width: 0;
   border-right-width: 0;
}

.ez-app-shell__backdrop {
   display: none;
}

.ez-app-shell__main {
   flex: 1;
   min-width: 0;
}

@media (width < theme(--breakpoint-md)) {
   .ez-app-shell__nav {
      display: none;
   }

   .ez-app-shell--mobile-open .ez-app-shell__nav {
      display: block;
      position: fixed;
      left: 0;
      top: var(--sizing-toolbar-height);
      z-index: 25;
      width: var(--nav-width);
      border-right-width: 1px;
      box-shadow: var(--ez-app-shell-shadow);
   }

   .ez-app-shell--mobile-open .ez-app-shell__backdrop {
      display: block;
      position: fixed;
      inset: var(--sizing-toolbar-height) 0 0 0;
      z-index: 24;
      background: var(--ez-app-shell-backdrop);
   }
}
</style>
