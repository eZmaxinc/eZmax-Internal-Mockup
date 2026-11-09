<template>
   <div class="ez-page-content">
      <slot />
   </div>
</template>

<style scoped>
.ez-page-content {
   box-sizing: border-box;
   width: 100%;
   max-width: var(--page-max-width);
   margin: 0 auto;
   padding: var(--inset-page);
}
</style>
