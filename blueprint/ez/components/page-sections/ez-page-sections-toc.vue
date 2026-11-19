<template>
   <!-- The TOC: one row per section (its icon on a rail), the anchors of the active one unfold under it -->
   <nav class="ez-page-sections-toc" :aria-label="$gettext('Sur cette page')">
      <div
         v-for="theSection in theContext.sections.value"
         :key="theSection.id"
         class="ez-page-sections-toc__section"
         :class="{ 'ez-page-sections-toc__section--active': isActive(theSection.id) }"
      >
         <button
            type="button"
            class="ez-page-sections-toc__item"
            :aria-current="isActive(theSection.id) ? 'location' : undefined"
            :aria-expanded="hasSubs(theSection.id) ? isOpen(theSection.id) : undefined"
            @click="onSectionClick(theSection.id, $event)"
         >
            <span class="ez-page-sections-toc__badge">
               <EzIcon v-if="theSection.icon" :name="theSection.icon" :size="16" />
            </span>
            <span class="ez-page-sections-toc__text">{{ theSection.label }}</span>
            <EzIcon
               v-if="hasSubs(theSection.id)"
               name="chevronRight"
               :size="16"
               class="ez-page-sections-toc__chevron"
               :class="{ 'ez-page-sections-toc__chevron--open': isOpen(theSection.id) }"
            />
         </button>

         <div
            v-if="hasSubs(theSection.id)"
            class="ez-page-sections-toc__subs"
            :class="{ 'ez-page-sections-toc__subs--open': isOpen(theSection.id) }"
            :inert="!isOpen(theSection.id) || undefined"
         >
            <div class="ez-page-sections-toc__subs-inner">
               <button
                  v-for="theAnchor in subsOf(theSection.id)"
                  :key="theAnchor.id"
                  type="button"
                  class="ez-page-sections-toc__sub"
                  :aria-current="theAnchor.id === theContext.activeAnchorId.value ? 'location' : undefined"
                  @click="onAnchorClick(theAnchor.id)"
               >
                  {{ theAnchor.label }}
               </button>
            </div>
         </div>
      </div>
   </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EzIcon from '../icon/ez-icon.vue'
import { usePageSections, type AnchorMeta } from './page-sections'

const props = withDefaults(defineProps<{
   /** A section shows its anchors from this many on (default 1) */
   minSubs?: number
}>(), {
   minSubs: 1,
})

const theContext = usePageSections('ez-page-sections-toc')

/** Below md, the sections the user opened or closed by hand */
const theOpenById = ref<Record<string, boolean>>({})

/** The anchors of each section, without the sections under minSubs */
const theSubsBySection = computed(() => {
   const groups = new Map<string, AnchorMeta[]>()
   for (const anchor of theContext.anchors.value) groups.set(anchor.sectionId, [...(groups.get(anchor.sectionId) ?? []), anchor])
   return new Map([...groups].filter(([, list]) => list.length >= props.minSubs))
})

function subsOf(sectionId: string): AnchorMeta[] {
   return theSubsBySection.value.get(sectionId) ?? []
}

function hasSubs(sectionId: string): boolean {
   return subsOf(sectionId).length > 0
}

function isActive(sectionId: string): boolean {
   return sectionId === theContext.activeId.value
}

function isOpen(sectionId: string): boolean {
   if (theContext.isCompact.value && theOpenById.value[sectionId] !== undefined) return theOpenById.value[sectionId]
   return isActive(sectionId) && hasSubs(sectionId)
}

/** Below md, a section with anchors opens (the menu stays open); otherwise it scrolls to the section */
function onSectionClick(sectionId: string, event: MouseEvent) {
   if (theContext.isCompact.value && hasSubs(sectionId)) {
      event.stopPropagation()
      theOpenById.value = { ...theOpenById.value, [sectionId]: !isOpen(sectionId) }
      return
   }
   void theContext.scrollTo(sectionId)
}

function onAnchorClick(anchorId: string) {
   void theContext.scrollTo(anchorId)
}
</script>

<style scoped>
.ez-page-sections-toc {
   /* Variables first: the neutral greys of the app (as ez-info), the accent for where you are */
   --ez-page-sections-toc-surface: var(--color-surface);
   --ez-page-sections-toc-border: color-mix(in srgb, var(--color-foreground-subtle) 22%, transparent);
   --ez-page-sections-toc-radius: var(--radius-lg);
   --ez-page-sections-toc-active-surface: color-mix(in srgb, var(--color-foreground-subtle) 8%, var(--color-surface));
   --ez-page-sections-toc-text: var(--color-foreground-muted);
   --ez-page-sections-toc-text-active: var(--color-accent);
   --ez-page-sections-toc-badge: color-mix(in srgb, var(--color-foreground-subtle) 14%, var(--color-surface));
   --ez-page-sections-toc-badge-icon: var(--color-accent);
   --ez-page-sections-toc-badge-active: var(--color-accent);
   --ez-page-sections-toc-badge-icon-active: var(--color-foreground-inverse);
   --ez-page-sections-toc-rail: color-mix(in srgb, var(--color-foreground-subtle) 22%, var(--color-surface));
   --ez-page-sections-toc-dot: color-mix(in srgb, var(--color-foreground-subtle) 60%, var(--color-surface));
   --ez-page-sections-toc-rail-x: 22px;

   display: flex;
   flex-direction: column;
   gap: 1px;
   overflow: hidden;
   padding: var(--space-gap-sm);
   border: 1px solid var(--ez-page-sections-toc-border);
   border-radius: var(--ez-page-sections-toc-radius);
   background: var(--ez-page-sections-toc-surface);
   font-size: var(--text-sm);
}

/* A section, and the rail that runs through the badges */
.ez-page-sections-toc__section {
   position: relative;
   border-radius: var(--ez-page-sections-toc-radius);
   transition: background-color 0.2s;

   &::before {
      position: absolute;
      top: -1px;
      bottom: -1px;
      left: var(--ez-page-sections-toc-rail-x);
      width: 2px;
      border-radius: var(--radius-full);
      background: var(--ez-page-sections-toc-rail);
      content: '';
      pointer-events: none;
   }

   &:first-child::before {
      top: 9px;
   }

   &:last-child::before {
      bottom: 9px;
   }
}

.ez-page-sections-toc__section--active {
   background: var(--ez-page-sections-toc-active-surface);
}

.ez-page-sections-toc__item {
   position: relative;
   display: flex;
   align-items: center;
   gap: var(--space-gap-sm);
   width: 100%;
   padding: 10px;
   border: 0;
   background: none;
   color: var(--ez-page-sections-toc-text);
   font: inherit;
   text-align: left;
   cursor: pointer;
   transition: color 0.2s;

   &:hover {
      color: var(--ez-page-sections-toc-text-active);
   }

   &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: -2px;
      border-radius: var(--ez-page-sections-toc-radius);
   }
}

.ez-page-sections-toc__section--active .ez-page-sections-toc__item {
   color: var(--ez-page-sections-toc-text-active);
   font-weight: 500;
}

/* The badge of a section sits on the rail: it hides the line behind it */
.ez-page-sections-toc__badge {
   position: relative;
   display: flex;
   flex: none;
   align-items: center;
   justify-content: center;
   width: 1.5rem;
   aspect-ratio: 1;
   border-radius: var(--radius-sm);
   background: var(--ez-page-sections-toc-badge);
   color: var(--ez-page-sections-toc-badge-icon);
   transition: background-color 0.2s, color 0.2s;
}

.ez-page-sections-toc__section--active .ez-page-sections-toc__badge {
   background: var(--ez-page-sections-toc-badge-active);
   color: var(--ez-page-sections-toc-badge-icon-active);
}

.ez-page-sections-toc__text {
   min-width: 0;
}

.ez-page-sections-toc__chevron {
   margin-left: auto;
   color: var(--ez-page-sections-toc-dot);
   transition: transform 0.2s ease-out;
}

.ez-page-sections-toc__chevron--open {
   color: var(--ez-page-sections-toc-text-active);
   transform: rotate(90deg);
}

/* The anchors: they unfold by their row height, a dot on the rail for each */
.ez-page-sections-toc__subs {
   display: grid;
   grid-template-rows: 0fr;
   transition: grid-template-rows 0.2s ease-out;
}

.ez-page-sections-toc__subs--open {
   grid-template-rows: 1fr;
}

.ez-page-sections-toc__subs-inner {
   display: flex;
   flex-direction: column;
   min-height: 0;
   overflow: hidden;
}

.ez-page-sections-toc__subs--open .ez-page-sections-toc__subs-inner {
   padding-bottom: var(--space-gap-sm);
}

.ez-page-sections-toc__sub {
   position: relative;
   display: block;
   width: 100%;
   padding: 6px 14px 6px 45px;
   border: 0;
   background: none;
   color: var(--ez-page-sections-toc-text);
   font: inherit;
   line-height: 1.375;
   text-align: left;
   cursor: pointer;
   transition: color 0.2s;

   &::before {
      position: absolute;
      top: 50%;
      left: calc(var(--ez-page-sections-toc-rail-x) + 1px);
      width: 8px;
      aspect-ratio: 1;
      border-radius: var(--radius-full);
      background: var(--ez-page-sections-toc-dot);
      box-shadow: 0 0 0 0 transparent;
      content: '';
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: background-color 0.15s ease-out, box-shadow 0.2s ease-out;
   }

   &:hover {
      color: var(--ez-page-sections-toc-text-active);
   }

   &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: -2px;
   }

   &[aria-current='location'] {
      color: var(--ez-page-sections-toc-text-active);
      font-weight: 500;

      &::before {
         background: var(--ez-page-sections-toc-text-active);
         box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-accent) 20%, transparent);
      }
   }
}
</style>
