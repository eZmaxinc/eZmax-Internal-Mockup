import { defineScenarios, type IconName } from '@ez'

export type ButtonVariant = 'positive' | 'primary' | 'secondary' | 'flat' | 'danger'

export interface ButtonSample {
   variant: ButtonVariant
   /** What the variant is for, shown in the first column */
   usage: string
   label: string
   icon: IconName
}

/** Data scenarios for this version. The first key is the default. */
export const scenarios = defineScenarios({
   'toutes-les-variantes': () => ({
      samples: [
         { variant: 'positive', usage: 'Action principale de la page', label: 'Sauvegarder', icon: 'check' },
         { variant: 'primary', usage: 'Action d’une zone', label: 'Modifier', icon: 'edit' },
         { variant: 'secondary', usage: 'Par défaut', label: 'Télécharger', icon: 'download' },
         { variant: 'flat', usage: 'Faible emphase', label: 'Voir le détail', icon: 'eye' },
         { variant: 'danger', usage: 'Destructif', label: 'Supprimer', icon: 'delete' },
      ] as ButtonSample[],
   }),
   // Edge: long labels, to see the outline and the spinner keep the button's width
   'libelles-longs': () => ({
      samples: [
         { variant: 'positive', usage: 'Action principale de la page', label: 'Sauvegarder et envoyer aux signataires', icon: 'send' },
         { variant: 'primary', usage: 'Action d’une zone', label: 'Modifier les informations du dossier', icon: 'edit' },
         { variant: 'secondary', usage: 'Par défaut', label: 'Télécharger tous les documents signés', icon: 'download' },
         { variant: 'flat', usage: 'Faible emphase', label: 'Voir l’historique complet du dossier', icon: 'eye' },
         { variant: 'danger', usage: 'Destructif', label: 'Supprimer définitivement le dossier', icon: 'delete' },
      ] as ButtonSample[],
   }),
})
