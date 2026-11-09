/** Message the prototype frame sends to the shell when [ is pressed inside it. */
export const SIDEBAR_MESSAGE = 'ez-proto:toggle-sidebar'

/** True while typing: the [ key then belongs to the field, not to the shell. */
export function isEditingTarget(target: EventTarget | null): boolean {
   if (!(target instanceof HTMLElement)) return false
   return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}
