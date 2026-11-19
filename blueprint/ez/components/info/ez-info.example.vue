<!-- Exemple de la galerie. Les informations d'une fiche: tuiles, comptes, liens, réglages activés ou non, pastilles, sous-groupe. -->
<template>
   <ez-card title="Informations">
      <ez-info :data="theData" />
   </ez-card>
</template>

<script setup lang="ts">
import type { IInfoCategory } from './info'

function onOpen() {
   // A link: the gallery has nowhere to go
}

const theData: IInfoCategory[] = [
   {
      name: 'general',
      items: [
         { key: 'name', label: 'Nom', value: 'Espace de travail principal', col: 12 },
         { key: 'language', label: 'Langue', value: 'Français' },
         { key: 'timezone', label: 'Fuseau horaire', value: 'America/Toronto', tooltip: 'Les dates sont affichées dans ce fuseau.' },
         { key: 'owner', label: 'Responsable', value: 'Équipe des opérations', onClick: onOpen },
         { key: 'members', label: 'Membres', value: { amount: 12, unit: 'personnes' } },
         { key: 'font', label: 'Police', value: 'Aa — Exemple de texte', hint: 'Georgia · 16 pt', valueStyle: { fontFamily: 'Georgia, serif', fontSize: '16px' } },
         { key: 'channels', label: 'Canaux de notification', value: [{ label: 'Courriel', icon: 'mail' }, { label: 'Application', icon: 'inbox' }], col: { xs: 12, md: 6 } },
      ],
   },
   {
      name: 'options',
      title: 'Options',
      items: [
         {
            key: 'options-list',
            variant: 'list',
            value: [
               { label: 'Authentification à deux facteurs', value: true },
               { label: 'Connexion par lien magique', value: false },
               { label: 'Journal des activités', value: true },
               { label: 'Accès invité', value: false },
            ],
         },
      ],
   },
   {
      name: 'tags',
      title: 'Étiquettes',
      items: [
         { key: 'tag-active', variant: 'pill', value: { label: 'Actif', value: true } },
         { key: 'tag-public', variant: 'pill', value: { label: 'Public', value: false } },
         { key: 'tag-shared', variant: 'pill', label: 'Partagé' },
      ],
      groups: [
         {
            name: 'retention',
            title: 'Conservation',
            icon: 'clock',
            tone: 'positive',
            items: [
               { key: 'retention-days', label: 'Archivage après', value: { amount: 30, unit: 'jours' } },
               { key: 'retention-mode', label: 'Suppression', value: 'Automatique' },
            ],
         },
      ],
   },
]
</script>
