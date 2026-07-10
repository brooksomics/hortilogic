import { useSyncExternalStore } from 'react'

// localStorage is a global singleton, so a failed write anywhere means "storage
// is broken" for the whole app. Rather than thread a callback through every
// hook, the storage hooks report each write's outcome here and components read
// the shared health via useStorageHealth().
let writeFailed = false
const listeners = new Set<() => void>()

/** Called by the storage hooks after each localStorage write attempt. */
export function reportStorageWrite(ok: boolean): void {
  if (writeFailed === !ok) return
  writeFailed = !ok
  listeners.forEach((notify) => {
    notify()
  })
}

function subscribe(notify: () => void): () => void {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}

function getSnapshot(): boolean {
  return writeFailed
}

/** Non-reactive read of storage health (for tests / non-component callers). */
export function getStorageHealth(): boolean {
  return writeFailed
}

/** True when the most recent localStorage write failed (quota exceeded / disabled). */
export function useStorageHealth(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
