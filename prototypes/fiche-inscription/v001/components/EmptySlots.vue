<template>
   <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <li
         v-for="theSlot in items"
         :key="theSlot.title"
         class="flex items-center gap-2 rounded-sm border border-dashed border-border-strong py-1 pr-1 pl-3"
      >
         <span class="text-foreground-subtle"><ez-icon :name="theSlot.icon" :size="16" /></span>
         <span class="flex-1 text-sm font-medium text-foreground-muted">{{ theSlot.title }}</span>
         <ez-btn variant="flat" size="sm" :label="$gettext('Ajouter')" />
      </li>
   </ul>
</template>

<script setup lang="ts">
import type { EmptySlot } from '../mocks'

defineProps<{ items: EmptySlot[] }>()
</script>
