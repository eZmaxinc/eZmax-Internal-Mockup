<template>
   <component
      :is="clickable ? 'a' : 'div'"
      :href="clickable ? '#' : undefined"
      class="stat-tile flex items-stretch rounded-sm bg-surface-muted"
      :class="{ 'stat-tile--clickable': clickable }"
      @click="onClick"
   >
      <span class="flex flex-1 items-center px-3 py-2 text-xs text-foreground-muted">{{ stat.label }}</span>
      <span
         class="stat-tile__value m-1.5 flex min-w-16 items-center justify-center rounded-sm bg-surface px-3 text-base font-bold"
         :class="stat.isAlert ? 'text-foreground-negative' : 'text-foreground'"
      >
         {{ stat.value }}
      </span>
   </component>
</template>

<script setup lang="ts">
import type { Stat } from '../mocks'

const props = defineProps<{ stat: Stat; clickable?: boolean }>()

function onClick(event: Event) {
   if (props.clickable) event.preventDefault() // a prototype link: it goes nowhere
}
</script>

<style scoped>
/* The same quiet outline as the tiles of this version (EzInfoList, TileBox) */
.stat-tile {
   --stat-tile-border: color-mix(in srgb, var(--color-border-muted) 50%, var(--color-surface-muted));

   border: 1px solid var(--stat-tile-border);
}

.stat-tile__value {
   border: 1px solid var(--stat-tile-border);
}

/* Hover only shifts the fill: enough to feel it is a link */
.stat-tile--clickable {
   transition: background-color 0.15s;
}

.stat-tile--clickable:hover {
   background: var(--color-surface-accent);
}
</style>
