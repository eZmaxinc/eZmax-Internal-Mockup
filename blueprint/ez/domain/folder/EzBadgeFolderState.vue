<template>
   <ez-badge :tone="folder.stateTone()" :label="folder.stateLabel()" :dot="dot" :solid="solid" />
</template>

<script setup lang="ts">
/**
 * The state of an eZsign folder: same state, same badge, everywhere.
 * Use it instead of <ez-badge :tone="folder.stateTone()" :label="folder.stateLabel()" />.
 */
import type { EzsignFolder } from '@mocks'

defineProps<{
   folder: EzsignFolder
   /** Small dot before the label, for dense lists */
   dot?: boolean
   /** Filled badge, for tables */
   solid?: boolean
}>()
</script>
