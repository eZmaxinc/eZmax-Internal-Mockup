import { inject, onBeforeUnmount, type InjectionKey } from 'vue'

/** What ez-app-shell shares with the prototype inside it. */
export interface AppShellContext {
   setWithSkeleton: (value: boolean | null) => void
}

export const appShellKey: InjectionKey<AppShellContext> = Symbol('ez-app-shell')

/** Configures the surrounding ez-app-shell from inside a prototype version, and resets on unmount. */
export function useAppShell(options: { withSkeleton?: boolean } = {}): void {
   const context = inject(appShellKey, null)
   if (!context) return
   if (options.withSkeleton !== undefined) {
      context.setWithSkeleton(options.withSkeleton)
      onBeforeUnmount(() => context.setWithSkeleton(null))
   }
}
