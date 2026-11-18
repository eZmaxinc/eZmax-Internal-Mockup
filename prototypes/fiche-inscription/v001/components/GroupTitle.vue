<template>
   <!-- More room above a group title than between the things of a group; none when it opens its container -->
   <div class="mt-4 first:mt-0">
      <ez-heading variant="group">
         <span class="flex items-center gap-2">
            <ez-icon v-if="icon" :name="icon" :size="16" />
            {{ label }}
         </span>
      </ez-heading>
   </div>
</template>

<script setup lang="ts">
import type { IconName } from '@ez'

defineProps<{ label: string; icon?: IconName }>()
</script>
