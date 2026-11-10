import type { Component } from 'vue'
import type { Scenarios } from '@ez'

/**
 * File-system registry. Everything is discovered from disk — no database:
 *   prototypes/<task>/meta.json, README.md, v###[a-z]/{index.vue, mocks.ts, notes.md}
 *   blueprint/patterns/<name>/{index.vue, mocks.ts, notes.md}
 *
 * Only meta.json, README.md and notes.md are read at startup. Components and scenarios
 * are loaded when a version is opened, so the shell stays fast as prototypes pile up.
 */

export type ProtoStatus = 'draft' | 'review' | 'chosen' | 'archived'
export type ProtoChrome = 'app' | 'none'

export interface GoodDayLink {
   /** Task number shown as #49198 in GoodDay; also used in branch names (feature/49198-…) */
   number: number
   /** Short link, e.g. https://www.goodday.work/t/M2nSjU */
   url: string
}

export interface ProtoMeta {
   title: string
   goodday: GoodDayLink | null
   status: ProtoStatus
   /** Version retained by the team, e.g. "v002" */
   chosen?: string | null
   chrome?: ProtoChrome
   owner?: string
   tags?: string[]
   created?: string
   /** Demo task shipped with the tool: no GoodDay task */
   demo?: boolean
}

export interface VersionNotes {
   basedOn: string | null
   date: string | null
   summary: string
   body: string
}

export interface ProtoVersion {
   id: string
   notes: VersionNotes
}

export interface ProtoTask {
   id: string
   meta: ProtoMeta
   brief: string
   versions: ProtoVersion[]
}

export interface ProtoModule {
   component: Component
   scenarios: Scenarios<unknown>
}

export interface PatternEntry {
   id: string
   notes: VersionNotes
}

const VERSION_PATTERN = /^v\d{3}[a-z]?$/

/** Glob keys are relative to this file ("../prototypes/…"); normalize them to project paths ("prototypes/…"). */
function byProjectPath<T>(entries: Record<string, T>): Record<string, T> {
   return Object.fromEntries(Object.entries(entries).map(([key, value]) => [key.replace(/^(\.\.\/)+/, ''), value]))
}

const metaFiles = byProjectPath(import.meta.glob<ProtoMeta>('../prototypes/*/meta.json', { eager: true, import: 'default' }))
const briefFiles = byProjectPath(import.meta.glob<string>('../prototypes/*/README.md', { eager: true, query: '?raw', import: 'default' }))
const notesFiles = byProjectPath(import.meta.glob<string>(['../prototypes/*/*/notes.md', '../blueprint/patterns/*/notes.md'], {
   eager: true,
   query: '?raw',
   import: 'default',
}))
const mockFiles = byProjectPath(import.meta.glob<{ scenarios: Scenarios<unknown> }>(['../prototypes/*/*/mocks.ts', '../blueprint/patterns/*/mocks.ts']))
const componentFiles = byProjectPath(import.meta.glob<{ default: Component }>(['../prototypes/*/*/index.vue', '../blueprint/patterns/*/index.vue']))

/** Parses an optional `--- key: value ---` header. The first line of the body becomes the summary. */
export function parseNotes(raw = ''): VersionNotes {
   const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
   const header: Record<string, string> = {}

   if (match) {
      for (const line of match[1].split(/\r?\n/)) {
         const [key, ...rest] = line.split(':')
         if (key && rest.length) header[key.trim()] = rest.join(':').trim()
      }
   }

   const body = (match ? raw.slice(match[0].length) : raw).trim()
   const firstLine = body.split(/\r?\n/).find((line) => line.trim()) ?? ''

   return {
      basedOn: header.based_on && header.based_on !== '—' ? header.based_on : null,
      date: header.date ?? null,
      summary: firstLine.replace(/^#+\s*/, ''),
      body,
   }
}

export function listTasks(): ProtoTask[] {
   const tasks = Object.entries(metaFiles).map(([path, meta]) => {
      const id = path.split('/')[1]
      const versionIds = new Set(
         Object.keys(componentFiles)
            .filter((file) => file.startsWith(`prototypes/${id}/`))
            .map((file) => file.split('/')[2])
            .filter((version) => VERSION_PATTERN.test(version)),
      )

      const versions = [...versionIds].sort().map((version) => ({
         id: version,
         notes: parseNotes(notesFiles[`prototypes/${id}/${version}/notes.md`]),
      }))

      return {
         id,
         meta: { chrome: 'app', ...meta, goodday: meta.goodday ?? null, status: meta.status ?? 'draft' } as ProtoMeta,
         brief: briefFiles[`prototypes/${id}/README.md`] ?? '',
         versions,
      }
   })

   // Most recent first: creation date, then GoodDay number
   return tasks.sort((a, b) => (b.meta.created ?? '').localeCompare(a.meta.created ?? '')
      || (b.meta.goodday?.number ?? 0) - (a.meta.goodday?.number ?? 0))
}

export const STATUS_LABEL: Record<ProtoStatus, string> = { draft: 'Brouillon', review: 'En revue', chosen: 'Retenu', archived: 'Archivé' }
export const STATUS_TONE = { draft: 'neutral', review: 'info', chosen: 'success', archived: 'neutral' } as const

/** The version on screen: the requested one, else the chosen one, else the latest. */
export function currentVersion(task: ProtoTask | undefined, versionId?: string): ProtoVersion | undefined {
   const versions = task?.versions ?? []
   return versions.find((version) => version.id === versionId)
      ?? versions.find((version) => version.id === task?.meta.chosen)
      ?? versions[versions.length - 1]
}

export function getTask(id: string): ProtoTask | undefined {
   return listTasks().find((task) => task.id === id)
}

export function listPatterns(): PatternEntry[] {
   return Object.keys(componentFiles)
      .filter((file) => file.startsWith('blueprint/patterns/'))
      .map((file) => file.split('/')[2])
      .sort()
      .map((id) => ({ id, notes: parseNotes(notesFiles[`blueprint/patterns/${id}/notes.md`]) }))
}

/** Scenario names of a version or pattern (folder path relative to the project root). Loads its mocks.ts. */
export async function loadScenarioNames(folder: string): Promise<string[]> {
   const loader = mockFiles[`${folder}/mocks.ts`]
   return loader ? Object.keys((await loader()).scenarios ?? {}) : []
}

/** Lazy-loads a prototype version or a pattern (folder path relative to the project root). */
export async function loadModule(folder: string): Promise<ProtoModule | null> {
   const loader = componentFiles[`${folder}/index.vue`]
   if (!loader) return null
   const [module, mocks] = await Promise.all([loader(), mockFiles[`${folder}/mocks.ts`]?.()])
   return {
      component: module.default,
      scenarios: mocks?.scenarios ?? { default: () => ({}) },
   }
}
