/**
 * Generates a cryptographically secure UUID v4
 * Falls back to Math.random() for older browsers
 */
export function generateUUID(): string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
