<template>
   <div class="ez-field" :class="{ 'ez-field--error': !!error, 'ez-field--disabled': disabled }">
      <label v-if="label" class="ez-field__label" :for="theId">
         {{ label }}<span v-if="required" class="ez-field__required" aria-hidden="true">*</span>
      </label>

      <textarea
         v-if="type === 'textarea'"
         :id="theId"
         v-model="theValue"
         class="ez-field__control ez-field__control--textarea"
         :rows="rows"
         :placeholder="placeholder"
         :disabled="disabled"
         :readonly="readonly"
         :required="required"
      />

      <div v-else-if="type === 'select'" class="ez-field__select">
         <select
            :id="theId"
            v-model="theValue"
            class="ez-field__control"
            :disabled="disabled"
            :required="required"
         >
            <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
            <option v-for="theOption in options" :key="String(theOption.value)" :value="theOption.value">
               {{ theOption.label }}
            </option>
         </select>
         <ez-icon name="chevronDown" :size="16" class="ez-field__chevron" />
      </div>

      <div v-else class="ez-field__input">
         <ez-icon v-if="icon" :name="icon" :size="16" class="ez-field__icon" />
         <input
            :id="theId"
            v-model="theValue"
            class="ez-field__control"
            :class="{ 'ez-field__control--with-icon': icon }"
            :type="type"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
         />
      </div>

      <p v-if="error" class="ez-field__message ez-field__message--error">{{ error }}</p>
      <p v-else-if="hint" class="ez-field__message">{{ hint }}</p>
   </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import EzIcon from '../icon/ez-icon.vue'
import type { IconName } from '../../icons'

export interface EzFieldOption {
   label: string
   value: string | number
}

const props = withDefaults(defineProps<{
   modelValue?: string | number | null
   label?: string
   type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password' | 'search' | 'textarea' | 'select'
   options?: EzFieldOption[]
   placeholder?: string
   hint?: string
   error?: string
   icon?: IconName
   rows?: number
   required?: boolean
   disabled?: boolean
   readonly?: boolean
}>(), {
   type: 'text',
   options: () => [],
   rows: 4,
})

const emit = defineEmits<{
   'update:modelValue': [value: string | number | null]
}>()

const theId = useId()

const theValue = computed({
   get: () => props.modelValue ?? '',
   set: (value) => emit('update:modelValue', value),
})
</script>

<style scoped>
.ez-field {
   display: flex;
   flex-direction: column;
   gap: 6px;
   min-width: 0;
}

.ez-field__label {
   font-size: var(--text-sm);
   font-weight: 600;
}

.ez-field__required {
   margin-left: 2px;
   color: var(--color-negative);
}

.ez-field__input,
.ez-field__select {
   position: relative;
}

.ez-field__control {
   box-sizing: border-box;
   width: 100%;
   height: var(--field-height);
   padding: 0 10px;
   border: 1px solid var(--color-border-strong);
   border-radius: var(--radius-md);
   background: var(--color-surface);
   color: var(--color-foreground);
   font: inherit;
   appearance: none;

   &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
   }

   &:disabled,
   &:read-only {
      background: var(--color-surface-muted);
      color: var(--color-foreground-muted);
   }

   &::placeholder {
      color: var(--color-foreground-subtle);
   }
}

.ez-field__control--textarea {
   height: auto;
   padding: 8px 10px;
   resize: vertical;
}

.ez-field__control--with-icon {
   padding-left: 32px;
}

.ez-field__icon,
.ez-field__chevron {
   position: absolute;
   top: 50%;
   transform: translateY(-50%);
   color: var(--color-foreground-subtle);
   pointer-events: none;
}

.ez-field__icon {
   left: 10px;
}

.ez-field__chevron {
   right: 10px;
}

.ez-field__select .ez-field__control {
   padding-right: 32px;
}

.ez-field__message {
   margin: 0;
   color: var(--color-foreground-muted);
   font-size: var(--text-xs);
}

.ez-field--error {
   .ez-field__control {
      border-color: var(--color-negative);
   }

   .ez-field__message--error {
      color: var(--color-negative);
   }
}
</style>
