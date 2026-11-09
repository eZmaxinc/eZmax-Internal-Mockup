import { createRandom, daysFromToday, firstNames, folderNames, lastNames } from './random'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'action'

/* ───────────── Signer ───────────── */

export type SignerState = 'pending' | 'viewed' | 'signed' | 'refused'

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

   get fullName() {
      return `${this.firstName} ${this.lastName}`
   }

   get initials() {
      return `${this.firstName[0]}${this.lastName[0]}`
   }

   isDone() {
      return this.state === 'signed' || this.state === 'refused'
   }

   canBeReminded() {
      return !this.isDone()
   }

   stateLabel() {
      return { pending: 'En attente', viewed: 'Consulté', signed: 'Signé', refused: 'Refusé' }[this.state]
   }

   stateTone(): BadgeTone {
      return ({ pending: 'neutral', viewed: 'info', signed: 'success', refused: 'danger' } as const)[this.state]
   }
}

/* ───────────── Document ───────────── */

export class EzsignDocument {
   constructor(
      public id: number,
      public name: string,
      public pageCount: number,
      public signaturesRequired: number,
      public signaturesDone: number,
   ) {}

   isComplete() {
      return this.signaturesDone >= this.signaturesRequired
   }
}

/* ───────────── Folder ───────────── */

export type FolderState = 'draft' | 'sent' | 'completed' | 'expired' | 'refused'

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

   isStateClosed() {
      return this.state === 'completed' || this.state === 'expired' || this.state === 'refused'
   }

   isStateDraft() {
      return this.state === 'draft'
   }

   signedCount() {
      return this.signers.filter((signer) => signer.state === 'signed').length
   }

   pendingSigners() {
      return this.signers.filter((signer) => signer.canBeReminded())
   }

   /** Due within 3 days and still open */
   isDueSoon(now = daysFromToday(0)) {
      if (!this.dueAt || this.isStateClosed()) return false
      const days = (this.dueAt.getTime() - now.getTime()) / 86_400_000
      return days >= 0 && days <= 3
   }

   stateLabel() {
      return { draft: 'Brouillon', sent: 'En signature', completed: 'Complété', expired: 'Expiré', refused: 'Refusé' }[this.state]
   }

   stateTone(): BadgeTone {
      return ({ draft: 'neutral', sent: 'info', completed: 'success', expired: 'warning', refused: 'danger' } as const)[this.state]
   }
}

/* ───────────── Factories ───────────── */

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

export function makeFolders(count: number, seed = 1): EzsignFolder[] {
   return Array.from({ length: count }, (_, index) => makeFolder(seed + index))
}
