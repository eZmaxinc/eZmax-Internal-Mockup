<template>
   <div class="gate">
      <div class="gate__backdrop" aria-hidden="true" />

      <main class="gate__container">
         <div class="gate__brand">
            <span class="gate__brand-mark" aria-hidden="true">eZ</span>
            <span class="gate__brand-name">Mockups</span>
         </div>

         <section class="gate__card" :class="{ 'gate__card--notfound': isNotFound }">
            <div class="gate__illustration" aria-hidden="true">
               <svg viewBox="0 0 220 112" fill="none" xmlns="http://www.w3.org/2000/svg" class="gate__svg">
                  <rect x="18" y="12" width="184" height="88" rx="12" class="gate__svg-window" />
                  <path d="M18 24C18 17.3726 23.3726 12 30 12H190C196.627 12 202 17.3726 202 24V34H18V24Z" class="gate__svg-toolbar" />
                  <circle cx="34" cy="23" r="3" class="gate__svg-dot" />
                  <circle cx="45" cy="23" r="3" class="gate__svg-dot" />
                  <circle cx="56" cy="23" r="3" class="gate__svg-dot" />
                  <rect x="34" y="48" width="66" height="8" rx="4" class="gate__svg-line-strong" />
                  <rect x="34" y="64" width="116" height="6" rx="3" class="gate__svg-line" />
                  <rect x="34" y="76" width="88" height="6" rx="3" class="gate__svg-line" />
                  <g class="gate__svg-pill-group">
                     <rect x="132" y="58" width="76" height="32" rx="16" class="gate__svg-pill" />
                     <path
                        d="M159 74H165M175 74H181M165 74C165 71.7909 166.791 70 169 70H171C173.209 70 175 71.7909 175 74C175 76.2091 173.209 78 171 78H169C166.791 78 165 76.2091 165 74Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        class="gate__svg-link-icon"
                     />
                  </g>
               </svg>
            </div>

            <div class="gate__pill" :class="{ 'gate__pill--warning': isNotFound }">
               <span class="gate__pill-dot" aria-hidden="true" />
               <span>{{ isNotFound ? 'Page introuvable' : 'Accès par lien direct' }}</span>
            </div>

            <h1 class="gate__title">
               {{ isNotFound ? 'Ce lien ne mène à aucune maquette' : 'Utilisez le lien qui vous a été envoyé' }}
            </h1>

            <p class="gate__desc">
               <template v-if="isNotFound">
                  La page demandée n’existe pas ou l’adresse est incomplète. Vérifiez le lien reçu par courriel ou dans GoodDay et réessayez.
               </template>
               <template v-else>
                  L’annuaire complet n’est pas ouvert à la racine. Pour consulter un mockup, ouvrez directement le lien de partage qui vous a été transmis.
               </template>
            </p>

            <div class="gate__example">
               <span class="gate__example-label">Format attendu du lien</span>
               <code class="gate__example-url">
                  <span class="gate__example-prefix">{{ theBaseExample }}mockup/</span><span class="gate__example-slug">nom-de-la-maquette</span>
               </code>
            </div>

            <div v-if="isDev" class="gate__actions">
               <router-link to="/" class="gate__back-btn">
                  Retour à l’index des mockups
               </router-link>
            </div>
         </section>

         <p class="gate__footer">
            Besoin d’un accès? Demandez le lien de partage à la personne responsable de la maquette.
         </p>
      </main>
   </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDev = import.meta.env.DEV
const isNotFound = computed(() => route.query.notfound === '1')

const theBaseExample = computed(() => {
   const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
   return `${window.location.origin}${base}`
})
</script>

<style scoped>
.gate {
   position: relative;
   display: grid;
   place-items: center;
   min-height: 100vh;
   padding: 32px 20px;
   overflow: hidden;
   background: var(--color-background);
   color: var(--color-foreground);
}

.gate__backdrop {
   position: absolute;
   inset: 0;
   pointer-events: none;
   background:
      radial-gradient(680px 360px at 50% -10%, color-mix(in srgb, var(--color-accent) 14%, transparent), transparent 70%),
      radial-gradient(480px 320px at 85% 95%, color-mix(in srgb, var(--color-info) 12%, transparent), transparent 70%),
      radial-gradient(color-mix(in srgb, var(--color-border-strong) 45%, transparent) 1px, transparent 1px);
   background-size: 100% 100%, 100% 100%, 22px 22px;
}

.gate__container {
   position: relative;
   z-index: 1;
   display: flex;
   flex-direction: column;
   align-items: center;
   width: 100%;
   max-width: 500px;
   gap: 20px;
}

.gate__brand {
   display: inline-flex;
   align-items: center;
   gap: 8px;
   font-size: 14px;
   font-weight: 600;
   color: var(--color-foreground-muted);
   letter-spacing: -0.01em;
}

.gate__brand-mark {
   display: inline-grid;
   place-items: center;
   width: 26px;
   height: 26px;
   border-radius: 7px;
   background: var(--color-surface-inverse);
   color: var(--color-foreground-inverse);
   font-size: 12px;
   font-weight: 700;
   letter-spacing: -0.02em;
   box-shadow: var(--shadow-card);
}

.gate__card {
   display: flex;
   flex-direction: column;
   align-items: center;
   width: 100%;
   padding: 32px 28px 28px;
   border: 1px solid var(--color-border);
   border-radius: 16px;
   background: var(--color-surface);
   box-shadow: var(--shadow-overlay);
   text-align: center;
}

.gate__illustration {
   width: 220px;
   margin-bottom: 18px;
}

.gate__svg {
   display: block;
   width: 100%;
   height: auto;
}

.gate__svg-window {
   fill: var(--color-surface-muted);
   stroke: var(--color-border);
   stroke-width: 1.5;
}

.gate__svg-toolbar {
   fill: var(--color-surface-inverse);
}

.gate__svg-dot {
   fill: color-mix(in srgb, var(--color-foreground-inverse) 35%, transparent);
}

.gate__svg-line-strong {
   fill: var(--color-border-strong);
}

.gate__svg-line {
   fill: var(--color-border);
}

.gate__svg-pill {
   fill: var(--color-accent);
   filter: drop-shadow(0 6px 12px color-mix(in srgb, var(--color-accent) 28%, transparent));
}

.gate__svg-link-icon {
   color: var(--color-accent-foreground);
}

.gate__pill {
   display: inline-flex;
   align-items: center;
   gap: 7px;
   padding: 4px 12px;
   margin-bottom: 14px;
   border-radius: 9999px;
   background: var(--color-surface-accent);
   color: var(--color-foreground-accent);
   font-size: 12px;
   font-weight: 600;
}

.gate__pill-dot {
   width: 7px;
   height: 7px;
   border-radius: 50%;
   background: currentColor;
}

.gate__pill--warning {
   background: var(--color-surface-warning);
   color: var(--color-foreground-warning);
}

.gate__title {
   margin: 0 0 10px;
   font-size: 21px;
   font-weight: 700;
   line-height: 1.25;
   letter-spacing: -0.02em;
   color: var(--color-foreground);
}

.gate__desc {
   margin: 0 0 22px;
   font-size: 14px;
   line-height: 1.55;
   color: var(--color-foreground-muted);
}

.gate__example {
   display: flex;
   flex-direction: column;
   gap: 6px;
   width: 100%;
   padding: 12px 14px;
   border: 1px solid var(--color-border-muted);
   border-radius: 10px;
   background: var(--color-surface-muted);
   text-align: left;
}

.gate__example-label {
   font-size: 11px;
   font-weight: 600;
   text-transform: uppercase;
   letter-spacing: 0.04em;
   color: var(--color-foreground-subtle);
}

.gate__example-url {
   display: block;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
   font-family: var(--font-mono);
   font-size: 12px;
   color: var(--color-foreground-muted);
}

.gate__example-slug {
   font-weight: 600;
   color: var(--color-foreground-accent);
}

.gate__actions {
   margin-top: 20px;
}

.gate__back-btn {
   display: inline-flex;
   align-items: center;
   justify-content: center;
   height: 34px;
   padding: 0 16px;
   border-radius: 9999px;
   background: var(--color-accent);
   color: var(--color-accent-foreground);
   font-size: 13px;
   font-weight: 600;
   text-decoration: none;
   transition: opacity 140ms ease;

   &:hover {
      opacity: 0.9;
   }
}

.gate__footer {
   margin: 0;
   font-size: 12px;
   color: var(--color-foreground-subtle);
   text-align: center;
}

@media (max-width: 520px) {
   .gate__card {
      padding: 26px 18px 22px;
   }

   .gate__title {
      font-size: 18px;
   }
}
</style>
