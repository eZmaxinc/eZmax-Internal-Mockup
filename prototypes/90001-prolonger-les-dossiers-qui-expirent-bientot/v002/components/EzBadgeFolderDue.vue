<!-- @proposal domain folder: Badge d'échéance d'un dossier avec jours restants et couleur selon l'urgence (≤ 3 jours = danger, ≤ 7 jours = warning) -->
<template>
   <div class="flex flex-col items-end gap-1">
      <ez-badge
         v-if="theBadge"
         :tone="theBadge.tone"
         :label="theBadge.label"
         dot
      />
      <span class="text-xs text-foreground-muted">
         {{ formatDate(folder.dueAt) }}
      </span>
   </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, gettext } from '@ez'
import type { BadgeTone, EzsignFolder } from '@mocks'

const props = defineProps<{
   folder: EzsignFolder
}>()

const theBadge = computed<{ tone: BadgeTone; label: string } | null>(() => {
   const folder = props.folder
   if (!folder.dueAt || folder.state === 'completed' || folder.state === 'refused') {
      return null
   }
   const days = folder.daysUntilDue()
   if (days === null) return null

   if (days < 0) {
      return {
         tone: 'danger',
         label: gettext('Expiré (%{days} j)', { days: Math.abs(days) }),
      }
   }
   if (days === 0) {
      return {
         tone: 'danger',
         label: gettext('Aujourd’hui (0 j)'),
      }
   }
   if (days === 1) {
      return {
         tone: 'danger',
         label: gettext('1 jour restant'),
      }
   }
   if (days <= 3) {
      return {
         tone: 'danger',
         label: gettext('%{days} jours restants', { days }),
      }
   }
   if (days <= 7) {
      return {
         tone: 'warning',
         label: gettext('%{days} jours restants', { days }),
      }
   }
   return {
      tone: 'neutral',
      label: gettext('%{days} jours restants', { days }),
   }
})
</script>
