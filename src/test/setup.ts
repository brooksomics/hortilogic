import '@testing-library/jest-dom'
import { JSDOM } from 'jsdom'

// Node >=22 defines an experimental localStorage global (undefined without
// --localstorage-file). vitest 2.x skips copying jsdom's storage onto the
// test global because the key already exists, leaving localStorage undefined.
// Borrow spec-compliant Storage objects from a throwaway JSDOM window.
const { window: storageWindow } = new JSDOM('', { url: 'http://localhost' })
// Storage too, so vi.spyOn(Storage.prototype, ...) hits the same realm.
for (const key of ['localStorage', 'sessionStorage', 'Storage'] as const) {
  Object.defineProperty(globalThis, key, {
    value: storageWindow[key],
    configurable: true,
    writable: true,
  })
}
