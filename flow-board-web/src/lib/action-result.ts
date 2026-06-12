// Einheitliches typisiertes Result fuer Server Actions (rules/code-conventions.md).
export type ActionResult<T = void> = { data: T } | { error: string }

// Kapselt eine Action: unerwartete Exceptions werden zu einem generischen,
// Client-sicheren Fehler-Result (keine Internals nach aussen). Technische
// Details landen im Server-Log.
export async function safeAction<T>(
  fn: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await fn()
  } catch (err) {
    console.error('[action] unerwarteter Fehler:', err)
    return { error: 'Unerwarteter Fehler. Bitte erneut versuchen.' }
  }
}
