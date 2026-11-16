<template>
   <nav class="ez-page-toc" :aria-label="theTitle">
      <p class="ez-page-toc__title">{{ theTitle }}</p>
      <ul class="ez-page-toc__list">
         <li v-for="theEntry in theContext.entries.value" :key="theEntry.id">
            <a
               :href="`#${theEntry.id}`"
               class="ez-page-toc__link"
               :class="{ 'ez-page-toc__link--active': isActive(theEntry.id) }"
               @click.prevent="onGoTo(theEntry.id)"
            >
               {{ theEntry.title }}
            </a>
            <ul v-if="theEntry.children.length" class="ez-page-toc__children">
               <li v-for="theChild in theEntry.children" :key="theChild.id">
                  <a
                     :href="`#${theChild.id}`"
                     class="ez-page-toc__link ez-page-toc__link--child"
                     :class="{ 'ez-page-toc__link--active': isActive(theChild.id) }"
                     @click.prevent="onGoTo(theChild.id)"
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
import { computed } from 'vue'
import { gettext } from '../../i18n'
import { usePageSections } from './page-sections'

const theContext = usePageSections('ez-page-toc')

const props = defineProps<{
   title?: string
}>()

const theTitle = computed(() => props.title ?? gettext('Sur cette page'))

function isActive(id: string) {
   return theContext.activeId.value === id
}

function onGoTo(id: string) {
   theContext.scrollTo(id)
}
</script>

<style scoped>
.ez-page-toc {
   /* Variables first: what the TOC's look depends on, read below */
   --ez-page-toc-surface: var(--color-surface);
   --ez-page-toc-radius: var(--radius-sm);
   --ez-page-toc-shadow: var(--shadow-card);
   --ez-page-toc-title: var(--color-foreground-subtle);
   --ez-page-toc-link: var(--color-foreground-muted);
   --ez-page-toc-link-active: var(--color-foreground);
   --ez-page-toc-active-surface: var(--color-surface-muted);

   position: sticky;
   top: calc(var(--sizing-toolbar-height) + var(--space-gap-lg));
   padding: var(--space-inset-sm);
   border-radius: var(--ez-page-toc-radius);
   background: var(--ez-page-toc-surface);
   box-shadow: var(--ez-page-toc-shadow);
   font-size: var(--text-sm);
}

.ez-page-toc__title {
   margin: 0 0 var(--space-gap-sm);
   color: var(--ez-page-toc-title);
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
   padding: var(--space-gap-sm) var(--space-inset-sm);
   border-radius: var(--ez-page-toc-radius);
   color: var(--ez-page-toc-link);
   text-decoration: none;

   &:hover {
      color: var(--ez-page-toc-link-active);
   }
}

.ez-page-toc__link--child {
   padding: 6px var(--space-inset-sm) 6px 28px;
}

.ez-page-toc__link--active {
   background: var(--ez-page-toc-active-surface);
   color: var(--ez-page-toc-link-active);
   font-weight: 500;
}
</style>
