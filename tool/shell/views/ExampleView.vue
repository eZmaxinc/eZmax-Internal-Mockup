<template>
   <div v-if="!theExample" class="p-6">Exemple introuvable: {{ name }}</div>
   <proto-viewer v-else :frames="[`e/${theExample.id}`]" :scenario-names="theScenarioNames">
      <template #devbar-start>
         <strong>Référence · {{ theExample.id }}</strong>
      </template>
      <template #panel>
         <div class="markdown" v-html="renderMarkdown(theExample.notes.body)" />
      </template>
   </proto-viewer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProtoViewer from '../ProtoViewer.vue'
import { renderMarkdown } from '../markdown'
import { useScenarioNames } from '../scenario-names'
import { listPatterns } from '@/registry'

const props = defineProps<{ name: string }>()
const theExample = computed(() => listPatterns().find((pattern) => pattern.id === props.name))
const theScenarioNames = useScenarioNames(() => theExample.value && `blueprint/patterns/${theExample.value.id}`)
</script>
