# API de `@mocks`

> Généré par `pnpm proto catalog` à partir de `blueprint/mocks/*.ts`. Ne pas modifier à la main: documenter le code (JSDoc), puis régénérer.

Les objets métier des prototypes et leurs fabriques. Toutes les dates passent par `daysFromToday()`, pour qu'un scénario s'affiche toujours pareil. Une règle métier qui revient dans plusieurs tâches (un calcul, un état) appartient ici, pas dans un prototype: la noter « Mock manquant: … » dans `notes.md`.

## `EzsignSigner`

A person who must sign the documents of a folder.

| Membre | Signature | |
|---|---|---|
| `id` | `: number` |  |
| `firstName` | `: string` |  |
| `lastName` | `: string` |  |
| `email` | `: string` |  |
| `state` | `: SignerState` |  |
| `lastActivityAt` | `: Date \| null` |  |
| `remindersSent` | `: number` |  |
| `fullName` | `get` | First and last name |
| `initials` | `get` | Two letters, for an avatar |
| `isDone()` | `()` | Signed or refused: nothing left to do |
| `canBeReminded()` | `()` | Still has to sign, so a reminder makes sense |
| `stateLabel()` | `()` | French label of the state (« En attente »…) |
| `stateTone()` | `(): BadgeTone` | ez-badge tone of the state; prefer `<ez-badge-signer-state>` |

## `EzsignDocument`

A PDF in a folder, with the signatures it needs.

| Membre | Signature | |
|---|---|---|
| `id` | `: number` |  |
| `name` | `: string` |  |
| `pageCount` | `: number` |  |
| `signaturesRequired` | `: number` |  |
| `signaturesDone` | `: number` |  |
| `isComplete()` | `()` | Every required signature is done |

## `EzsignFolder`

An eZsign folder: documents to sign, signers, a due date.

| Membre | Signature | |
|---|---|---|
| `id` | `: number` |  |
| `name` | `: string` |  |
| `state` | `: FolderState` |  |
| `createdAt` | `: Date` |  |
| `dueAt` | `: Date \| null` |  |
| `owner` | `: string` |  |
| `signers` | `: EzsignSigner[]` |  |
| `documents` | `: EzsignDocument[]` |  |
| `isStateClosed()` | `()` | Completed, expired or refused: nobody can sign anymore |
| `isStateDraft()` | `()` | Not sent yet |
| `signedCount()` | `()` | Number of signers who signed |
| `pendingSigners()` | `()` | Signers who still have to sign |
| `daysUntilDue()` | `(now = daysFromToday(0)): number \| null` | Days left before the due date (negative once past), null without a due date |
| `isDueSoon()` | `(days = 3, now = daysFromToday(0))` | Still open and due within `days` days (3 by default), today included |
| `stateLabel()` | `()` | French label of the state (« En signature »…) |
| `stateTone()` | `(): BadgeTone` | ez-badge tone of the state; prefer `<ez-badge-folder-state>` |

## Fonctions, constantes et types

| Nom | Signature | |
|---|---|---|
| `BadgeTone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'action'` | The tones of ez-badge: same meaning, same tone, everywhere. |
| `SignerState` | `'pending' \| 'viewed' \| 'signed' \| 'refused'` | Where a signer is in the signing flow. |
| `FolderState` | `'draft' \| 'sent' \| 'completed' \| 'expired' \| 'refused'` | Where a folder is in its life. completed, expired and refused are closed. |
| `makeSigner` | `(seed: number, overrides: Partial<EzsignSigner> = {}): EzsignSigner` | A signer with stable random data for this seed; `overrides` sets what matters to the story. |
| `makeFolder` | `(seed: number, overrides: Partial<EzsignFolder> = {}): EzsignFolder` | A folder with stable random data, signers and documents for this seed; `overrides` sets what matters to the story. |
| `makeFolders` | `(count: number, seed = 1): EzsignFolder[]` | `count` folders with consecutive seeds |
| `createRandom` | `(seed = 42)` | Seeded PRNG so a scenario renders the same data every time. |
| `firstNames` | `const` | Pools of fake names used by the factories |
| `lastNames` | `const` |  |
| `folderNames` | `const` |  |
| `MOCK_TODAY` | `const` | Days offset from a fixed "today" so screenshots stay stable. |
| `daysFromToday` | `(days: number): Date` | A date `days` away from MOCK_TODAY (negative = past). Use it for every date in mocks. |
