<template>
   <component :is="as" class="ez-dot" :class="[`ez-dot--${tone}`, { 'ez-dot--pulse': pulse }]" aria-hidden="true" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
   /** Same tone = same meaning everywhere, as ez-badge */
   tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'action'
   /** A ring that grows out of the dot and fades, in a loop: something live (active, in progress, online) */
   pulse?: boolean
   /** Renders as another element */
   as?: string
}>(), {
   tone: 'neutral',
   as: 'span',
})
</script>

<style scoped>
.ez-dot {
   /* Variables first: the knobs (--dot-size, --dot-color) let a parent set them, ez-badge colors it with its text */
   --ez-dot-size: var(--dot-size, 6px);
   --ez-dot-color: var(--dot-color, var(--color-foreground-subtle));
   --ez-dot-pulse-scale: 2.6;
   --ez-dot-pulse-duration: 2s;

   position: relative;
   display: inline-block;
   flex: none;
   width: var(--ez-dot-size);
   height: var(--ez-dot-size);
   border-radius: var(--radius-full);
   background: var(--ez-dot-color);
}

.ez-dot--info {
   --ez-dot-color: var(--dot-color, var(--color-info));
}

.ez-dot--action {
   --ez-dot-color: var(--dot-color, var(--color-accent));
}

.ez-dot--success {
   --ez-dot-color: var(--dot-color, var(--color-positive));
}

.ez-dot--warning {
   --ez-dot-color: var(--dot-color, var(--color-warning));
}

.ez-dot--danger {
   --ez-dot-color: var(--dot-color, var(--color-negative));
}

/* The pulse: a thin ring, the dot's color, that grows and fades */
.ez-dot--pulse::after {
   content: "";
   position: absolute;
   inset: 0;
   border: 1px solid var(--ez-dot-color);
   border-radius: inherit;
   animation: ez-dot-pulse var(--ez-dot-pulse-duration) cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ez-dot-pulse {
   0% {
      opacity: 0.8;
      transform: scale(1);
   }

   70%,
   100% {
      opacity: 0;
      transform: scale(var(--ez-dot-pulse-scale));
   }
}

@media (prefers-reduced-motion: reduce) {
   .ez-dot--pulse::after {
      animation: none;
   }
}
</style>
