<!-- @proposal domain folder: Prolonger l'échéance d'un dossier: règle d'éligibilité (ni complété ni refusé), libellé et icône uniformes -->
<template>
   <ez-btn
      v-if="canBeExtended"
      :variant="variant"
      :size="size"
      :icon="ez.icons.clock"
      :label="$gettext('Prolonger')"
      @click="emit('extend', folder)"
   />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EzsignFolder } from '@mocks'

const props = withDefaults(
   defineProps<{
      folder: EzsignFolder
      variant?: 'primary' | 'secondary' | 'flat'
      size?: 'md' | 'sm'
   }>(),
   {
      variant: 'flat',
      size: 'sm',
   },
)

const emit = defineEmits<{
   extend: [folder: EzsignFolder]
}>()

const canBeExtended = computed(
   () => props.folder.state !== 'completed' && props.folder.state !== 'refused',
)
</script>
