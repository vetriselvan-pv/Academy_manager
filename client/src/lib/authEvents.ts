type AuthEvent = 'unauthorized'
type Listener = () => void

/**
 * Lets the axios layer (which sits outside React) tell AuthContext to clear
 * session state when a token refresh fails, without a circular import.
 */
function createAuthEventBus() {
  const listeners = new Map<AuthEvent, Set<Listener>>()

  return {
    on(event: AuthEvent, listener: Listener): () => void {
      const set = listeners.get(event) ?? new Set()
      set.add(listener)
      listeners.set(event, set)
      return () => set.delete(listener)
    },
    emit(event: AuthEvent): void {
      listeners.get(event)?.forEach((listener) => listener())
    },
  }
}

export const authEvents = createAuthEventBus()
