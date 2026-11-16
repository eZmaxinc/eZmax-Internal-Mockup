<template>
   <div class="ez-page-content">
      <slot />
   </div>
</template>

<style scoped>
.ez-page-content {
   /* Variables first: the page's inset and width, from the app's knobs */
   --ez-page-content-padding: var(--inset-page);
   --ez-page-content-max-width: var(--page-max-width);

   box-sizing: border-box;
   width: 100%;
   max-width: var(--ez-page-content-max-width);
   margin: 0 auto;
   padding: var(--ez-page-content-padding);
}
</style>
