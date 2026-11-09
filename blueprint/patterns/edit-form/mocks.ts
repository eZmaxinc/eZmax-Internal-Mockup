import { defineScenarios } from '@ez'
import { makeSigner, type EzsignSigner } from '@mocks'

interface FolderForm {
   id: number | null
   name: string
   language: string
   dueAt: string
   message: string
   signers: EzsignSigner[]
}

export const scenarios = defineScenarios<FolderForm>({
   edit: () => ({
      id: 12,
      name: 'Bail commercial — Local 204',
      language: 'fr',
      dueAt: '2026-11-20',
      message: 'Merci de signer avant la fin du mois.',
      signers: [makeSigner(1), makeSigner(2)],
   }),
   new: () => ({ id: null, name: '', language: 'fr', dueAt: '', message: '', signers: [] }),
})
