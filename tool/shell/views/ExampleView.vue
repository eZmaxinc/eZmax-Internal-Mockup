<template>
   <mockup-viewer v-if="theExample" :frames="[`e/${theExample.id}`]" :scenario-names="theScenarioNames">
      <template #devbar-start>
         <strong>Référence · {{ theExample.id }}</strong>
      </template>
      <template #panel>
         <div class="markdown" v-html="renderMarkdown(theExample.notes.body)" />
      </template>
   </mockup-viewer>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import MockupViewer from '../MockupViewer.vue'
import { renderMarkdown } from '../markdown'
import { useScenarioNames } from '../scenario-names'
import { listPatterns } from '@/registry'

const router = useRouter()
const props = defineProps<{ name: string }>()
const theExample = computed(() => listPatterns().find((pattern) => pattern.id === props.name))

watchEffect(() => {
   if (!theExample.value) {
      router.replace({ path: '/', query: { notfound: '1' } })
   }
})

const theScenarioNames = useScenarioNames(() => theExample.value && `blueprint/patterns/${theExample.value.id}`)
</script>
