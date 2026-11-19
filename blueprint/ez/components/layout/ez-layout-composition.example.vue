<!-- Exemple de la galerie. Une mise en page déclarée en données: deux sections, des colonnes, un groupe en wrap; un slot pour toutes les feuilles. -->
<template>
   <ez-layout-composition :composition="theComposition">
      <template #field="{ label }">
         <div class="example-cell">{{ label }}</div>
      </template>
   </ez-layout-composition>
</template>

<script setup lang="ts">
import { defineLayoutComposition } from './layout'

const theComposition = defineLayoutComposition((t) => [
   {
      key: 'identity',
      title: t('Identité'),
      span: { xs: 12, md: 6 },
      cols: [
         { id: 'first-name', slot: 'firstName', label: t('Prénom'), span: 6 },
         { id: 'last-name', slot: 'lastName', label: t('Nom'), span: 6 },
         { id: 'email', slot: 'email', label: t('Courriel') },
      ],
   },
   {
      key: 'preferences',
      title: t('Préférences'),
      span: { xs: 12, md: 6 },
      cols: [
         { id: 'language', slot: 'language', label: t('Langue'), span: 6 },
         { id: 'timezone', slot: 'timezone', label: t('Fuseau horaire'), span: 6 },
         {
            id: 'channels',
            direction: 'wrap',
            gap: 2,
            cols: [
               { id: 'mail', slot: 'mail', label: t('Courriel') },
               { id: 'sms', slot: 'sms', label: t('SMS') },
            ],
         },
      ],
   },
])
</script>

<style scoped>
.example-cell {
   padding: var(--space-gap-sm) var(--space-inset-sm);
   border: 1px dashed var(--color-border);
   border-radius: var(--radius-sm);
   background: var(--color-surface-muted);
   color: var(--color-foreground-muted);
   font-size: var(--text-sm);
}
</style>
