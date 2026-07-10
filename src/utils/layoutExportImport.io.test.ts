import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportLayoutToJSON, downloadLayoutAsJSON, readJSONFile } from './layoutExportImport'
import type { GardenLayout, Crop } from '../types/garden'

const layout: GardenLayout = {
  id: 'layout-123',
  name: 'Spring 2026!',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
  profileId: 'profile-123',
  boxes: [
    { id: 'box-1', name: 'Main Bed', width: 2, height: 2, cells: Array(4).fill(null) as (Crop | null)[] },
  ],
}

describe('downloadLayoutAsJSON', () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>
  let clickedDownloads: string[]

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:mock-url')
    revokeObjectURL = vi.fn()
    // jsdom does not implement object URLs
    URL.createObjectURL = createObjectURL as typeof URL.createObjectURL
    URL.revokeObjectURL = revokeObjectURL as typeof URL.revokeObjectURL

    clickedDownloads = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clickedDownloads.push(this.download)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a blob URL, clicks a download link, and revokes the URL', () => {
    downloadLayoutAsJSON(exportLayoutToJSON(layout))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickedDownloads).toHaveLength(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('derives a sanitized default filename from layout name and date', () => {
    downloadLayoutAsJSON(exportLayoutToJSON(layout))

    // non-alphanumerics become underscores, suffixed with YYYY-MM-DD
    expect(clickedDownloads[0]).toMatch(/^Spring_2026__\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('uses the provided filename when given', () => {
    downloadLayoutAsJSON(exportLayoutToJSON(layout), 'custom.json')

    expect(clickedDownloads[0]).toBe('custom.json')
  })
})

describe('readJSONFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves with parsed JSON for a valid file', async () => {
    const file = new File([JSON.stringify({ version: 1 })], 'layout.json', { type: 'application/json' })

    await expect(readJSONFile(file)).resolves.toEqual({ version: 1 })
  })

  it('rejects when the file is not valid JSON', async () => {
    const file = new File(['{not json'], 'bad.json', { type: 'application/json' })

    await expect(readJSONFile(file)).rejects.toThrow('Failed to parse JSON file')
  })

  it('rejects when the file cannot be read', async () => {
    class FailingReader {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      readAsText(): void {
        queueMicrotask(() => this.onerror?.())
      }
    }
    vi.stubGlobal('FileReader', FailingReader)

    const file = new File(['{}'], 'unreadable.json', { type: 'application/json' })
    await expect(readJSONFile(file)).rejects.toThrow('Failed to read file')
  })
})
