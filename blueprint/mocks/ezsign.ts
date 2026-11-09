import { createRandom, daysFromToday, firstNames, folderNames, lastNames } from './random'

/** The tones of ez-badge: same meaning, same tone, everywhere. */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'action'

/* ───────────── Signer ───────────── */

/** Where a signer is in the signing flow. */
export type SignerState = 'pending' | 'viewed' | 'signed' | 'refused'

/** A person who must sign the documents of a folder. */
export class EzsignSigner {
   constructor(
      public id: number,
      public firstName: string,
      public lastName: string,
      public email: string,
      public state: SignerState,
      public lastActivityAt: Date | null = null,
      public remindersSent = 0,
   ) {}

   /** First and last name */
   get fullName() {
      return `${this.firstName} ${this.lastName}`
   }

   /** Two letters, for an avatar */
   get initials() {
      return `${this.firstName[0]}${this.lastName[0]}`
   }

   /** Signed or refused: nothing left to do */
   isDone() {
      return this.state === 'signed' || this.state === 'refused'
   }

   /** Still has to sign, so a reminder makes sense */
   canBeReminded() {
      return !this.isDone()
   }

   /** French label of the state (« En attente »…) */
   stateLabel() {
      return { pending: 'En attente', viewed: 'Consulté', signed: 'Signé', refused: 'Refusé' }[this.state]
   }

   /** ez-badge tone of the state; prefer <ez-badge-signer-state> */
   stateTone(): BadgeTone {
      return ({ pending: 'neutral', viewed: 'info', signed: 'success', refused: 'danger' } as const)[this.state]
   }
}

/* ───────────── Document ───────────── */

/** A PDF in a folder, with the signatures it needs. */
export class EzsignDocument {
   constructor(
      public id: number,
      public name: string,
      public pageCount: number,
      public signaturesRequired: number,
      public signaturesDone: number,
   ) {}

   /** Every required signature is done */
   isComplete() {
      return this.signaturesDone >= this.signaturesRequired
   }
}

/* ───────────── Folder ───────────── */

/** Where a folder is in its life. completed, expired and refused are closed. */
export type FolderState = 'draft' | 'sent' | 'completed' | 'expired' | 'refused'

/** An eZsign folder: documents to sign, signers, a due date. */
export class EzsignFolder {
   constructor(
      public id: number,
      public name: string,
      public state: FolderState,
      public createdAt: Date,
      public dueAt: Date | null,
      public owner: string,
      public signers: EzsignSigner[] = [],
      public documents: EzsignDocument[] = [],
   ) {}

   /** Completed, expired or refused: nobody can sign anymore */
   isStateClosed() {
      return this.state === 'completed' || this.state === 'expired' || this.state === 'refused'
   }

   /** Not sent yet */
   isStateDraft() {
      return this.state === 'draft'
   }

   /** Number of signers who signed */
   signedCount() {
      return this.signers.filter((signer) => signer.state === 'signed').length
   }

   /** Signers who still have to sign */
   pendingSigners() {
      return this.signers.filter((signer) => signer.canBeReminded())
   }

   /** Days left before the due date (negative once past), null without a due date */
   daysUntilDue(now = daysFromToday(0)): number | null {
      if (!this.dueAt) return null
      return Math.ceil((this.dueAt.getTime() - now.getTime()) / 86_400_000)
   }

   /** Still open and due within `days` days (3 by default), today included */
   isDueSoon(days = 3, now = daysFromToday(0)) {
      const left = this.daysUntilDue(now)
      return left !== null && !this.isStateClosed() && left >= 0 && left <= days
   }

   /** French label of the state (« En signature »…) */
   stateLabel() {
      return { draft: 'Brouillon', sent: 'En signature', completed: 'Complété', expired: 'Expiré', refused: 'Refusé' }[this.state]
   }

   /** ez-badge tone of the state; prefer <ez-badge-folder-state> */
   stateTone(): BadgeTone {
      return ({ draft: 'neutral', sent: 'info', completed: 'success', expired: 'warning', refused: 'danger' } as const)[this.state]
   }
}

/* ───────────── Factories ───────────── */

/** A signer with stable random data for this seed; `overrides` sets what matters to the story. */
export function makeSigner(seed: number, overrides: Partial<EzsignSigner> = {}): EzsignSigner {
   const random = createRandom(seed)
   const firstName = random.pick(firstNames)
   const lastName = random.pick(lastNames)
   const email = `${firstName}.${lastName}@exemple.ca`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
   const signer = new EzsignSigner(
      seed,
      firstName,
      lastName,
      email,
      random.pick(['pending', 'viewed', 'signed', 'signed'] as const),
      daysFromToday(-random.int(0, 6)),
      random.int(0, 2),
   )
   return Object.assign(signer, overrides)
}

/** A folder with stable random data, signers and documents for this seed; `overrides` sets what matters to the story. */
export function makeFolder(seed: number, overrides: Partial<EzsignFolder> = {}): EzsignFolder {
   const random = createRandom(seed * 7919)
   const signers = Array.from({ length: random.int(1, 4) }, (_, index) => makeSigner(seed * 10 + index))
   const documents = Array.from({ length: random.int(1, 3) }, (_, index) => {
      const required = signers.length
      return new EzsignDocument(seed * 10 + index, `Document ${index + 1}.pdf`, random.int(1, 12), required, random.int(0, required))
   })
   const folder = new EzsignFolder(
      seed,
      random.pick(folderNames),
      random.pick(['sent', 'sent', 'sent', 'completed', 'draft', 'expired'] as const),
      daysFromToday(-random.int(2, 30)),
      daysFromToday(random.int(-2, 14)),
      `${random.pick(firstNames)} ${random.pick(lastNames)}`,
      signers,
      documents,
   )
   return Object.assign(folder, overrides)
}

/** `count` folders with consecutive seeds */
export function makeFolders(count: number, seed = 1): EzsignFolder[] {
   return Array.from({ length: count }, (_, index) => makeFolder(seed + index))
}
