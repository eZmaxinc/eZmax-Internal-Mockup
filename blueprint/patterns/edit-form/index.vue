<template>
   <ez-page>
      <ez-page-header :title="theForm.id ? $gettext('Modifier le dossier') : $gettext('Nouveau dossier')" cancelable />
      <ez-page-content>
         <form @submit.prevent="save">
            <ez-layout>
               <ez-layout-col :span="{ xs: 12, md: 8 }">
                  <ez-card :title="$gettext('Informations')">
                     <ez-layout>
                        <ez-layout-col>
                           <ez-field v-model="theForm.name" :label="$gettext('Nom du dossier')" required :error="theErrors.name" />
                        </ez-layout-col>
                        <ez-layout-col :span="{ xs: 12, md: 6 }">
                           <ez-field v-model="theForm.language" :label="$gettext('Langue des courriels')" type="select" :options="languageOptions" />
                        </ez-layout-col>
                        <ez-layout-col :span="{ xs: 12, md: 6 }">
                           <ez-field v-model="theForm.dueAt" :label="$gettext('Échéance')" type="date" :hint="$gettext('Le dossier expire à cette date')" />
                        </ez-layout-col>
                        <ez-layout-col>
                           <ez-field v-model="theForm.message" :label="$gettext('Message aux signataires')" type="textarea" />
                        </ez-layout-col>
                     </ez-layout>
                  </ez-card>

                  <ez-card :title="$gettext('Signataires')">
                     <template #actions>
                        <ez-btn variant="flat" size="sm" :icon="ez.icons.add" :label="$gettext('Ajouter')" />
                     </template>
                     <ez-empty-state
                        v-if="!theForm.signers.length"
                        :title="$gettext('Aucun signataire')"
                        :text="$gettext('Ajoutez au moins un signataire pour envoyer le dossier.')"
                        :icon="ez.icons.users"
                     />
                     <ul v-else class="m-0 flex list-none flex-col gap-2 p-0">
                        <li v-for="theSigner in theForm.signers" :key="theSigner.id" class="flex items-center justify-between gap-3">
                           <span>
                              <span class="font-semibold">{{ theSigner.fullName }}</span>
                              <span class="text-foreground-muted"> · {{ theSigner.email }}</span>
                           </span>
                           <ez-btn variant="flat" size="sm" :icon="ez.icons.delete" :aria-label="$gettext('Retirer')" />
                        </li>
                     </ul>
                  </ez-card>
               </ez-layout-col>

               <ez-layout-col :span="{ xs: 12, md: 4 }" first-below-md>
                  <ez-card :title="$gettext('Résumé')">
                     <ez-info :data="theSummary" />
                     <template #footer>
                        <ez-btn variant="flat" :label="$gettext('Annuler')" />
                        <ez-btn variant="primary" type="submit" :loading="isSaving" :label="$gettext('Enregistrer')" />
                     </template>
                  </ez-card>
               </ez-layout-col>
            </ez-layout>
         </form>
      </ez-page-content>
   </ez-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { gettext, useScenario, type IInfoCategory } from '@ez'
import { scenarios } from './mocks'

const theData = useScenario(scenarios)
const theForm = computed(() => theData.value)
const theErrors = reactive({ name: '' })
const isSaving = ref(false)

const languageOptions = [
   { label: 'Français', value: 'fr' },
   { label: 'English', value: 'en' },
]

const theSummary = computed<IInfoCategory[]>(() => [
   {
      name: 'summary',
      items: [
         { key: 'signers', label: gettext('Signataires'), value: theForm.value.signers.length, col: 6 },
         { key: 'language', label: gettext('Langue'), value: theForm.value.language === 'fr' ? 'Français' : 'English', col: 6 },
      ],
   },
])

function save() {
   theErrors.name = theForm.value.name.trim() ? '' : gettext('Le nom est requis.')
   if (theErrors.name) return
   isSaving.value = true
   setTimeout(() => (isSaving.value = false), 800)
}
</script>
