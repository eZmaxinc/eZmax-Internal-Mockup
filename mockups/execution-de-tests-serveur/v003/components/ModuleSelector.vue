<template>
   <div ref="theRootRef" class="module-selector">
      <label class="module-selector__label">
         {{ label }}
         <span v-if="required" class="text-foreground-negative" aria-hidden="true">*</span>
      </label>

      <div
         role="button"
         :tabindex="disabled ? -1 : 0"
         :aria-expanded="isOpen"
         :aria-disabled="disabled"
         class="module-selector__trigger"
         :class="{
            'module-selector__trigger--open': isOpen,
            'module-selector__trigger--error': Boolean(error),
            'module-selector__trigger--disabled': disabled,
         }"
         @click="onToggleOpen"
         @keydown.enter.prevent="onToggleOpen"
         @keydown.space.prevent="onToggleOpen"
         @keydown.escape="onClose"
      >
         <div class="module-selector__trigger-content">
            <span v-if="modelValue.length === 0" class="text-foreground-subtle">
               {{ placeholder }}
            </span>
            <span v-else-if="modelValue.length >= modules.length" class="text-foreground font-medium">
               {{ $gettext('Tous les modules (%{count})', { count: modules.length }) }}
            </span>
            <div v-else class="flex items-center gap-1.5 flex-wrap">
               <ez-badge
                  v-for="mod in theVisibleChips"
                  :key="mod.id"
                  tone="info"
                  :label="mod.shortLabel"
               />
               <ez-badge
                  v-if="theHiddenChipsCount > 0"
                  tone="neutral"
                  :label="`+${theHiddenChipsCount}`"
               />
            </div>
         </div>

         <ez-icon
            :name="ez.icons.chevronDown"
            class="w-4 h-4 text-foreground-muted shrink-0 transition-transform"
            :class="isOpen ? 'rotate-180' : ''"
         />
      </div>

      <p v-if="error" class="module-selector__error">{{ error }}</p>

      <div v-if="isOpen" class="module-selector__panel">
         <div class="module-selector__panel-header">
            <ez-field
               v-model="theSearch"
               :placeholder="$gettext('Filtrer par module, catégorie…')"
               :icon="ez.icons.search"
            />
            <div class="flex items-center justify-between gap-2 pt-2">
               <span class="text-xs text-foreground-muted">
                  {{ $gettext('%{count} sélectionné(s)', { count: modelValue.length }) }}
               </span>
               <div class="flex items-center gap-1">
                  <ez-btn
                     variant="flat"
                     size="sm"
                     :label="$gettext('Tout')"
                     @click="onSelectAll"
                  />
                  <ez-btn
                     variant="flat"
                     size="sm"
                     :label="$gettext('Aucun')"
                     @click="onClearAll"
                  />
               </div>
            </div>
         </div>

         <div class="module-selector__tree">
            <div v-if="theGroupedTree.length === 0" class="py-6 text-center text-xs text-foreground-subtle">
               {{ $gettext('Aucun module correspondant') }}
            </div>

            <div
               v-for="cat in theGroupedTree"
               :key="cat.name"
               class="module-selector__category"
            >
               <div class="module-selector__row module-selector__row--category">
                  <div
                     role="button"
                     tabindex="0"
                     class="module-selector__expand"
                     :aria-label="$gettext('Afficher ou masquer')"
                     @click.stop="onToggleCategoryExpand(cat.name)"
                     @keydown.enter.prevent="onToggleCategoryExpand(cat.name)"
                  >
                     <ez-icon
                        :name="isCategoryExpanded(cat.name) ? ez.icons.chevronDown : ez.icons.chevronRight"
                        class="w-3.5 h-3.5 text-foreground-muted shrink-0"
                     />
                  </div>

                  <div
                     role="checkbox"
                     tabindex="0"
                     :aria-checked="getGroupCheckState(cat.moduleIds)"
                     class="module-selector__check-row"
                     @click="onToggleGroup(cat.moduleIds)"
                     @keydown.space.prevent="onToggleGroup(cat.moduleIds)"
                  >
                     <span
                        class="module-selector__checkbox"
                        :class="`module-selector__checkbox--${getGroupCheckState(cat.moduleIds)}`"
                     >
                        <ez-icon
                           v-if="getGroupCheckState(cat.moduleIds) === 'true'"
                           :name="ez.icons.check"
                           class="w-3 h-3 shrink-0"
                        />
                        <span
                           v-else-if="getGroupCheckState(cat.moduleIds) === 'mixed'"
                           class="module-selector__indeterminate"
                        />
                     </span>
                     <span class="text-xs font-semibold text-foreground">{{ cat.name }}</span>
                  </div>

                  <span class="text-xs text-foreground-subtle ml-auto">
                     {{ countSelected(cat.moduleIds) }}/{{ cat.moduleIds.length }}
                  </span>
               </div>

               <div v-if="isCategoryExpanded(cat.name)" class="module-selector__modules">
                  <div
                     v-for="mod in cat.modules"
                     :key="mod.id"
                     role="checkbox"
                     tabindex="0"
                     :aria-checked="isModuleSelected(mod.id)"
                     class="module-selector__row module-selector__row--module"
                     @click="onToggleModule(mod.id)"
                     @keydown.space.prevent="onToggleModule(mod.id)"
                  >
                     <span
                        class="module-selector__checkbox"
                        :class="isModuleSelected(mod.id) ? 'module-selector__checkbox--true' : 'module-selector__checkbox--false'"
                     >
                        <ez-icon
                           v-if="isModuleSelected(mod.id)"
                           :name="ez.icons.check"
                           class="w-3 h-3 shrink-0"
                        />
                     </span>
                     <span class="text-xs text-foreground">{{ mod.label }}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef } from 'vue'
import { ez } from '@ez'
import type { TestModule } from '../mocks'

const props = withDefaults(
   defineProps<{
      modelValue: string[]
      modules: TestModule[]
      label: string
      placeholder?: string
      error?: string
      disabled?: boolean
      required?: boolean
   }>(),
   {
      placeholder: '',
      error: '',
      disabled: false,
      required: false,
   },
)

const emit = defineEmits<{
   'update:modelValue': [value: string[]]
}>()

const theRootRef = useTemplateRef<HTMLElement>('theRootRef')
const isOpen = ref(false)
const theSearch = ref('')
const theExpandedCategories = reactive<Record<string, boolean>>({})

const theSelectedSet = computed(() => new Set(props.modelValue))

const theVisibleChips = computed(() =>
   props.modules.filter((mod) => theSelectedSet.value.has(mod.id)).slice(0, 2),
)

const theHiddenChipsCount = computed(() =>
   Math.max(0, props.modelValue.length - 2),
)

const theGroupedTree = computed(() => {
   const query = theSearch.value.trim().toLowerCase()
   const filtered = query
      ? props.modules.filter(
           (mod) =>
              mod.label.toLowerCase().includes(query) ||
              mod.shortLabel.toLowerCase().includes(query) ||
              mod.category.toLowerCase().includes(query) ||
              mod.subcategory.toLowerCase().includes(query),
        )
      : props.modules

   const categoriesMap = new Map<string, TestModule[]>()

   for (const mod of filtered) {
      if (!categoriesMap.has(mod.category)) {
         categoriesMap.set(mod.category, [])
      }
      categoriesMap.get(mod.category)!.push(mod)
   }

   return Array.from(categoriesMap.entries()).map(([catName, mods]) => ({
      name: catName,
      modules: mods,
      moduleIds: mods.map((m) => m.id),
   }))
})

function isModuleSelected(id: string): boolean {
   return theSelectedSet.value.has(id)
}

function countSelected(ids: string[]): number {
   return ids.filter((id) => theSelectedSet.value.has(id)).length
}

function getGroupCheckState(ids: string[]): 'true' | 'false' | 'mixed' {
   const count = countSelected(ids)
   if (count === 0) return 'false'
   if (count === ids.length) return 'true'
   return 'mixed'
}

function isCategoryExpanded(categoryName: string): boolean {
   if (theSearch.value.trim()) return true
   return Boolean(theExpandedCategories[categoryName])
}

function onToggleCategoryExpand(categoryName: string) {
   theExpandedCategories[categoryName] = !theExpandedCategories[categoryName]
}

function onToggleOpen() {
   if (props.disabled) return
   isOpen.value = !isOpen.value
}

function onClose() {
   isOpen.value = false
}

function onToggleModule(id: string) {
   const next = new Set(props.modelValue)
   if (next.has(id)) {
      next.delete(id)
   } else {
      next.add(id)
   }
   emit('update:modelValue', Array.from(next))
}

function onToggleGroup(ids: string[]) {
   const next = new Set(props.modelValue)
   const allSelected = ids.every((id) => next.has(id))
   for (const id of ids) {
      if (allSelected) {
         next.delete(id)
      } else {
         next.add(id)
      }
   }
   emit('update:modelValue', Array.from(next))
}

function onSelectAll() {
   emit('update:modelValue', props.modules.map((mod) => mod.id))
}

function onClearAll() {
   emit('update:modelValue', [])
}

function onDocumentClick(event: MouseEvent) {
   if (!isOpen.value) return
   const target = event.target as Node | null
   if (theRootRef.value && target && !theRootRef.value.contains(target)) {
      isOpen.value = false
   }
}

onMounted(() => {
   document.addEventListener('mousedown', onDocumentClick)
})

onBeforeUnmount(() => {
   document.removeEventListener('mousedown', onDocumentClick)
})
</script>

<style scoped>
.module-selector {
   position: relative;
   display: flex;
   flex-direction: column;
   gap: 0.375rem;
}

.module-selector__label {
   font-size: 0.875rem;
   font-weight: 600;
   line-height: 1.25rem;
   color: var(--color-foreground);
}

.module-selector__trigger {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 0.5rem;
   min-height: 2.5rem;
   padding: 0.375rem 0.75rem;
   border: 1px solid var(--color-border);
   border-radius: var(--radius-md);
   background: var(--color-surface);
   color: var(--color-foreground);
   font-size: var(--text-sm);
   cursor: pointer;
   transition: border-color 0.15s ease;
}

.module-selector__trigger:hover:not(.module-selector__trigger--disabled) {
   border-color: var(--color-border-strong);
}

.module-selector__trigger--open {
   border-color: var(--color-accent);
}

.module-selector__trigger--error {
   border-color: var(--color-negative);
}

.module-selector__trigger--disabled {
   opacity: 0.6;
   cursor: not-allowed;
}

.module-selector__trigger-content {
   flex: 1;
   min-width: 0;
}

.module-selector__error {
   font-size: var(--text-xs);
   color: var(--color-foreground-negative);
   margin: 0;
}

.module-selector__panel {
   position: absolute;
   top: calc(100% + var(--space-gap-xs));
   left: 0;
   right: 0;
   z-index: 30;
   border: 1px solid var(--color-border);
   border-radius: var(--radius-md);
   background: var(--color-surface);
   box-shadow: var(--shadow-lg);
   overflow: hidden;
}

.module-selector__panel-header {
   padding: var(--space-inset-sm);
   border-bottom: 1px solid var(--color-border-muted);
   background: var(--color-background);
}

.module-selector__tree {
   max-height: 18rem;
   overflow-y: auto;
   padding: var(--space-inset-xs);
}

.module-selector__category + .module-selector__category {
   margin-top: var(--space-gap-xs);
}

.module-selector__row {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   padding: 0.375rem 0.5rem;
   border-radius: var(--radius-sm);
   cursor: pointer;
   user-select: none;
}

.module-selector__row:hover {
   background: var(--color-background);
}

.module-selector__row--category {
   background: var(--color-background);
}

.module-selector__row--module {
   padding-left: 2.25rem;
}

.module-selector__expand {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   width: 1.25rem;
   height: 1.25rem;
   border-radius: var(--radius-sm);
}

.module-selector__check-row {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   flex: 1;
   min-width: 0;
}

.module-selector__checkbox {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   width: 1rem;
   height: 1rem;
   border-radius: var(--radius-sm);
   border: 1px solid var(--color-border-strong);
   background: var(--color-surface);
   color: var(--color-surface);
   flex-shrink: 0;
}

.module-selector__checkbox--true,
.module-selector__checkbox--mixed {
   border-color: var(--color-accent);
   background: var(--color-accent);
}

.module-selector__indeterminate {
   width: 0.5rem;
   height: 2px;
   background: var(--color-surface);
   border-radius: var(--radius-full);
}
</style>
