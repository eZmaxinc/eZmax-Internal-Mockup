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
import { useId } from 'vue'
import EzIcon from '../icon/ez-icon.vue'
import type { IconName } from '../../icons'

export interface EzFieldOption {
   label: string
   value: string | number
}

withDefaults(defineProps<{
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

/** The field's value: v-model */
const theValue = defineModel<string | number | null>({ default: '' })

const theId = useId()
</script>

<style scoped>
.ez-field {
   /* Variables first: what the field's look depends on, read below */
   --ez-field-gap: 6px;
   --ez-field-padding-x: 10px;
   --ez-field-height: var(--field-height);
   --ez-field-radius: var(--radius-md);
   --ez-field-surface: var(--color-surface);
   --ez-field-color: var(--color-foreground);
   --ez-field-border: var(--color-border-strong);
   --ez-field-focus: var(--color-accent);
   --ez-field-muted-surface: var(--color-surface-muted);
   --ez-field-muted: var(--color-foreground-muted);
   --ez-field-subtle: var(--color-foreground-subtle);
   --ez-field-error: var(--color-negative);

   display: flex;
   flex-direction: column;
   gap: var(--ez-field-gap);
   min-width: 0;
}

.ez-field--error {
   --ez-field-border: var(--ez-field-error);
   --ez-field-focus: var(--ez-field-error);
}

.ez-field__label {
   font-size: var(--text-sm);
   font-weight: 600;
}

.ez-field__required {
   margin-left: 2px;
   color: var(--ez-field-error);
}

.ez-field__input,
.ez-field__select {
   position: relative;
}

.ez-field__control {
   box-sizing: border-box;
   width: 100%;
   height: var(--ez-field-height);
   padding: 0 var(--ez-field-padding-x);
   border: 1px solid var(--ez-field-border);
   border-radius: var(--ez-field-radius);
   background: var(--ez-field-surface);
   color: var(--ez-field-color);
   font: inherit;
   appearance: none;

   &:focus {
      outline: none;
      border-color: var(--ez-field-focus);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ez-field-focus) 20%, transparent);
   }

   &:disabled,
   &:read-only {
      background: var(--ez-field-muted-surface);
      color: var(--ez-field-muted);
   }

   &::placeholder {
      color: var(--ez-field-subtle);
   }
}

.ez-field__control--textarea {
   height: auto;
   padding: var(--space-gap-sm) var(--ez-field-padding-x);
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
   color: var(--ez-field-subtle);
   pointer-events: none;
}

.ez-field__icon {
   left: var(--ez-field-padding-x);
}

.ez-field__chevron {
   right: var(--ez-field-padding-x);
}

.ez-field__select .ez-field__control {
   padding-right: 32px;
}

.ez-field__message {
   margin: 0;
   color: var(--ez-field-muted);
   font-size: var(--text-xs);
}

.ez-field__message--error {
   color: var(--ez-field-error);
}
</style>
