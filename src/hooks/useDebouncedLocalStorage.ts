import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Debounced version of useLocalStorage that batches rapid state changes
 * into a single localStorage write after a configurable delay.
 *
 * State updates happen immediately for UI responsiveness, but localStorage
 * writes are debounced to reduce synchronous I/O operations.
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @param validator - Optional function to validate/transform the parsed data
 * @returns [storedValue, setValue, flush] tuple
 *
 * @example
 * const [value, setValue, flush] = useDebouncedLocalStorage('key', 0)
 * setValue(10) // State updates immediately, localStorage writes after 300ms
 * flush() // Force immediate localStorage write
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  delay = 300,
  validator?: (data: unknown) => T | null
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = JSON.parse(item) as unknown

      if (validator) {
        const validated = validator(parsed)
        if (validated !== null) {
          return validated
        }
        console.warn(
          `[useDebouncedLocalStorage] Validation failed for key "${key}", using initial value.`
        )
        return initialValue
      }

      return parsed as T
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentValueRef = useRef<T>(storedValue)

  // Update ref when state changes
  currentValueRef.current = storedValue

  /**
   * Writes current state to localStorage immediately
   */
  const writeToStorage = useCallback(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(currentValueRef.current))
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error)
    }
  }, [key])

  /**
   * Flushes any pending write to localStorage immediately
   * and cancels the debounce timer.
   */
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    writeToStorage()
  }, [writeToStorage])

  /**
   * Sets a new value. State updates immediately for UI,
   * but localStorage write is debounced.
   */
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      // Update state immediately (for UI responsiveness)
      setStoredValue((prev) => {
        return value instanceof Function ? value(prev) : value
      })

      // Clear existing debounce timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Schedule debounced localStorage write
      timeoutRef.current = setTimeout(() => {
        writeToStorage()
        timeoutRef.current = null
      }, delay)
    },
    [delay, writeToStorage]
  )

  // Flush pending writes on unmount to prevent data loss
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        writeToStorage()
      }
    }
  }, [writeToStorage])

  return [storedValue, setValue, flush]
}
