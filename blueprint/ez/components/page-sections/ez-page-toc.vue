<template>
   <nav v-if="theContext" class="ez-page-toc" :aria-label="title">
      <p class="ez-page-toc__title">{{ title }}</p>
      <ul class="ez-page-toc__list">
         <li v-for="theEntry in theContext.entries.value" :key="theEntry.id">
            <a
               :href="`#${theEntry.id}`"
               class="ez-page-toc__link"
               :class="{ 'ez-page-toc__link--active': isActive(theEntry.id) }"
               @click.prevent="theContext.scrollTo(theEntry.id)"
            >
               {{ theEntry.title }}
            </a>
            <ul v-if="theEntry.children.length" class="ez-page-toc__children">
               <li v-for="theChild in theEntry.children" :key="theChild.id">
                  <a
                     :href="`#${theChild.id}`"
                     class="ez-page-toc__link ez-page-toc__link--child"
                     :class="{ 'ez-page-toc__link--active': isActive(theChild.id) }"
                     @click.prevent="theContext.scrollTo(theChild.id)"
                  >
                     {{ theChild.title }}
                  </a>
               </li>
            </ul>
         </li>
      </ul>
   </nav>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { pageSectionsKey } from './page-sections'

withDefaults(defineProps<{
   title?: string
}>(), {
   title: 'Sur cette page',
})

const theContext = inject(pageSectionsKey, null)

function isActive(id: string) {
   return theContext?.activeId.value === id
}
</script>

<style scoped>
.ez-page-toc {
   position: sticky;
   top: calc(var(--sizing-toolbar-height) + 24px);
   padding: var(--space-inset-sm);
   border-radius: var(--radius-sm);
   background: var(--color-surface);
   box-shadow: var(--shadow-card);
   font-size: var(--text-sm);
}

.ez-page-toc__title {
   margin: 0 0 8px;
   color: var(--color-foreground-subtle);
   font-size: var(--text-xs);
   font-weight: 600;
   text-transform: uppercase;
   letter-spacing: 0.04em;
}

.ez-page-toc__list,
.ez-page-toc__children {
   margin: 0;
   padding: 0;
   list-style: none;
}

.ez-page-toc__link {
   display: block;
   padding: 8px 12px;
   border-radius: var(--radius-sm);
   color: var(--color-foreground-muted);
   text-decoration: none;

   &:hover {
      color: var(--color-foreground);
   }
}

.ez-page-toc__link--child {
   padding: 6px 12px 6px 28px;
}

.ez-page-toc__link--active {
   background: var(--color-surface-muted);
   color: var(--color-foreground);
   font-weight: 500;
}
</style>
