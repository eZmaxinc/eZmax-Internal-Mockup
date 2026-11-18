<template>
   <nav class="page-nav" :aria-label="$gettext('Sur cette page')">
      <div v-for="theGroup in groups" :key="theGroup.key" class="page-nav__group" :class="{ 'page-nav__group--open': theGroup.key === openKey }">
         <a href="#" class="page-nav__head" :aria-expanded="theGroup.key === openKey" @click.prevent="emit('pick-group', theGroup.key)">
            <span class="page-nav__icon"><ez-icon :name="theGroup.icon" :size="16" /></span>
            <span class="flex-1">{{ theGroup.label }}</span>
            <span class="text-foreground-subtle"><ez-icon :name="theGroup.key === openKey ? 'chevronDown' : 'chevronRight'" :size="16" /></span>
         </a>

         <ul v-if="theGroup.key === openKey" class="pb-1">
            <li v-for="theItem in theGroup.items" :key="theItem.id">
               <a
                  :href="`#${theItem.id}`"
                  class="page-nav__item"
                  :class="{ 'page-nav__item--active': theItem.id === activeId }"
                  :aria-current="theItem.id === activeId ? 'location' : undefined"
                  @click.prevent="emit('pick-item', theItem.id)"
               >
                  <span class="page-nav__rail"><span class="page-nav__dot" /></span>
                  {{ theItem.label }}
               </a>
            </li>
         </ul>
      </div>
   </nav>
</template>

<script setup lang="ts">
import type { IconName } from '@ez'

export interface NavGroup {
   key: string
   label: string
   icon: IconName
   items: { id: string; label: string }[]
}

defineProps<{ groups: NavGroup[]; openKey: string; activeId: string }>()

const emit = defineEmits<{ 'pick-group': [key: string]; 'pick-item': [id: string] }>()
</script>

<style scoped>
.page-nav {
   --page-nav-icon: var(--size-control-sm);
   --page-nav-padding: var(--space-gap-sm);

   position: relative;
   display: flex;
   flex-direction: column;
   gap: 2px;
   padding: var(--page-nav-padding);
   border: 1px solid var(--color-border);
   border-radius: var(--radius-xl);
   background: var(--color-surface);
}

/* The rail that links the groups and their items, behind the icons and the dots */
.page-nav::before {
   content: "";
   position: absolute;
   top: calc(var(--page-nav-padding) * 3);
   bottom: calc(var(--page-nav-padding) * 3);
   left: calc(var(--page-nav-padding) * 2 + var(--page-nav-icon) / 2 - 1px);
   width: 2px;
   background: var(--color-border);
}

.page-nav__group {
   position: relative;
   border-radius: var(--radius-lg);
}

.page-nav__group--open {
   background: var(--color-surface-accent);
}

.page-nav__head,
.page-nav__item {
   display: flex;
   align-items: center;
   gap: var(--space-gap-sm);
   padding: var(--page-nav-padding);
   border-radius: var(--radius-lg);
   color: var(--color-foreground-muted);
}

.page-nav__group--open .page-nav__head {
   color: var(--color-foreground);
   font-weight: 600;
}

.page-nav__icon {
   position: relative;
   display: flex;
   flex: none;
   align-items: center;
   justify-content: center;
   width: var(--page-nav-icon);
   height: var(--page-nav-icon);
   border: 1px solid var(--color-border);
   border-radius: var(--radius-md);
   background: var(--color-surface);
   color: var(--color-accent);
}

.page-nav__group--open .page-nav__icon {
   border-color: var(--color-accent);
   background: var(--color-accent);
   color: var(--color-accent-foreground);
}

.page-nav__item {
   padding-block: calc(var(--page-nav-padding) / 2);
   font-size: var(--text-sm);
}

.page-nav__item:hover,
.page-nav__item--active {
   color: var(--color-foreground);
}

.page-nav__item--active {
   font-weight: 600;
}

.page-nav__rail {
   position: relative;
   display: flex;
   flex: none;
   justify-content: center;
   width: var(--page-nav-icon);
}

.page-nav__dot {
   width: 0.375rem;
   height: 0.375rem;
   border-radius: var(--radius-full);
   background: var(--color-border-strong);
}

.page-nav__item--active .page-nav__dot {
   width: 0.625rem;
   height: 0.625rem;
   background: var(--color-accent);
   box-shadow: 0 0 0 3px var(--color-border);
}
</style>
