<!-- @proposal primitive: Masque le bas d'un contenu (fade) sous un seuil de largeur et le dévoile au tap/clic; réduit par défaut sur mobile -->
<template>
   <div
      class="ez-reveal"
      :class="{
         'ez-reveal--expanded': !theCollapsed,
         'ez-reveal--fade-muted': fadeTo === 'muted',
      }"
      :style="{ '--reveal-collapsed-height': collapsedHeight }"
   >
      <div ref="theContentEl" class="ez-reveal__content">
         <slot />
      </div>

      <div
         v-if="theMobile && theOverflows && theCollapsed"
         class="ez-reveal__scrim"
         role="button"
         tabindex="0"
         :aria-expanded="false"
         :aria-label="expandLabel"
         @click="theCollapsed = false"
         @keydown.enter.prevent="theCollapsed = false"
         @keydown.space.prevent="theCollapsed = false"
      >
         <span class="ez-reveal__scrim-label">
            {{ expandLabel }}
            <ez-icon name="chevronDown" :size="16" />
         </span>
      </div>

      <div v-else-if="theMobile && theOverflows && !theCollapsed" class="ez-reveal__footer">
         <ez-btn
            variant="flat"
            size="sm"
            :icon="ez.icons.chevronDown"
            class="ez-reveal__collapse-btn"
            :label="collapseLabel"
            :aria-expanded="true"
            @click="theCollapsed = true"
         />
      </div>
   </div>
</template>

<script setup lang="ts">
import { gettext } from "@ez";
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	useSlots,
	watch,
} from "vue";

const MOBILE_QUERY = "(max-width: 39.99rem)";

const props = withDefaults(
	defineProps<{
		/** Max height while collapsed (CSS length) */
		collapsedHeight?: string;
		/** Color the fade blends into: card surface, or muted inset panels */
		fadeTo?: "surface" | "muted";
		expandLabel?: string;
		collapseLabel?: string;
	}>(),
	{
		collapsedHeight: "10rem",
		fadeTo: "surface",
		expandLabel: undefined,
		collapseLabel: undefined,
	},
);

const theSlots = useSlots();
const theContentEl = ref<HTMLElement | null>(null);
/** Always start collapsed; entering mobile resets to collapsed */
const theCollapsed = ref(true);
/** Assume overflow until measured, so the fade can show on first paint */
const theOverflows = ref(true);
const theMobile = ref(false);

const expandLabel = computed(() => props.expandLabel ?? gettext("Voir plus"));
const collapseLabel = computed(() => props.collapseLabel ?? gettext("Réduire"));

let theObserver: ResizeObserver | null = null;
let theMedia: MediaQueryList | null = null;

function collapsedBudgetPx(el: HTMLElement): number {
	const probe = document.createElement("div");
	probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;height:${props.collapsedHeight}`;
	el.appendChild(probe);
	const px = probe.offsetHeight;
	probe.remove();
	return px;
}

function measure() {
	const el = theContentEl.value;
	if (!el) return;
	// Temporarily reveal full height so scrollHeight is trustworthy while collapsed via CSS
	const prev = el.style.maxHeight;
	el.style.maxHeight = "none";
	theOverflows.value = el.scrollHeight > collapsedBudgetPx(el) + 8;
	el.style.maxHeight = prev;
}

function syncMobile(matches: boolean) {
	theMobile.value = matches;
	if (matches) theCollapsed.value = true;
	nextTick(() => measure());
}

function onMediaChange(event: MediaQueryListEvent) {
	syncMobile(event.matches);
}

onMounted(() => {
	theMedia = window.matchMedia(MOBILE_QUERY);
	syncMobile(theMedia.matches);
	theMedia.addEventListener("change", onMediaChange);

	requestAnimationFrame(() => measure());

	if (!theContentEl.value || typeof ResizeObserver === "undefined") return;
	theObserver = new ResizeObserver(() => measure());
	theObserver.observe(theContentEl.value);
});

onBeforeUnmount(() => {
	theObserver?.disconnect();
	theMedia?.removeEventListener("change", onMediaChange);
});

watch(
	() => theSlots.default?.(),
	async () => {
		await nextTick();
		measure();
	},
);
</script>

<style scoped>
.ez-reveal {
   --reveal-collapsed-height: 10rem;
   --_fade-to: var(--color-surface);

   position: relative;
}

.ez-reveal--fade-muted {
   --_fade-to: var(--color-surface-muted);
}

.ez-reveal__content {
   min-width: 0;
}

/* Reduced by default under sm; only .ez-reveal--expanded shows the full content */
@media (max-width: 39.99rem) {
   .ez-reveal:not(.ez-reveal--expanded) .ez-reveal__content {
      max-height: var(--reveal-collapsed-height);
      overflow: hidden;
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
      padding: 0 0 var(--space-inset-sm);
      border: 0;
      /* Solid early: no leftover bubble under the CTA */
      background: linear-gradient(
         to bottom,
         color-mix(in srgb, var(--_fade-to) 0%, transparent) 0%,
         var(--_fade-to) 30%,
         var(--_fade-to) 100%
      );
      cursor: pointer;
   }

   .ez-reveal__scrim-label {
      display: inline-flex;
      align-items: center;
      gap: var(--space-gap-sm);
      color: var(--color-accent);
      font-size: var(--text-sm);
      font-weight: 600;
   }

   .ez-reveal__footer {
      display: flex;
      justify-content: center;
      padding-top: var(--space-gap-sm);
   }

   .ez-reveal__collapse-btn :deep(svg) {
      transform: rotate(180deg);
   }
}

@media (min-width: 40rem) {
   .ez-reveal__scrim,
   .ez-reveal__footer {
      display: none;
   }
}
</style>
