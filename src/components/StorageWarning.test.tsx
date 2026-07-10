import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { StorageWarning } from './StorageWarning'
import { reportStorageWrite } from '../hooks/useStorageHealth'

describe('StorageWarning', () => {
  afterEach(() => {
    reportStorageWrite(true)
  })

  it('renders nothing while storage is healthy', () => {
    render(<StorageWarning />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a persistent warning when a write fails and hides it once one succeeds', () => {
    render(<StorageWarning />)

    act(() => {
      reportStorageWrite(false)
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/not being saved/i)

    act(() => {
      reportStorageWrite(true)
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
