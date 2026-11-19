/**
 * Passthrough stub for production's `$gettext`.
 * Keeps mockup code shaped like production: `$gettext('Envoyer à %{name}', { name })`.
 */
export function gettext(message: string, params?: Record<string, string | number>): string {
   if (!params) return message
   return message.replace(/%\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `%{${key}}`))
}
