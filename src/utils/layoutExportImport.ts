import type { GardenLayout, GardenProfile, GardenBox } from '../types/garden'
import { generateUUID } from './uuid'

/**
 * Export data format for garden layouts
 * Includes version for future compatibility
 */
export interface ExportedLayout {
  /** Schema version for format evolution */
  version: number

  /** ISO timestamp when layout was exported */
  exportedAt: string

  /** The garden layout data */
  layout: GardenLayout

  /** Optional profile data for portability */
  profile?: GardenProfile
}

/**
 * Validation result for imported layouts
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Result of importing a layout
 */
export interface ImportResult {
  /** Imported layout with new IDs */
  layout: GardenLayout

  /** Imported profile if included in export */
  profile?: GardenProfile
}

/**
 * Export a garden layout to JSON format
 *
 * @param layout - The layout to export
 * @param profile - Optional profile to include for portability
 * @returns Export data object ready for JSON serialization
 */
export function exportLayoutToJSON(
  layout: GardenLayout,
  profile?: GardenProfile
): ExportedLayout {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    layout,
    profile,
  }
}

/**
 * Validate imported layout data
 *
 * @param data - Parsed JSON data from import
 * @returns Validation result with error message if invalid
 */
export function validateImportedLayout(data: unknown): ValidationResult {
  // Type guard to check if data is an object
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Invalid data: must be an object' }
  }

  const obj = data as Record<string, unknown>

  // Check version
  if (typeof obj.version !== 'number') {
    return { valid: false, error: 'Invalid data: missing or invalid version' }
  }

  // Check version compatibility
  if (obj.version !== 1) {
    return {
      valid: false,
      error: `Unsupported version: ${String(obj.version)}. Expected version 1.`,
    }
  }

  // Check layout exists
  if (typeof obj.layout !== 'object' || obj.layout === null) {
    return { valid: false, error: 'Invalid data: missing or invalid layout' }
  }

  const layout = obj.layout as Record<string, unknown>

  // Validate layout required fields
  if (
    typeof layout.id !== 'string' ||
    typeof layout.name !== 'string' ||
    typeof layout.createdAt !== 'string' ||
    typeof layout.updatedAt !== 'string' ||
    typeof layout.profileId !== 'string' ||
    !Array.isArray(layout.boxes)
  ) {
    return { valid: false, error: 'Invalid layout: missing required fields' }
  }

  return { valid: true }
}

/**
 * Import a layout from exported JSON data
 * Generates new IDs to avoid conflicts with existing layouts
 *
 * @param exportData - The exported layout data
 * @param profileId - Profile ID to assign to imported layout
 * @returns Imported layout with new IDs and optional profile
 * @throws Error if data is invalid
 */
export function importLayoutFromJSON(
  exportData: unknown,
  profileId: string
): ImportResult {
  // Validate the data
  const validation = validateImportedLayout(exportData)
  if (!validation.valid) {
    throw new Error(`Import failed: ${validation.error ?? 'Unknown error'}`)
  }

  const data = exportData as ExportedLayout
  const originalLayout = data.layout

  // Generate new IDs for layout and boxes to avoid conflicts
  const importedLayout: GardenLayout = {
    ...originalLayout,
    id: generateUUID(),
    profileId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    boxes: originalLayout.boxes.map((box: GardenBox) => ({
      ...box,
      id: generateUUID(),
      // Deep copy cells array to avoid reference issues
      cells: [...box.cells],
    })),
  }

  return {
    layout: importedLayout,
    profile: data.profile,
  }
}

/**
 * Download exported layout as JSON file
 *
 * @param exportData - The exported layout data
 * @param filename - Filename for the download (default: layout name + timestamp)
 */
export function downloadLayoutAsJSON(
  exportData: ExportedLayout,
  filename?: string
): void {
  const datePart = new Date().toISOString().split('T')[0]
  const defaultFilename = `${exportData.layout.name.replace(/[^a-z0-9]/gi, '_')}_${datePart ?? 'export'}.json`
  const finalFilename = filename ?? defaultFilename

  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  link.click()

  // Clean up
  URL.revokeObjectURL(url)
}

/**
 * Read and parse a JSON file from file input
 *
 * @param file - The file to read
 * @returns Promise resolving to parsed JSON data
 */
export function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const data = JSON.parse(text) as unknown
        resolve(data)
      } catch {
        reject(new Error('Failed to parse JSON file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
