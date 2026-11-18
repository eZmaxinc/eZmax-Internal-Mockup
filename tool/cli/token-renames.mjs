/**
 * Token renames between ez-tokens versions: old name → new name (null = removed, see the message).
 * Used by `mockup check` (catches old names in prototypes and components: Tailwind would silently
 * generate nothing for them) and by `mockup tokens migrate` (rewrites them).
 * Names are the part after --color- (and after bg-, text-, border-… in utilities).
 */
export const TOKEN_RENAMES = {
   '1.0.0': {
      'canvas': 'background',
      'surface-sunken': 'surface-muted',
      'surface-hover': null,
      'surface-selected': 'accent-subtle',
      'chrome': 'surface-inverse',
      'fg': 'foreground',
      'fg-muted': 'foreground-muted',
      'fg-subtle': 'foreground-subtle',
      'fg-inverse': 'foreground-inverse',
      'fg-link': 'accent',
      'line': 'border',
      'line-subtle': 'border-subtle',
      'line-strong': 'border-strong',
      'action': 'accent',
      'action-hover': null,
      'action-subtle': 'accent-subtle',
      'action-on': 'accent-foreground',
      'success': 'positive',
      'success-subtle': 'positive-subtle',
      'success-strong': 'positive-strong',
      'danger': 'negative',
      'danger-subtle': 'negative-subtle',
      'danger-strong': 'negative-strong',
   },
   // One meaning per modifier: a tinted fill is a surface, the text on it a foreground; -subtle and -strong stay emphasis only.
   '2.0.0': {
      'accent-subtle': 'surface-accent',
      'positive-subtle': 'surface-positive',
      'positive-strong': 'foreground-positive',
      'negative-subtle': 'surface-negative',
      'negative-strong': 'foreground-negative',
      'warning-subtle': 'surface-warning',
      'warning-strong': 'foreground-warning',
      'info-subtle': 'surface-info',
      'info-strong': 'foreground-info',
      'border-subtle': 'border-muted',
      'focus': 'accent',
   },
}

export const REMOVED_HINTS = {
   'surface-hover': 'les états ne sont pas des tokens: color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface))',
   'action-hover': 'les états ne sont pas des tokens: color-mix(in srgb, var(--color-accent) 85%, var(--color-foreground))',
}

/** All renames, flattened (old → newest name): a name renamed twice goes straight to its latest name. */
export const ALL_RENAMES = Object.assign({}, ...Object.values(TOKEN_RENAMES))
for (const old of Object.keys(ALL_RENAMES)) {
   while (ALL_RENAMES[old] && ALL_RENAMES[old] in ALL_RENAMES) ALL_RENAMES[old] = ALL_RENAMES[ALL_RENAMES[old]]
}

const UTILITY_PREFIXES = 'bg|text|border|border-[trblxy]|ring|ring-offset|outline|fill|stroke|divide|decoration|placeholder|caret|from|via|to|shadow'

/**
 * Regex matching an old token name in a var(--color-…) or a utility class (bg-…, text-…).
 * Group 1 = prefix, group 2 = old name.
 */
export function renamePattern(names = Object.keys(ALL_RENAMES)) {
   const sorted = [...names].sort((a, b) => b.length - a.length)
   return new RegExp(`(--color-|\\b(?:${UTILITY_PREFIXES})-)(${sorted.join('|')})(?![\\w-])`, 'g')
}

/** Rewrites old names to new ones. Removed tokens in var() get their color-mix() replacement. */
export function migrate(source) {
   return source
      .replace(/var\(--color-surface-hover\)/g, 'color-mix(in srgb, var(--color-foreground) 4%, var(--color-surface))')
      .replace(/var\(--color-action-hover\)/g, 'color-mix(in srgb, var(--color-accent) 85%, var(--color-foreground))')
      .replace(renamePattern(Object.keys(ALL_RENAMES).filter((name) => ALL_RENAMES[name])), (match, prefix, name) => prefix + ALL_RENAMES[name])
}
