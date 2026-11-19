<!-- @proposal primitive: Champ de saisie semi-automatique avec liste déroulante filtrable -->
<template>
   <component :is="as" ref="theRootRef" class="ez-autocomplete" @focusin="onFocusIn" @keydown="onKeyDown">
      <div class="ez-autocomplete__control">
         <ez-field
            v-model="theQuery"
            :label="label"
            :placeholder="placeholder"
            :hint="hint"
            :error="error"
            :icon="icon"
            :required="required"
            :disabled="disabled"
            role="combobox"
            :aria-expanded="isOpen"
            aria-autocomplete="list"
         />
         <div v-if="!disabled" class="ez-autocomplete__suffix" :class="{ 'ez-autocomplete__suffix--with-label': !!label }">
            <ez-btn
               v-if="hasValue"
               variant="flat"
               size="sm"
               :icon="ez.icons.close"
               :aria-label="$gettext('Effacer la sélection')"
               @mousedown.prevent="onClear"
            />
            <ez-icon v-else name="chevronDown" :size="16" class="ez-autocomplete__chevron" />
         </div>
      </div>

      <ul
         v-if="isOpen && !disabled"
         class="ez-autocomplete__menu"
         :class="{ 'ez-autocomplete__menu--with-hint': !!(error || hint) }"
         role="listbox"
      >
         <li v-if="!theFilteredOptions.length" class="ez-autocomplete__empty">
            {{ emptyText }}
         </li>
         <li
            v-for="(theOption, theIndex) in theFilteredOptions"
            :key="String(theOption.value)"
            role="option"
            :aria-selected="theOption.value === theValue"
            class="ez-autocomplete__option"
            :class="{
               'ez-autocomplete__option--active': theIndex === theActiveIndex,
               'ez-autocomplete__option--selected': theOption.value === theValue,
            }"
            @mousedown.prevent="onSelect(theOption)"
            @mouseenter="theActiveIndex = theIndex"
         >
            <span class="ez-autocomplete__option-label" :class="{ 'ez-autocomplete__option-label--mono': mono }">{{ theOption.label }}</span>
            <span v-if="theOption.meta" class="ez-autocomplete__option-meta">{{ theOption.meta }}</span>
         </li>
      </ul>
   </component>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import type { IconName } from '@ez'

export interface EzAutocompleteOption {
   label: string
   value: string | number
   meta?: string
}

const props = withDefaults(defineProps<{
   as?: string | object
   options?: EzAutocompleteOption[]
   label?: string
   placeholder?: string
   hint?: string
   error?: string
   emptyText?: string
   icon?: IconName
   required?: boolean
   disabled?: boolean
   mono?: boolean
}>(), {
   as: 'div',
   options: () => [],
   emptyText: 'Aucun résultat',
})

const theValue = defineModel<string | number | null>({ default: '' })

const theRootRef = useTemplateRef<HTMLElement>('theRootRef')
const isOpen = ref(false)
const isFiltering = ref(false)
const theQuery = ref('')
const theActiveIndex = ref(0)

const theSelectedOption = computed(() =>
   props.options.find((option) => option.value === theValue.value) ?? null,
)

const hasValue = computed(() => theQuery.value.length > 0)

const theFilteredOptions = computed(() => {
   if (!isFiltering.value) return props.options
   const search = theQuery.value.trim().toLowerCase()
   if (!search) return props.options
   return props.options.filter(
      (option) =>
         option.label.toLowerCase().includes(search)
         || (option.meta?.toLowerCase().includes(search) ?? false),
   )
})

function syncQueryFromValue() {
   theQuery.value = theSelectedOption.value?.label ?? (theValue.value ? String(theValue.value) : '')
}

function onFocusIn() {
   if (props.disabled) return
   isOpen.value = true
   isFiltering.value = false
   theActiveIndex.value = Math.max(
      0,
      props.options.findIndex((option) => option.value === theValue.value),
   )
}

function onSelect(option: EzAutocompleteOption) {
   theValue.value = option.value
   theQuery.value = option.label
   isOpen.value = false
   isFiltering.value = false
}

function onClear() {
   theValue.value = ''
   theQuery.value = ''
   isOpen.value = true
   isFiltering.value = true
   theActiveIndex.value = 0
}

function onKeyDown(event: KeyboardEvent) {
   if (props.disabled) return
   if (!isOpen.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      onFocusIn()
      event.preventDefault()
      return
   }
   if (!isOpen.value) return

   const count = theFilteredOptions.value.length
   if (event.key === 'ArrowDown' && count > 0) {
      event.preventDefault()
      theActiveIndex.value = (theActiveIndex.value + 1) % count
   } else if (event.key === 'ArrowUp' && count > 0) {
      event.preventDefault()
      theActiveIndex.value = (theActiveIndex.value - 1 + count) % count
   } else if (event.key === 'Enter' && count > 0) {
      event.preventDefault()
      onSelect(theFilteredOptions.value[theActiveIndex.value])
   } else if (event.key === 'Escape') {
      event.preventDefault()
      isOpen.value = false
      isFiltering.value = false
      syncQueryFromValue()
   }
}

function onDocumentPointerDown(event: PointerEvent) {
   if (!isOpen.value) return
   const root = theRootRef.value
   if (root && !root.contains(event.target as Node)) {
      isOpen.value = false
      isFiltering.value = false
      syncQueryFromValue()
   }
}

watch(theQuery, (next) => {
   if (!isOpen.value) return
   const selectedLabel = theSelectedOption.value?.label ?? ''
   if (next !== selectedLabel) {
      isFiltering.value = true
      theActiveIndex.value = 0
      if (!next) {
         theValue.value = ''
      }
   }
})

watch(() => [theValue.value, props.options], () => {
   if (!isOpen.value) {
      syncQueryFromValue()
   }
}, { immediate: true })

onMounted(() => {
   document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
   document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<style scoped>
.ez-autocomplete {
   --ez-autocomplete-surface: var(--color-surface);
   --ez-autocomplete-border: var(--color-border);
   --ez-autocomplete-shadow: var(--shadow-overlay);
   --ez-autocomplete-radius: var(--radius-md);
   --ez-autocomplete-hover: var(--color-surface-muted);
   --ez-autocomplete-selected: var(--color-surface-accent);
   --ez-autocomplete-selected-color: var(--color-foreground-accent);
   --ez-autocomplete-muted: var(--color-foreground-muted);
   --ez-autocomplete-subtle: var(--color-foreground-subtle);
   --ez-autocomplete-control-height: var(--size-control-md);
   --ez-autocomplete-label-offset: 26px;

   position: relative;
   min-width: 0;
}

.ez-autocomplete__control {
   position: relative;
}

.ez-autocomplete__control :deep(.ez-field__control) {
   padding-right: 36px;
}

.ez-autocomplete__suffix {
   position: absolute;
   top: 0;
   right: 4px;
   display: flex;
   align-items: center;
   height: var(--ez-autocomplete-control-height);
}

.ez-autocomplete__suffix--with-label {
   top: var(--ez-autocomplete-label-offset);
}

.ez-autocomplete__chevron {
   margin-right: 6px;
   color: var(--ez-autocomplete-subtle);
   pointer-events: none;
}

.ez-autocomplete__menu {
   position: absolute;
   top: calc(100% + 4px);
   left: 0;
   right: 0;
   z-index: 30;
   max-height: 260px;
   overflow-y: auto;
   margin: 0;
   padding: 4px;
   list-style: none;
   border: 1px solid var(--ez-autocomplete-border);
   border-radius: var(--ez-autocomplete-radius);
   background: var(--ez-autocomplete-surface);
   box-shadow: var(--ez-autocomplete-shadow);
}

.ez-autocomplete__menu--with-hint {
   top: calc(100% - 16px);
}

.ez-autocomplete__option {
   display: flex;
   flex-direction: column;
   gap: 2px;
   padding: var(--space-gap-sm) var(--space-inset-sm);
   border-radius: var(--radius-sm);
   cursor: pointer;
}

.ez-autocomplete__option--active {
   background: var(--ez-autocomplete-hover);
}

.ez-autocomplete__option--selected {
   background: var(--ez-autocomplete-selected);
   color: var(--ez-autocomplete-selected-color);
}

.ez-autocomplete__option-label {
   font-size: var(--text-sm);
   font-weight: 600;
}

.ez-autocomplete__option-label--mono {
   font-family: var(--font-mono);
}

.ez-autocomplete__option-meta {
   color: var(--ez-autocomplete-muted);
   font-size: var(--text-xs);
}

.ez-autocomplete__empty {
   padding: var(--space-inset-sm);
   color: var(--ez-autocomplete-muted);
   font-size: var(--text-sm);
   text-align: center;
}
</style>
