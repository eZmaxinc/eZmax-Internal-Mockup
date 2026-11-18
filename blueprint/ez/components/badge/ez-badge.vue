<template>
   <component
      :is="as"
      class="ez-badge"
      :class="[`ez-badge--${tone}`, { 'ez-badge--solid': solid, 'ez-badge--outline': outline, 'ez-badge--clickable': isClickable }]"
      :type="as === 'button' ? 'button' : undefined"
      :href="href"
   >
      <ez-dot v-if="dot" :pulse="pulse" />
      <slot>{{ label }}</slot>
   </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EzDot from '../dot/ez-dot.vue'

const props = withDefaults(defineProps<{
   label?: string
   /** Same tone = same meaning everywhere (see brand.md) */
   tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'action'
   dot?: boolean
   /** With dot: the dot pulses, for a live status (ez-dot) */
   pulse?: boolean
   /** Filled with the solid color: the badges of a table in production */
   solid?: boolean
   /** No fill, only the outline on the surface: a secondary fact beside a status (counters, conditions) */
   outline?: boolean
   /** Renders as another element or component; a link or a button (`a`, `button`, `router-link`) becomes clickable, with a light hover */
   as?: string | object
   /** With as="a": where the link goes */
   href?: string
}>(), {
   tone: 'neutral',
   as: 'span',
})

const isClickable = computed(() => props.as !== 'span' || Boolean(props.href))
</script>

<style scoped>
.ez-badge {
   /* Variables first: what the badge's look depends on, read below; the tones only change them */
   --ez-badge-height: 22px;
   --ez-badge-padding-x: 8px;
   --ez-badge-radius: var(--radius-full);
   --ez-badge-background: color-mix(in srgb, var(--color-border-muted) 50%, var(--color-surface));
   --ez-badge-weight: 400;
   --ez-badge-color: var(--color-foreground-muted);
   /* The fill, a touch stronger: it takes a little of the text color, so it follows every tone and both themes */
   --ez-badge-border: color-mix(in srgb, var(--ez-badge-color) 14%, var(--ez-badge-background));
   /* The dot takes the text color, whatever the tone or the fill */
   --dot-color: currentColor;

   display: inline-flex;
   align-items: center;
   gap: 6px;
   height: var(--ez-badge-height);
   padding: 0 var(--ez-badge-padding-x);
   border: 1px solid var(--ez-badge-border);
   border-radius: var(--ez-badge-radius);
   background: var(--ez-badge-background);
   color: var(--ez-badge-color);
   font-family: inherit;
   font-size: var(--text-xs);
   font-weight: var(--ez-badge-weight);
   white-space: nowrap;
}

.ez-badge--info,
.ez-badge--action {
   --ez-badge-background: var(--color-surface-info);
   --ez-badge-color: var(--color-foreground-info);
}

.ez-badge--success {
   --ez-badge-background: var(--color-surface-positive);
   --ez-badge-color: var(--color-foreground-positive);
}

.ez-badge--warning {
   --ez-badge-background: var(--color-surface-warning);
   --ez-badge-color: var(--color-foreground-warning);
}

.ez-badge--danger {
   --ez-badge-background: var(--color-surface-negative);
   --ez-badge-color: var(--color-foreground-negative);
}

/* A link or a button: a veil of the text color over the fill on hover, whatever the tone */
.ez-badge--clickable {
   --ez-badge-hover: color-mix(in srgb, var(--ez-badge-color) 8%, transparent);

   cursor: pointer;
   text-decoration: none;
   transition: background-color 0.15s;
}

.ez-badge--clickable:hover {
   background-image: linear-gradient(var(--ez-badge-hover), var(--ez-badge-hover));
}

.ez-badge--clickable:focus-visible {
   outline: 2px solid var(--color-accent);
   outline-offset: 2px;
}

/* After the tones: it keeps their text color, drops their fill */
.ez-badge--outline {
   --ez-badge-background: var(--color-surface);
   --ez-badge-border: color-mix(in srgb, var(--ez-badge-color) 25%, var(--color-surface));
}

.ez-badge--solid {
   --ez-badge-background: var(--color-foreground-muted);
   --ez-badge-color: var(--color-foreground-inverse);
   --ez-badge-border: var(--ez-badge-background);

   &.ez-badge--info,
   &.ez-badge--action {
      --ez-badge-background: var(--color-info);
   }

   &.ez-badge--success {
      --ez-badge-background: var(--color-positive);
   }

   &.ez-badge--warning {
      --ez-badge-background: var(--color-warning);
   }

   &.ez-badge--danger {
      --ez-badge-background: var(--color-negative);
   }
}
</style>
