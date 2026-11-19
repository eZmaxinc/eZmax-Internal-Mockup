import { defineScenarios, gettext } from '@ez'
import { daysFromToday, type BadgeTone } from '@mocks'

export type TestRunState = 'running' | 'passed' | 'failed' | 'warning' | 'cancelled'
export type TestSuiteType = 'all' | 'api' | 'e2e'

export interface TestBranch {
   name: string
   lastCommitSha: string
   lastAuthor: string
   updatedLabel: string
   isDefault?: boolean
}

export interface TestModule {
   id: string
   label: string
   shortLabel: string
   category: string
   subcategory: string
}

export interface TestCaseFailure {
   testName: string
   message: string
   file: string
   excerpt: string
}

export interface TestSuiteResult {
   id: string
   name: string
   passed: number
   failed: number
   skipped: number
   durationSeconds: number
   failures: TestCaseFailure[]
}

export interface TestRun {
   id: number
   code: string
   branch: string
   commitSha: string
   moduleIds: string[]
   moduleLabel: string
   suiteType: TestSuiteType
   requestedBy: string
   environment: string
   startedAt: Date
   finishedAt: Date | null
   durationSeconds: number
   state: TestRunState
   progressPercent: number
   currentStep: string
   totalTests: number
   passedTests: number
   failedTests: number
   skippedTests: number
   coveragePercent: number | null
   suites: TestSuiteResult[]
   logLines: string[]
}

export interface ServerTestData {
   serverOnline: boolean
   serverStatusMessage: string
   currentUser: string
   branches: TestBranch[]
   modules: TestModule[]
   runs: TestRun[]
}

export const SUITE_TYPE_OPTIONS: { label: string; value: TestSuiteType }[] = [
   { label: gettext('Tous les tests'), value: 'all' },
   { label: gettext('Test API'), value: 'api' },
   { label: gettext('Test E2E'), value: 'e2e' },
]

export const AVAILABLE_MODULES: TestModule[] = [
   {
      id: 'ezsign-folders',
      label: gettext('Dossiers et signatures'),
      shortLabel: 'eZsign Dossiers',
      category: 'eZsign',
      subcategory: gettext('Signature & Dossiers'),
   },
   {
      id: 'ezsign-templates',
      label: gettext('Modèles et gabarits'),
      shortLabel: 'Modèles',
      category: 'eZsign',
      subcategory: gettext('Signature & Dossiers'),
   },
   {
      id: 'ezsign-signers',
      label: gettext('Signataires et relances'),
      shortLabel: 'Signataires',
      category: 'eZsign',
      subcategory: gettext('Signature & Dossiers'),
   },
   {
      id: 'ezsign-pdf',
      label: gettext('Génération et estampillage PDF'),
      shortLabel: 'Moteur PDF',
      category: 'eZsign',
      subcategory: gettext('Moteur & Documents'),
   },
   {
      id: 'ezsign-ocr',
      label: gettext('Extraction et reconnaissance OCR'),
      shortLabel: 'OCR & Indexation',
      category: 'eZsign',
      subcategory: gettext('Moteur & Documents'),
   },
   {
      id: 'ezsign-notifications',
      label: gettext('Courriels et SMS'),
      shortLabel: 'Notifications',
      category: 'eZsign',
      subcategory: gettext('Communications'),
   },
   {
      id: 'ezsign-webhooks',
      label: gettext('Webhooks et événements'),
      shortLabel: 'Webhooks',
      category: 'eZsign',
      subcategory: gettext('Communications'),
   },
   {
      id: 'ezsign-api',
      label: gettext('Endpoints REST v2'),
      shortLabel: 'API REST v2',
      category: gettext('API & Intégrations'),
      subcategory: gettext('API Publique'),
   },
   {
      id: 'ezsign-graphql',
      label: gettext('Schéma GraphQL'),
      shortLabel: 'GraphQL',
      category: gettext('API & Intégrations'),
      subcategory: gettext('API Publique'),
   },
   {
      id: 'ezmax-webhooks-ext',
      label: gettext('Connecteurs ERP & CRM'),
      shortLabel: 'Connecteurs ERP',
      category: gettext('API & Intégrations'),
      subcategory: gettext('Connecteurs'),
   },
   {
      id: 'ezmax-auth',
      label: gettext('SSO, SAML et permissions'),
      shortLabel: 'Authentification',
      category: 'eZmax Core',
      subcategory: gettext('Sécurité & Accès'),
   },
   {
      id: 'ezmax-audit',
      label: gettext('Journaux d’audit'),
      shortLabel: 'Audit',
      category: 'eZmax Core',
      subcategory: gettext('Sécurité & Accès'),
   },
   {
      id: 'ezmax-billing',
      label: gettext('Abonnements et taxes'),
      shortLabel: 'Facturation',
      category: 'eZmax Core',
      subcategory: gettext('Administration'),
   },
   {
      id: 'ezmax-tenants',
      label: gettext('Gestion des locataires'),
      shortLabel: 'Locataires',
      category: 'eZmax Core',
      subcategory: gettext('Administration'),
   },
]

export function formatModuleSelectionLabel(moduleIds: string[], modules: TestModule[]): string {
   if (moduleIds.length === 0) return gettext('Aucun module')
   if (moduleIds.length >= modules.length) return gettext('Tous les modules')
   const selected = modules.filter((mod) => moduleIds.includes(mod.id))
   if (selected.length === 1) return selected[0].shortLabel
   if (selected.length === 2) return `${selected[0].shortLabel}, ${selected[1].shortLabel}`
   return `${selected[0].shortLabel}, ${selected[1].shortLabel} +${selected.length - 2}`
}

export const AVAILABLE_BRANCHES: TestBranch[] = [
   { name: 'main', lastCommitSha: 'e41d9b2', lastAuthor: 'Mikhael Aubut', updatedLabel: gettext('il y a 18 min'), isDefault: true },
   { name: 'develop', lastCommitSha: '9c3a71f', lastAuthor: 'Marc-André Desalliers', updatedLabel: gettext('il y a 6 min') },
   { name: 'feat/ezsign-relance-signataires', lastCommitSha: 'a8f3c21', lastAuthor: 'Patrick Perron', updatedLabel: gettext('il y a 12 min') },
   { name: 'feat/ezsign-cycle-de-vie-v2', lastCommitSha: '7b104e8', lastAuthor: 'Mikhael Aubut', updatedLabel: gettext('il y a 42 min') },
   { name: 'fix/pdf-estampillage-utf8', lastCommitSha: '3d92a14', lastAuthor: 'Marc-André Desalliers', updatedLabel: gettext('il y a 1 h') },
   { name: 'feat/api-v2-webhooks-signature', lastCommitSha: '51ef09c', lastAuthor: 'Marc-André Desalliers', updatedLabel: gettext('il y a 2 h') },
   { name: 'fix/auth-saml-expiration', lastCommitSha: 'c02b8d4', lastAuthor: 'Mikhael Aubut', updatedLabel: gettext('hier') },
   { name: 'chore/php-84-compatibilite', lastCommitSha: '6f44a10', lastAuthor: 'Patrick Perron', updatedLabel: gettext('hier') },
   { name: 'release/2026.11', lastCommitSha: '18a9e33', lastAuthor: 'Patrick Perron', updatedLabel: gettext('il y a 2 jours') },
]

export function runStateLabel(state: TestRunState): string {
   switch (state) {
      case 'running':
         return gettext('En cours')
      case 'passed':
         return gettext('Réussi')
      case 'failed':
         return gettext('Échoué')
      case 'warning':
         return gettext('Instable')
      case 'cancelled':
         return gettext('Annulé')
   }
}

export function runStateTone(state: TestRunState): BadgeTone {
   switch (state) {
      case 'running':
         return 'info'
      case 'passed':
         return 'success'
      case 'failed':
         return 'danger'
      case 'warning':
         return 'warning'
      case 'cancelled':
         return 'neutral'
   }
}

export function suiteTypeLabel(type: TestSuiteType): string {
   switch (type) {
      case 'all':
         return gettext('Tous les tests')
      case 'api':
         return gettext('Test API')
      case 'e2e':
         return gettext('Test E2E')
   }
}

export function formatDuration(seconds: number): string {
   if (seconds < 60) return `${seconds} s`
   const mins = Math.floor(seconds / 60)
   const secs = seconds % 60
   return secs > 0 ? `${mins} min ${String(secs).padStart(2, '0')} s` : `${mins} min`
}

function daysAgoAt(daysAgo: number, hour: number, minute: number): Date {
   const date = daysFromToday(-daysAgo)
   date.setHours(hour, minute, 0, 0)
   return date
}

function buildSuitesForRun(moduleId: string, passed: number, failed: number, skipped: number): TestSuiteResult[] {
   const total = passed + failed + skipped
   if (total === 0) return []

   const baseNames: Record<string, string[]> = {
      'ezsign-folders': ['EzsignFolderLifecycleTest', 'SignerReminderDispatchTest', 'FolderExpirationPolicyTest'],
      'ezsign-api': ['PublicFolderEndpointTest', 'WebhookSignatureHeaderTest', 'RateLimiterMiddlewareTest'],
      'ezsign-pdf': ['PdfStampPlacementTest', 'Utf8GlyphRenderingTest', 'SignatureSealChecksumTest'],
      'ezsign-notifications': ['EmailTemplateLocalizationTest', 'SmsGatewayRetryTest', 'BounceHandlerTest'],
      'ezmax-auth': ['SamlAssertionValidatorTest', 'RolePermissionMatrixTest', 'SessionRefreshTokenTest'],
      'ezmax-billing': ['SubscriptionProrationTest', 'QuebecTaxCalculatorTest', 'InvoicePdfExportTest'],
      all: ['EzsignCoreSuite', 'ApiV2ContractSuite', 'PdfEngineSuite', 'AuthAndPermissionsSuite'],
   }

   const names = baseNames[moduleId] ?? baseNames.all
   const count = names.length
   const basePassed = Math.floor(passed / count)
   const remPassed = passed % count

   return names.map((name, index) => {
      const suitePassed = basePassed + (index === 0 ? remPassed : 0)
      const suiteFailed = index === 1 || count === 1 ? failed : 0
      const suiteSkipped = index === count - 1 ? skipped : 0
      const failures: TestCaseFailure[] =
         suiteFailed > 0
            ? Array.from({ length: suiteFailed }, (_, failIndex) => ({
                 testName: failIndex === 0 ? 'test_reminder_skips_completed_signers' : 'test_concurrent_webhook_delivery_order',
                 file: `tests/${moduleId}/${name}.php:${78 + failIndex * 34}`,
                 message:
                    failIndex === 0
                       ? 'Failed asserting that 2 matches expected 1 (completed signer received a duplicate reminder).'
                       : 'Timed out after 5000 ms waiting for webhook delivery ACK on queue worker #2.',
                 excerpt:
                    failIndex === 0
                       ? 'Expected: 1\nActual:   2\nat Ezsign\\Tests\\SignerReminderDispatchTest::test_reminder_skips_completed_signers (line 84)'
                       : 'QueueTimeoutException: Worker ci-runner-02 did not acknowledge job 99412 within 5000 ms.',
              }))
            : []

      return {
         id: `${moduleId}-${index}`,
         name,
         passed: suitePassed,
         failed: suiteFailed,
         skipped: suiteSkipped,
         durationSeconds: 18 + index * 14 + suiteFailed * 9,
         failures,
      }
   })
}

export function buildLogLines(run: Pick<TestRun, 'code' | 'branch' | 'commitSha' | 'moduleLabel' | 'requestedBy' | 'environment' | 'state' | 'passedTests' | 'failedTests' | 'skippedTests' | 'durationSeconds'>): string[] {
   const lines = [
      `[INFO] ${run.code} — Initialisation sur ${run.environment}`,
      `[INFO] Demandé par: ${run.requestedBy}`,
      `[GIT]  git fetch origin ${run.branch} && git checkout ${run.commitSha}`,
      `[GIT]  HEAD est maintenant à ${run.commitSha} (${run.branch})`,
      `[ENV]  PHP 8.4.2 · PostgreSQL 16.4 · Redis 7.2 · Chrome Headless 130`,
      `[EXEC] Démarrage de la suite « ${run.moduleLabel} »...`,
      `[TEST] Chargement des fixtures et réinitialisation de la base de test`,
   ]

   if (run.state === 'running') {
      lines.push(
         `[TEST] Exécution des tests unitaires... OK (${run.passedTests} réussis)`,
         `[TEST] Exécution des tests d’intégration en cours...`,
      )
      return lines
   }

   if (run.failedTests > 0) {
      lines.push(
         `[PASS] ${run.passedTests} tests réussis`,
         `[FAIL] ${run.failedTests} test(s) en échec — voir le détail dans l’onglet Résumé`,
         `[ERR]  AssertionError dans SignerReminderDispatchTest::test_reminder_skips_completed_signers (ligne 84)`,
      )
   } else if (run.state === 'cancelled') {
      lines.push(`[WARN] Exécution interrompue manuellement par ${run.requestedBy}`)
   } else {
      lines.push(
         `[PASS] ${run.passedTests} tests réussis`,
         run.skippedTests > 0 ? `[WARN] ${run.skippedTests} test(s) ignoré(s) (marqués @slow)` : `[PASS] 0 échec, 0 avertissement`,
      )
   }

   lines.push(
      `[DONE] Terminé en ${formatDuration(run.durationSeconds)} — Statut final: ${runStateLabel(run.state).toUpperCase()}`,
   )
   return lines
}

function createExecutedRuns(): TestRun[] {
   const rawRuns: Omit<TestRun, 'suites' | 'logLines'>[] = [
      {
         id: 1048,
         code: '#RUN-1048',
         branch: 'feat/ezsign-relance-signataires',
         commitSha: 'a8f3c21',
         moduleIds: ['ezsign-folders', 'ezsign-signers'],
         moduleLabel: 'eZsign — Dossiers et signatures',
         suiteType: 'all',
         requestedBy: 'Patrick Perron',
         environment: 'ci-runner-02',
         startedAt: daysAgoAt(0, 14, 18),
         finishedAt: daysAgoAt(0, 14, 20),
         durationSeconds: 134,
         state: 'failed',
         progressPercent: 100,
         currentStep: gettext('Terminé'),
         totalTests: 145,
         passedTests: 143,
         failedTests: 2,
         skippedTests: 0,
         coveragePercent: 86.4,
      },
      {
         id: 1047,
         code: '#RUN-1047',
         branch: 'develop',
         commitSha: '9c3a71f',
         moduleIds: ['ezsign-api', 'ezsign-webhooks'],
         moduleLabel: 'API REST v2 — Endpoints publics',
         suiteType: 'integration',
         requestedBy: 'Marc-André Desalliers',
         environment: 'ci-runner-01',
         startedAt: daysAgoAt(0, 11, 42),
         finishedAt: daysAgoAt(0, 11, 44),
         durationSeconds: 98,
         state: 'passed',
         progressPercent: 100,
         currentStep: gettext('Terminé'),
         totalTests: 88,
         passedTests: 88,
         failedTests: 0,
         skippedTests: 0,
         coveragePercent: 91.2,
      },
      {
         id: 1046,
         code: '#RUN-1046',
         branch: 'fix/pdf-estampillage-utf8',
         commitSha: '3d92a14',
         moduleIds: ['ezsign-pdf'],
         moduleLabel: 'Moteur PDF — Génération et estampillage',
         suiteType: 'all',
         requestedBy: 'Mikhael Aubut',
         environment: 'ci-runner-03',
         startedAt: daysAgoAt(0, 9, 15),
         finishedAt: daysAgoAt(0, 9, 18),
         durationSeconds: 176,
         state: 'warning',
         progressPercent: 100,
         currentStep: gettext('Terminé'),
         totalTests: 64,
         passedTests: 61,
         failedTests: 0,
         skippedTests: 3,
         coveragePercent: 79.8,
      },
      {
         id: 1045,
         code: '#RUN-1045',
         branch: 'main',
         commitSha: 'e41d9b2',
         moduleIds: AVAILABLE_MODULES.map((mod) => mod.id),
         moduleLabel: 'Tous les modules',
         suiteType: 'all',
         requestedBy: 'Mikhael Aubut',
         environment: 'ci-runner-01',
         startedAt: daysAgoAt(1, 16, 50),
         finishedAt: daysAgoAt(1, 16, 56),
         durationSeconds: 342,
         state: 'passed',
         progressPercent: 100,
         currentStep: gettext('Terminé'),
         totalTests: 412,
         passedTests: 410,
         failedTests: 0,
         skippedTests: 2,
         coveragePercent: 88.1,
      },
      {
         id: 1044,
         code: '#RUN-1044',
         branch: 'feat/api-v2-webhooks-signature',
         commitSha: '51ef09c',
         moduleIds: ['ezsign-notifications'],
         moduleLabel: 'Notifications — Courriels et SMS',
         suiteType: 'unit',
         requestedBy: 'Marc-André Desalliers',
         environment: 'ci-runner-02',
         startedAt: daysAgoAt(1, 13, 10),
         finishedAt: daysAgoAt(1, 13, 11),
         durationSeconds: 41,
         state: 'cancelled',
         progressPercent: 48,
         currentStep: gettext('Interrompu à 48 %'),
         totalTests: 52,
         passedTests: 25,
         failedTests: 0,
         skippedTests: 27,
         coveragePercent: null,
      },
      {
         id: 1043,
         code: '#RUN-1043',
         branch: 'fix/auth-saml-expiration',
         commitSha: 'c02b8d4',
         moduleIds: ['ezmax-auth', 'ezmax-audit'],
         moduleLabel: 'Authentification — SSO et permissions',
         suiteType: 'all',
         requestedBy: 'Patrick Perron',
         environment: 'ci-runner-01',
         startedAt: daysAgoAt(2, 10, 5),
         finishedAt: daysAgoAt(2, 10, 7),
         durationSeconds: 112,
         state: 'passed',
         progressPercent: 100,
         currentStep: gettext('Terminé'),
         totalTests: 96,
         passedTests: 96,
         failedTests: 0,
         skippedTests: 0,
         coveragePercent: 93.5,
      },
   ]

   return rawRuns.map((run) => ({
      ...run,
      suites: buildSuitesForRun(run.moduleId, run.passedTests, run.failedTests, run.skippedTests),
      logLines: buildLogLines(run),
   }))
}

function createRunningRun(id: number, branch: string, moduleIds: string[], suiteType: TestSuiteType, requestedBy: string, progressPercent: number): TestRun {
   const branchMeta = AVAILABLE_BRANCHES.find((item) => item.name === branch)
   const moduleLabel = formatModuleSelectionLabel(moduleIds, AVAILABLE_MODULES)
   const totalTests = moduleIds.length >= AVAILABLE_MODULES.length ? 412 : Math.max(68, moduleIds.length * 96)
   const passedSoFar = Math.round((totalTests * progressPercent) / 100)
   const draft: Omit<TestRun, 'suites' | 'logLines'> = {
      id,
      code: `#RUN-${id}`,
      branch,
      commitSha: branchMeta?.lastCommitSha ?? 'f00b4r1',
      moduleIds,
      moduleLabel,
      suiteType,
      requestedBy,
      environment: 'ci-runner-02',
      startedAt: daysAgoAt(0, 15, 4),
      finishedAt: null,
      durationSeconds: Math.max(4, Math.round(progressPercent * 0.9)),
      state: 'running',
      progressPercent,
      currentStep:
         progressPercent < 30
            ? gettext('Préparation de l’environnement et des fixtures…')
            : progressPercent < 75
              ? gettext('Exécution des suites de tests (%{done}/%{total})…', { done: passedSoFar, total: totalTests })
              : gettext('Finalisation du rapport et calcul de couverture…'),
      totalTests,
      passedTests: passedSoFar,
      failedTests: 0,
      skippedTests: 0,
      coveragePercent: null,
   }

   return {
      ...draft,
      suites: buildSuitesForRun(moduleIds[0] ?? 'all', passedSoFar, 0, 0),
      logLines: buildLogLines(draft),
   }
}

/** Data scenarios for this version. The first key is the default. */
export const scenarios = defineScenarios<ServerTestData>({
   historique: () => ({
      serverOnline: true,
      serverStatusMessage: '',
      currentUser: 'Patrick Perron',
      branches: AVAILABLE_BRANCHES,
      modules: AVAILABLE_MODULES,
      runs: createExecutedRuns(),
   }),
   'en-cours': () => ({
      serverOnline: true,
      serverStatusMessage: '',
      currentUser: 'Patrick Perron',
      branches: AVAILABLE_BRANCHES,
      modules: AVAILABLE_MODULES,
      runs: [
         createRunningRun(1049, 'feat/ezsign-cycle-de-vie-v2', ['ezsign-folders', 'ezsign-signers'], 'all', 'Patrick Perron', 46),
         ...createExecutedRuns(),
      ],
   }),
   vide: () => ({
      serverOnline: true,
      serverStatusMessage: '',
      currentUser: 'Patrick Perron',
      branches: AVAILABLE_BRANCHES,
      modules: AVAILABLE_MODULES,
      runs: [],
   }),
   'serveur-indisponible': () => ({
      serverOnline: false,
      serverStatusMessage: gettext('Les agents d’exécution CI (ci-runner-01..03) ne répondent pas pour le moment. Les nouveaux lancements sont suspendus, mais les rapports passés restent accessibles.'),
      currentUser: 'Patrick Perron',
      branches: AVAILABLE_BRANCHES,
      modules: AVAILABLE_MODULES,
      runs: createExecutedRuns(),
   }),
})
