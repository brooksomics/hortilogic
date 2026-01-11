import { useState, useEffect } from 'react'

/**
 * Custom hook for managing state synchronized with localStorage
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @param validator - Optional function to validate/transform the parsed data
 * @returns [storedValue, setValue] tuple similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (data: unknown) => T | null
): [T, (value: T | ((val: T) => T)) => void] {
  // Get initial value from localStorage or use provided initialValue
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
        console.warn(`[useLocalStorage] Validation failed for key "${key}", using initial value.`)
        return initialValue
      }

      return parsed as T
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when storedValue changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
