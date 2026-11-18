<template>
   <component :is="tag" class="ez-heading" :class="`ez-heading--${variant}`">
      <slot />
   </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type HeadingVariant = 'page' | 'section' | 'card' | 'group'
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'legend' | 'span'

const props = withDefaults(defineProps<{
   /** The level of the title in the page: it sets the look, and the tag when `as` is not given */
   variant?: HeadingVariant
   /** Renders as another tag without changing the look (default: page → h1, section → h2, card and group → h3) */
   as?: HeadingTag
}>(), {
   variant: 'section',
})

const DEFAULT_TAGS: Record<HeadingVariant, HeadingTag> = {
   page: 'h1',
   section: 'h2',
   card: 'h3',
   group: 'h3',
}

const tag = computed(() => props.as ?? DEFAULT_TAGS[props.variant])
</script>

<style scoped>
.ez-heading {
   /* Variables first: what the heading's look depends on, read below; the variants only change them */
   --ez-heading-size: var(--text-lg);
   --ez-heading-weight: 500;
   --ez-heading-color: var(--color-foreground-muted);

   min-width: 0;
   margin: 0;
   padding: 0;
   font-size: var(--ez-heading-size);
   font-weight: var(--ez-heading-weight);
   line-height: 1.375;
   color: var(--ez-heading-color);
}

.ez-heading--page {
   --ez-heading-size: var(--text-2xl);
   --ez-heading-weight: 600;
   --ez-heading-color: var(--color-foreground);
}

.ez-heading--card {
   --ez-heading-size: var(--text-base);
   --ez-heading-color: var(--color-foreground);
}

.ez-heading--group {
   --ez-heading-size: var(--text-xs);
}
</style>
