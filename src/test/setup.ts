import '@testing-library/jest-dom'

// Node 26 defines an experimental localStorage global that is undefined without
// --localstorage-file, and it shadows jsdom's storage in vitest (window.localStorage
// is also undefined here). Provide a minimal in-memory Storage for tests. Methods
// live on the prototype so vi.spyOn(Storage.prototype, ...) works.
class MemoryStorage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  clear(): void {
    this.store = new Map()
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

const globals: Record<string, unknown> = {
  Storage: MemoryStorage,
  localStorage: new MemoryStorage(),
  sessionStorage: new MemoryStorage(),
}
for (const [name, value] of Object.entries(globals)) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
}
