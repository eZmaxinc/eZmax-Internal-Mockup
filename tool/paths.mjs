/**
 * Single source for the project layout, shared by Vite (tool/vite.config.ts) and the CLI (tool/cli).
 *   blueprint/   the UI blueprint: tokens, ez- components, patterns, brand, shared mocks
 *   mockups/  the team's work: one folder per GoodDay task
 *   tool/        the shell, the frame and the CLI
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const TOOL = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(TOOL, '..')
export const BLUEPRINT = join(ROOT, 'blueprint')
export const MOCKUPS = join(ROOT, 'mockups')
export const PATTERNS = join(BLUEPRINT, 'patterns')
export const TEMPLATES = join(TOOL, 'cli', 'templates')

export const aliases = {
   '@ez': join(BLUEPRINT, 'ez'),
   '@mocks': join(BLUEPRINT, 'mocks'),
   '@blueprint': BLUEPRINT,
   '@': TOOL,
}

/** The shell's port. Fixed on purpose (strictPort): a second `yarn dev` fails instead of quietly taking 5181. */
export const DEV_PORT = Number(process.env.MOCKUP_PORT) || 5180
