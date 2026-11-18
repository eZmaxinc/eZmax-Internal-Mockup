import { defineScenarios, formatDate, formatDateTime, type EzInfoItem, type EzTableColumn, type IconName } from '@ez'
import { daysFromToday } from '@mocks'

/** A yes/no fact, already worded for its state: « Acheteur occupant » or « Acheteur non occupant » */
export interface Flag {
   on: boolean
   label: string
}

/** A label with a boxed figure on the right */
export interface Stat {
   label: string
   value: string
   isAlert?: boolean
}

/** A figure with its own line of context, at the top of a sale */
export interface Kpi {
   label: string
   value: string
   sub: string
   isTotal?: boolean
}

export interface Counter {
   icon: IconName
   label: string
}

export interface Cell {
   value: string
   sub?: string
   isLink?: boolean
}

export interface PanelRow {
   id: number
   isTotal: boolean
   cells: Cell[]
}

/** A small table inside a card: owners, files, commissions… */
export interface Panel {
   title: string
   icon: IconName
   columns: EzTableColumn[]
   rows: PanelRow[]
   summary?: Stat[]
}

/** A list that has no entry yet: one line with « Ajouter » */
export interface EmptySlot {
   title: string
   icon: IconName
}

export interface TimelineStep {
   step: string
   date: Date | null
   isDone: boolean
}

export interface Sale {
   id: string
   stateLabel: string
   stateTone: 'warning' | 'neutral'
   counters: Counter[]
   kpis: Kpi[]
   financing: EzInfoItem[]
   flags: Flag[]
   timeline: TimelineStep[]
   notaries: EzInfoItem[]
   followUp: Stat[]
   commissionPanels: Panel[]
   commissionEmpty: EmptySlot[]
   partyPanels: Panel[]
   partyEmpty: EmptySlot[]
   balance: string
   paymentPanels: Panel[]
   concludedAt: Date | null
}

export interface Inscription {
   id: string
   counters: Counter[]
   identification: EzInfoItem[]
   address: string
   classification: EzInfoItem[]
   building: EzInfoItem[]
   prices: Stat[]
   characteristics: Flag[]
   followUp: Stat[]
   validations: { label: string; state: string }[]
   statusFlags: Flag[]
   commissions: Stat[]
   partyPanels: Panel[]
   partyEmpty: EmptySlot[]
   financeEmpty: EmptySlot[]
   createdAt: Date
   modifiedAt: Date
   author: string
   sales: Sale[]
}

const EMPTY = '—'
const NO_AMOUNT = '- $'

function info(label: string, value = EMPTY): EzInfoItem {
   return { label, value }
}

/** Column labels in order; `['Total', 'right']` aligns a column of amounts */
function columns(...labels: (string | [string, 'right'])[]): EzTableColumn[] {
   return labels.map((label, index) =>
      typeof label === 'string' ? { key: `c${index}`, label } : { key: `c${index}`, label: label[0], align: label[1] },
   )
}

function row(id: number, cells: (string | Cell)[], isTotal = false): PanelRow {
   return { id, isTotal, cells: cells.map((cell) => (typeof cell === 'string' ? { value: cell || EMPTY } : cell)) }
}

function link(value: string, sub?: string): Cell {
   return { value, sub, isLink: true }
}

function makeNotarizedSale(): Sale {
   return {
      id: '17348',
      stateLabel: 'Non notariée',
      stateTone: 'warning',
      counters: [
         { icon: 'file', label: '3 fichiers · 119,31 Ko' },
         { icon: 'file', label: '0 document' },
         { icon: 'mail', label: '1 communication' },
      ],
      kpis: [
         { label: 'Montant de la transaction', value: '150 000 $', sub: 'Vente' },
         { label: 'Rétribution à recevoir', value: '1 500,00 $', sub: '1,00 % du montant' },
         { label: 'TVH', value: '210,00 $', sub: 'Taxes' },
         { label: 'Total', value: '1 710,00 $', sub: 'Rétribution + taxes', isTotal: true },
      ],
      financing: [
         info('Type de prêt hypothécaire', "Prise en charge d'un prêt"),
         info('Montant du prêt'),
         info('Date prévue du financement'),
         info('Institution financière'),
         info('Type de résidence', 'Principale'),
      ],
      flags: [
         { on: true, label: 'Acheteur occupant' },
         { on: true, label: 'Incluse dans les campagnes de marketing' },
         { on: false, label: 'Non référée' },
         { on: false, label: "Aucun contrat de courtage d'achat lié" },
      ],
      timeline: [
         { step: 'Transaction', date: daysFromToday(-40), isDone: true },
         { step: 'Vente', date: daysFromToday(-26), isDone: true },
         { step: 'Notaire', date: daysFromToday(-26), isDone: true },
         { step: 'Possession', date: daysFromToday(-26), isDone: true },
         { step: 'Conclusion', date: daysFromToday(-13), isDone: true },
      ],
      notaries: [info("Date d'ajustement"), info('Notaire des vendeurs', 'Aucun'), info('Notaire des acheteurs', 'Aucun')],
      followUp: [
         { label: 'Documents requis', value: '20', isAlert: true },
         { label: 'Questions CANAFE', value: '0' },
         { label: 'Avis de divulgation', value: '0' },
         { label: 'Remarques', value: '0' },
         { label: 'Clients potentiels associés', value: '0' },
      ],
      commissionPanels: [
         {
            title: 'Répartition des rétributions',
            icon: 'users',
            columns: columns('# Dossier', 'Courtier', 'Rôle', ['Total', 'right'], ['TPS', 'right'], ['TVH', 'right'], ['TVQ', 'right'], ['Sous-total', 'right']),
            rows: [
               row(1, ['', link('Aubin, Ginette L.', 'RE/MAX FORTIN, DELAGE INC.'), 'Courtier du vendeur', NO_AMOUNT, NO_AMOUNT, NO_AMOUNT, NO_AMOUNT, NO_AMOUNT]),
               row(2, [
                  link('R250001'),
                  link('Marthe Boulet'),
                  { value: "Référence d'inscription", sub: 'Aubin, Ginette L. (RE/MAX FORTIN, DELAGE INC.)' },
                  '1 724,63 $',
                  '75,00 $',
                  NO_AMOUNT,
                  '149,63 $',
                  '1 500,00 $',
               ]),
               row(3, ['', '', 'Total', '1 724,63 $', '75,00 $', NO_AMOUNT, '149,63 $', '1 500,00 $'], true),
            ],
            summary: [
               { label: 'Rétribution à payer', value: '1 500,00 $' },
               { label: 'Différence', value: NO_AMOUNT },
            ],
         },
         {
            title: 'Sommaire des rétributions à recevoir',
            icon: 'inbox',
            columns: columns('Agence', ['À recevoir', 'right'], ['Dépôt', 'right'], ['Total', 'right']),
            rows: [
               row(1, ['RE/MAX FORTIN, DELAGE INC.', '1 724,63 $', NO_AMOUNT, '1 724,63 $']),
               row(2, ['Total', '1 724,63 $', NO_AMOUNT, '1 724,63 $'], true),
            ],
         },
         {
            title: 'Historique des calculs',
            icon: 'clock',
            columns: columns('Date du calcul', 'Par', 'Traitement', ['Montant', 'right']),
            rows: [row(1, [link(formatDate(daysFromToday(-13))), 'ezmax1', formatDateTime(daysFromToday(-13)), '1 500,00 $'])],
         },
      ],
      commissionEmpty: [
         { title: 'Volume · courtiers du vendeur', icon: 'users' },
         { title: "Volume · courtiers de l'acheteur", icon: 'users' },
         { title: 'Avances sur rétribution', icon: 'send' },
         { title: 'Autres revenus', icon: 'inbox' },
      ],
      partyPanels: [
         {
            title: 'Dossiers',
            icon: 'folder',
            columns: columns('Dépôt', '# Dossier', 'Agence', 'Rétribution payée par', ['Impression', 'right']),
            rows: [
               row(1, ['', '', 'RE/MAX FORTIN, DELAGE INC.', '', '']),
               row(2, ['Oui', link('R250001'), 'Microsoft', 'RE/MAX FORTIN, DELAGE INC.', 'Étiquette']),
            ],
         },
      ],
      partyEmpty: [
         { title: 'Acheteurs', icon: 'user' },
         { title: 'Fournitures facturées', icon: 'file' },
         { title: 'Dépôts', icon: 'inbox' },
         { title: 'Dépôts externes', icon: 'home' },
      ],
      balance: NO_AMOUNT,
      paymentPanels: [
         {
            title: 'Statut des paiements de rétribution',
            icon: 'check',
            columns: columns('Courtier · rôle · dossier', ['À payer', 'right'], ['Payé', 'right'], ['Traité sans encaissement', 'right'], ['Différence', 'right']),
            rows: [
               row(1, [{ value: 'Aubin, Ginette L.', sub: 'RE/MAX FORTIN, DELAGE INC. · Courtier du vendeur' }, NO_AMOUNT, NO_AMOUNT, NO_AMOUNT, NO_AMOUNT]),
               row(2, [{ value: 'Boulet, Marthe', sub: "Référence d'inscription · R250001" }, '1 500,00 $', '1 500,00 $', NO_AMOUNT, NO_AMOUNT]),
               row(3, ['Total', '1 500,00 $', '1 500,00 $', NO_AMOUNT, NO_AMOUNT], true),
            ],
         },
      ],
      concludedAt: daysFromToday(-13),
   }
}

function makeCancelledSale(): Sale {
   return {
      id: '17290',
      stateLabel: 'Annulée',
      stateTone: 'neutral',
      counters: [
         { icon: 'file', label: '1 fichier · 24,10 Ko' },
         { icon: 'file', label: '0 document' },
         { icon: 'mail', label: '0 communication' },
      ],
      kpis: [
         { label: 'Montant de la transaction', value: '145 000 $', sub: 'Vente' },
         { label: 'Rétribution à recevoir', value: NO_AMOUNT, sub: '1,00 % du montant' },
         { label: 'TVH', value: NO_AMOUNT, sub: 'Taxes' },
         { label: 'Total', value: NO_AMOUNT, sub: 'Vente annulée' },
      ],
      financing: [
         info('Type de prêt hypothécaire', 'Nouveau prêt'),
         info('Montant du prêt', '116 000 $'),
         info('Date prévue du financement', formatDate(daysFromToday(-51))),
         info('Institution financière'),
         info('Type de résidence', 'Principale'),
      ],
      flags: [
         { on: false, label: 'Acheteur non occupant' },
         { on: false, label: 'Exclue des campagnes de marketing' },
         { on: false, label: 'Non référée' },
         { on: false, label: "Aucun contrat de courtage d'achat lié" },
      ],
      timeline: [
         { step: 'Transaction', date: daysFromToday(-69), isDone: true },
         { step: 'Vente', date: null, isDone: false },
         { step: 'Notaire', date: daysFromToday(-44), isDone: false },
         { step: 'Possession', date: null, isDone: false },
         { step: 'Conclusion', date: null, isDone: false },
      ],
      notaries: [info("Date d'ajustement"), info('Notaire des vendeurs', 'Aucun'), info('Notaire des acheteurs', 'Aucun')],
      followUp: [
         { label: 'Documents requis', value: '0' },
         { label: 'Questions CANAFE', value: '0' },
         { label: 'Avis de divulgation', value: '0' },
         { label: 'Remarques', value: '1' },
         { label: 'Clients potentiels associés', value: '0' },
      ],
      commissionPanels: [],
      commissionEmpty: [
         { title: 'Répartition des rétributions', icon: 'users' },
         { title: 'Sommaire à recevoir', icon: 'inbox' },
         { title: 'Volume · courtiers du vendeur', icon: 'users' },
         { title: "Volume · courtiers de l'acheteur", icon: 'users' },
         { title: 'Avances sur rétribution', icon: 'send' },
         { title: 'Historique des calculs', icon: 'clock' },
      ],
      partyPanels: [],
      partyEmpty: [
         { title: 'Dossiers', icon: 'folder' },
         { title: 'Acheteurs', icon: 'user' },
         { title: 'Fournitures facturées', icon: 'file' },
         { title: 'Dépôts', icon: 'inbox' },
         { title: 'Dépôts externes', icon: 'home' },
      ],
      balance: NO_AMOUNT,
      paymentPanels: [],
      concludedAt: null,
   }
}

function makeInscription(sales: Sale[]): Inscription {
   return {
      id: '29179',
      counters: [
         { icon: 'file', label: '0 fichier' },
         { icon: 'file', label: '0 document' },
         { icon: 'mail', label: '0 communication' },
      ],
      identification: [
         info("Numéro d'identification eZmax", '29179'),
         info('Étape', 'Notariée'),
         info('Chambre immobilière', 'Chambre immobilière du Grand Montréal'),
         info('Numéro Centris'),
         info('Numéro de contrat'),
         info('Déclaration du vendeur'),
         info('Source Centiva'),
      ],
      address: '1505 Barrington Street, Halifax, Nouvelle-Écosse, Canada, B3J 3K5',
      classification: [
         info('Type de transaction', 'Vente'),
         info("Catégorie d'inscription", 'Unifamiliale'),
         info('Type de propriété', 'Maison'),
         info('Type de résidence', 'Principale'),
      ],
      building: [info('Type de bâtiment'), info('Année de construction'), info('Unités par immeuble', '0'), info('Cadastre'), info('Code de clé')],
      prices: [
         { label: 'Prix (vente)', value: NO_AMOUNT },
         { label: 'Prix (location)', value: NO_AMOUNT },
         { label: 'Solde hypothécaire et autres créances', value: NO_AMOUNT },
      ],
      characteristics: [
         { on: true, label: 'Propriétaire occupant' },
         { on: false, label: 'Non vendue par le propriétaire' },
         { on: false, label: 'Propriété non neuve' },
         { on: false, label: "Non soumise à l'inspection" },
         { on: false, label: 'Avec garantie légale' },
         { on: false, label: 'Aucune clé' },
      ],
      followUp: [
         { label: 'Documents requis', value: '0' },
         { label: 'Remarques', value: '0' },
         { label: 'Questions CANAFE', value: '0' },
      ],
      validations: [
         { label: 'Administration', state: 'Non demandée' },
         { label: 'Direction', state: 'Non demandée' },
      ],
      statusFlags: [
         { on: true, label: 'Incluse dans les campagnes de marketing' },
         { on: false, label: 'Non archivé' },
         { on: false, label: 'Aucun litige' },
         { on: false, label: 'Aucune reprise de finance' },
         { on: false, label: 'Aucune référence due' },
         { on: false, label: 'Aucune vente annulée' },
      ],
      commissions: [
         { label: "Courtier de l'acheteur", value: '0,00 %' },
         { label: 'Total', value: '0,00 %' },
         { label: "Courtier de l'acheteur et du vendeur", value: '0,00 %' },
         { label: 'Référence', value: '0,00 %' },
      ],
      partyPanels: [
         {
            title: 'Propriétaires',
            icon: 'user',
            columns: columns('Nom', 'Titre', 'Compagnie', 'Téléphone', 'Adresse', 'Courriel'),
            rows: [
               row(1, [
                  link('Lafond, Daniel', 'Français'),
                  '',
                  '',
                  '',
                  { value: '1505 Barrington Street', sub: 'Maison · Halifax, Nouvelle-Écosse, B3J 3K5' },
                  '',
               ]),
            ],
         },
      ],
      partyEmpty: [
         { title: 'Courtiers du vendeur', icon: 'users' },
         { title: 'Dossiers', icon: 'folder' },
         { title: "Promesses d'achat refusées", icon: 'close' },
      ],
      financeEmpty: [
         { title: 'Dépôts', icon: 'inbox' },
         { title: 'Fournitures facturées', icon: 'file' },
         { title: 'Autres revenus', icon: 'inbox' },
      ],
      createdAt: daysFromToday(-13),
      modifiedAt: daysFromToday(-13),
      author: 'ezmax1',
      sales,
   }
}

export const scenarios = defineScenarios({
   'with-sales': () => ({ inscription: makeInscription([makeNotarizedSale(), makeCancelledSale()]) }),
   'no-sale': () => ({ inscription: makeInscription([]) }), // edge: nothing sold yet
})
