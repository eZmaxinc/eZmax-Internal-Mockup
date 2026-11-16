<template>
   <!-- Text one click copies: a command, a path. The icon turns into a check for a moment. -->
   <button type="button" class="copy-button shell-mono" :class="{ 'copy-button--outlined': outlined, 'copy-button--truncate': truncate }" :title="`Copier: ${text}`" @click="copy">
      <span class="copy-button__text">{{ text }}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
         <path v-if="theCopied" d="M20 6 9 17l-5-5" />
         <template v-else>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
         </template>
      </svg>
      <span class="copy-button__status" role="status">{{ theCopied ? 'Copié' : '' }}</span>
   </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
   text: string
   /** A border and a surface, when it stands alone on the page background */
   outlined?: boolean
   /** One line, cut at the start: the end of a path is the part that tells them apart */
   truncate?: boolean
}>()
const theCopied = ref(false)

async function copy() {
   try {
      await navigator.clipboard.writeText(props.text)
      theCopied.value = true
      setTimeout(() => (theCopied.value = false), 1200)
   }
   catch {
      // clipboard unavailable: the text stays readable, to select by hand
   }
}
</script>

<style scoped>
.copy-button {
   display: inline-flex;
   align-items: center;
   gap: 8px;
   max-width: 100%;
   padding: 4px 8px;
   border: 1px solid transparent;
   border-radius: var(--shell-radius);
   background: transparent;
   color: var(--shell-fg-muted);
   text-align: left;
   cursor: pointer;

   svg {
      flex-shrink: 0;
      color: var(--shell-fg-subtle);
   }

   &:hover {
      background: var(--shell-hover);
      color: var(--shell-fg);

      svg {
         color: var(--shell-fg);
      }
   }
}

.copy-button--outlined {
   border-color: var(--shell-border);
   background: var(--shell-surface);

   &:hover {
      border-color: var(--shell-border-strong);
      background: var(--shell-surface);
   }
}

.copy-button--truncate {
   display: flex;
   width: 100%;
   font-size: 11px;

   .copy-button__text {
      flex: 1;
      overflow: hidden;
      direction: rtl;
      text-align: left;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow-wrap: normal;
   }
}

.copy-button__text {
   min-width: 0;
   overflow-wrap: anywhere;
}

/* Announced to screen readers only: the check says it to the eye */
.copy-button__status {
   position: absolute;
   width: 1px;
   height: 1px;
   overflow: hidden;
   clip-path: inset(50%);
}
</style>
