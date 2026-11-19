<template>
   <!-- More room above a group title than between the things of a group; none when it opens its container -->
   <div class="mt-4 first:mt-0">
      <ez-heading variant="group">{{ label }}</ez-heading>
   </div>
</template>

<script setup lang="ts">
/** A group title has no icon: the text alone (brand.md) */
defineProps<{ label: string }>()
</script>
