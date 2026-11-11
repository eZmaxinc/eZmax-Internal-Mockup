<template>
   <ez-badge :tone="signer.stateTone()" :label="signer.stateLabel()" :dot="dot" :solid="solid" />
</template>

<script setup lang="ts">
/**
 * The state of a signer (pending, viewed, signed, refused): same state, same badge, everywhere.
 * Use it instead of <ez-badge :tone="signer.stateTone()" :label="signer.stateLabel()" />.
 */
import type { EzsignSigner } from '@mocks'

defineProps<{
   signer: EzsignSigner
   /** Small dot before the label, for dense lists */
   dot?: boolean
   /** Filled badge, for tables */
   solid?: boolean
}>()
</script>
