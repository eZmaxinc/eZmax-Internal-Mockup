<template>
   <!-- A group of settings folded under its title, as in production (« Envoi du document signé ») -->
   <details class="disclosure">
      <summary class="disclosure__summary">
         <span>{{ title }}</span>
         <ez-icon name="chevronDown" :size="16" class="disclosure__chevron" />
      </summary>
      <div class="disclosure__body">
         <slot />
      </div>
   </details>
</template>

<script setup lang="ts">
defineProps<{
   title: string
}>()
</script>

<style scoped>
.disclosure {
   border: 1px solid var(--color-border-muted);
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
}

.disclosure__summary {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: var(--space-gap-sm);
   padding: var(--space-inset-sm);
   cursor: pointer;
   font-size: var(--text-sm);
   font-weight: 500;
   list-style: none;
}

.disclosure__summary::-webkit-details-marker {
   display: none;
}

.disclosure__summary:focus-visible {
   outline: 2px solid var(--color-accent);
   outline-offset: -2px;
}

.disclosure__chevron {
   color: var(--color-foreground-muted);
   transition: transform 0.15s;
}

.disclosure[open] .disclosure__chevron {
   transform: rotate(180deg);
}

.disclosure__body {
   padding: 0 var(--space-inset-sm) var(--space-inset-sm);
}
</style>
