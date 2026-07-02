import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BackupControls } from './BackupControls'

function selectFile(contents: string): void {
  const input = screen.getByLabelText(/import backup file/i)
  const file = new File([contents], 'backup.json', { type: 'application/json' })
  fireEvent.change(input, { target: { files: [file] } })
}

const createObjectURL = vi.fn(() => 'blob:mock')

describe('BackupControls', () => {
  beforeEach(() => {
    localStorage.clear()
    createObjectURL.mockClear()
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders export and import buttons', () => {
    render(<BackupControls />)
    expect(screen.getByRole('button', { name: /export all data/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import all data/i })).toBeInTheDocument()
  })

  it('downloads a backup file on export', () => {
    render(<BackupControls />)
    fireEvent.click(screen.getByRole('button', { name: /export all data/i }))
    expect(createObjectURL).toHaveBeenCalledTimes(1)
  })

  it('shows a user-visible error for a malformed backup file', async () => {
    render(<BackupControls />)
    selectFile(JSON.stringify({ version: 99 }))
    await waitFor(() => {
      expect(screen.getByText(/invalid backup file/i)).toBeInTheDocument()
    })
  })

  it('shows a user-visible error for unparseable JSON', async () => {
    render(<BackupControls />)
    selectFile('not json {{{')
    await waitFor(() => {
      expect(screen.getByText(/failed to parse/i)).toBeInTheDocument()
    })
  })

  it('restores a valid backup and reloads the page', async () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })

    render(<BackupControls />)
    selectFile(
      JSON.stringify({
        version: 1,
        exportedAt: '2026-01-01T00:00:00.000Z',
        layouts: null,
        profiles: null,
        stashes: { 'some-layout': { tomato: 2 } },
      })
    )

    await waitFor(() => {
      expect(reload).toHaveBeenCalled()
    })
    expect(localStorage.getItem('hortilogic_stash_some-layout')).toBe(
      JSON.stringify({ tomato: 2 })
    )
  })
})
