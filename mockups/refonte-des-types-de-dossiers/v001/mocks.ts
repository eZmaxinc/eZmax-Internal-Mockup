import { defineScenarios } from '@ez'

/**
 * The delays of a folder type. They run on two clocks:
 * the signature is counted from the sending of the folder, the retention from its closing.
 * (Same shape as the lifecycle task, v010, which LifecycleTimeline comes from.)
 */
export interface FolderTypeLifecycle {
   name: string
   /** Days the signers have to sign, counted from the day the folder is sent */
   signatureDays: number
   /** First reminder after `firstAfterDays`, then one every `everyDays`; null = no reminders */
   reminders: { firstAfterDays: number, everyDays: number } | null
   /** How the documents of a folder are finalized */
   finalizationRule: string
   /** Days after the signature deadline before the documents are completed early, automatically; null = by hand */
   earlyCompletionDays: number | null
   /** Days between the closing of the folder and its archiving */
   archiveDays: number
   /** Days between the archiving and the elimination of the data; null = eliminated by hand */
   eliminationDays: number | null
}

/** A setting that is on or off: shown as a green tile with a check, or a quiet one with a cross */
export interface Toggle {
   label: string
   isEnabled: boolean
}

export interface FontSetting {
   label: string
   family: string
   size: number
}

/** Everything the detail page of a folder type shows */
export interface FolderType {
   id: number
   isActive: boolean
   lifecycle: FolderTypeLifecycle
   // Informations
   confidentiality: string
   brandImage: string
   billingEntity: string
   timestampAuthority: string
   unifiedDownload: string
   dependentDocuments: string
   features: Toggle[]
   // Sécurité et accès
   accessGroups: { label: string, count: number }[]
   participantAccess: string
   authMethods: string[]
   reassignBehaviour: string
   reassignments: Toggle[]
   // Notifications
   followUpRecipients: Toggle[]
   additionalEmail: string
   additionalUsers: number
   signedDocumentRecipients: { label: string, toggles: Toggle[] }[]
   // Personnalisation
   fonts: FontSetting[]
   signatureDateSample: string
   signatureDateFormat: string
   signatureCustomization: Toggle[]
   // Avancé
   pdfa: { isActive: boolean, validationType: string, onError: string, conversionLevel: string, levels: string[] }
}

/** « chaque jour », « tous les 2 jours » */
export function rhythmOf(lifecycle: FolderTypeLifecycle): string {
   if (!lifecycle.reminders) return ''
   return lifecycle.reminders.everyDays === 1 ? 'chaque jour' : `tous les ${lifecycle.reminders.everyDays} jours`
}

/** The days a reminder goes out, from the first one to the day before the signature deadline. */
export function reminderDaysOf(lifecycle: FolderTypeLifecycle): number[] {
   if (!lifecycle.reminders) return []
   const days: number[] = []
   for (let day = lifecycle.reminders.firstAfterDays; day < lifecycle.signatureDays; day += lifecycle.reminders.everyDays) days.push(day)
   return days
}

const on = (label: string): Toggle => ({ label, isEnabled: true })
const off = (label: string): Toggle => ({ label, isEnabled: false })

export const scenarios = defineScenarios({
   // The folder type of the production screenshot
   'shared-folders': () => ({
      folderType: {
         id: 63,
         isActive: true,
         lifecycle: {
            name: 'Dossiers partagés de Mikhael',
            signatureDays: 13,
            reminders: { firstAfterDays: 2, everyDays: 1 },
            finalizationRule: 'Signatures de tous les documents complétées, avec étapes synchronisées',
            earlyCompletionDays: 5,
            archiveDays: 1,
            eliminationDays: 2,
         },
         confidentiality: 'Dossiers partagés',
         brandImage: 'Bell',
         billingEntity: 'qewqweqweqwe',
         timestampAuthority: 'Meilleur effort',
         unifiedDownload: 'Oui, sans filigrane',
         dependentDocuments: 'Les signataires externes seulement',
         features: [
            on('Autoriser les discussions sur les documents'),
            on('Autoriser les signatures automatiques'),
            off('Autoriser la délégation de signature'),
            off('Lister les informations des destinataires sur la preuve électronique'),
         ],
         accessGroups: [
            { label: 'Accès à tous les dossiers', count: 1 },
            { label: 'Accès aux dossiers créés par eux-mêmes', count: 27 },
            { label: 'Création et modification des modèles de ce type', count: 1 },
         ],
         participantAccess: 'Afficher uniquement les documents sur lesquels l’utilisateur possède des signatures',
         authMethods: ['Courriel seulement', 'Courriel + téléphone ou SMS', 'Courriel + question secrète', 'En personne seulement', 'En personne + téléphone ou SMS', 'Intégrée', 'Intégrée avec téléphone ou SMS'],
         reassignBehaviour: 'Réassigner le signataire du groupe seulement',
         reassignments: [
            on('Permettre aux signataires externes de réassigner à un autre signataire externe'),
            off('Permettre aux utilisateurs de réassigner à un autre utilisateur ou un signataire externe'),
         ],
         followUpRecipients: [
            on('Au créateur du document'),
            on('Au créateur du dossier'),
            on('Aux collègues des destinataires'),
            off('À tous les membres du groupe ayant accès à tous les dossiers'),
         ],
         additionalEmail: 'test@test.com',
         additionalUsers: 3,
         signedDocumentRecipients: [
            { label: 'Signataires externes', toggles: [on('Envoyer le document signé'), on('Joindre la preuve électronique')] },
            { label: 'Utilisateurs', toggles: [on('Envoyer le document signé'), off('Joindre la preuve électronique')] },
            { label: 'Destinataire externe', toggles: [off('Envoyer le document signé'), off('Joindre la preuve électronique')] },
            { label: 'Autres', toggles: [on('Au créateur du dossier'), off('Aux collègues des destinataires')] },
         ],
         fonts: [
            { label: 'Champs de formulaire', family: 'Arial', size: 12 },
            { label: 'Annotations', family: 'Impact', size: 18 },
            { label: 'Police par défaut des signataires', family: 'Zeyada', size: 14 },
         ],
         signatureDateSample: '2026-11-19 11:12:02 test 11',
         signatureDateFormat: '{Date1me2} test {MM}',
         signatureCustomization: [
            on('Utiliser la signature par défaut sans permettre la personnalisation'),
            off('Permettre aux utilisateurs de personnaliser leur signature'),
         ],
         pdfa: {
            isActive: true,
            validationType: 'Valider avec la déclaration du PDF',
            onError: 'Convertir automatiquement le fichier envoyé',
            conversionLevel: 'PDF/A-1a',
            levels: ['PDF/A-1a'],
         },
      } as FolderType,
   }),
   // Edge: an inactive type, no reminders, everything by hand, no extra recipients, PDF/A off
   'inactive-minimal': () => ({
      folderType: {
         id: 12,
         isActive: false,
         lifecycle: {
            name: 'Contrats conservés',
            signatureDays: 30,
            reminders: null,
            finalizationRule: 'Signatures de tous les documents complétées',
            earlyCompletionDays: null,
            archiveDays: 365,
            eliminationDays: null,
         },
         confidentiality: 'Dossiers privés',
         brandImage: '',
         billingEntity: 'eZmax',
         timestampAuthority: 'Aucun',
         unifiedDownload: 'Non',
         dependentDocuments: 'Aucune',
         features: [
            off('Autoriser les discussions sur les documents'),
            off('Autoriser les signatures automatiques'),
            off('Autoriser la délégation de signature'),
            off('Lister les informations des destinataires sur la preuve électronique'),
         ],
         accessGroups: [
            { label: 'Accès à tous les dossiers', count: 0 },
            { label: 'Accès aux dossiers créés par eux-mêmes', count: 1 },
            { label: 'Création et modification des modèles de ce type', count: 0 },
         ],
         participantAccess: 'Afficher tous les documents du dossier',
         authMethods: ['Courriel seulement'],
         reassignBehaviour: 'Ne pas permettre la réassignation',
         reassignments: [
            off('Permettre aux signataires externes de réassigner à un autre signataire externe'),
            off('Permettre aux utilisateurs de réassigner à un autre utilisateur ou un signataire externe'),
         ],
         followUpRecipients: [
            on('Au créateur du document'),
            off('Au créateur du dossier'),
            off('Aux collègues des destinataires'),
            off('À tous les membres du groupe ayant accès à tous les dossiers'),
         ],
         additionalEmail: '',
         additionalUsers: 0,
         signedDocumentRecipients: [
            { label: 'Signataires externes', toggles: [on('Envoyer le document signé'), off('Joindre la preuve électronique')] },
            { label: 'Utilisateurs', toggles: [off('Envoyer le document signé'), off('Joindre la preuve électronique')] },
         ],
         fonts: [
            { label: 'Champs de formulaire', family: 'Arial', size: 12 },
            { label: 'Annotations', family: 'Arial', size: 12 },
            { label: 'Police par défaut des signataires', family: 'Arial', size: 14 },
         ],
         signatureDateSample: '2026-11-19',
         signatureDateFormat: '',
         signatureCustomization: [
            off('Utiliser la signature par défaut sans permettre la personnalisation'),
            on('Permettre aux utilisateurs de personnaliser leur signature'),
         ],
         pdfa: { isActive: false, validationType: '', onError: '', conversionLevel: '', levels: [] },
      } as FolderType,
   }),
})
