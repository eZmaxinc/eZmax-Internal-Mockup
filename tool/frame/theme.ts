/** Light / dark theme of the prototype frame. Dark = the class Quasar's Dark plugin puts on <body>. */
export type FrameTheme = 'light' | 'dark'

export const DARK_CLASS = 'body--dark'

export function applyTheme(theme: FrameTheme) {
   document.body.classList.toggle(DARK_CLASS, theme === 'dark')
}

export function parseTheme(value: string | null): FrameTheme {
   return value === 'dark' ? 'dark' : 'light'
}
