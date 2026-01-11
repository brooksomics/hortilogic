import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BoxActionModal } from './BoxActionModal'

describe('BoxActionModal', () => {
  it('renders add mode correctly', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <BoxActionModal
        isOpen={true}
        mode="add"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    expect(screen.getByText('Add New Bed')).toBeInTheDocument()
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Width/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Height/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })

  it('renders delete mode correctly', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <BoxActionModal
        isOpen={true}
        mode="delete"
        boxName="Herb Box"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    expect(screen.getByText(/Delete Bed/i)).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
    expect(screen.getByText('Herb Box')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })

  it('calls onConfirm with correct data when adding a box', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <BoxActionModal
        isOpen={true}
        mode="add"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    // Fill in the form
    await user.type(screen.getByLabelText(/Name/i), 'Herb Box')
    await user.clear(screen.getByLabelText(/Width/i))
    await user.type(screen.getByLabelText(/Width/i), '2')
    await user.clear(screen.getByLabelText(/Height/i))
    await user.type(screen.getByLabelText(/Height/i), '4')

    // Submit
    await user.click(screen.getByRole('button', { name: /Add/i }))

    expect(onConfirm).toHaveBeenCalledWith({
      name: 'Herb Box',
      width: 2,
      height: 4,
    })
  })

  it('calls onConfirm when confirming delete', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <BoxActionModal
        isOpen={true}
        mode="delete"
        boxName="Herb Box"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    await user.click(screen.getByRole('button', { name: /Delete/i }))

    expect(onConfirm).toHaveBeenCalledWith()
  })

  it('calls onClose when clicking Cancel', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <BoxActionModal
        isOpen={true}
        mode="add"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    await user.click(screen.getByRole('button', { name: /Cancel/i }))

    expect(onClose).toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('validates width and height are positive numbers', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <BoxActionModal
        isOpen={true}
        mode="add"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    // Fill in the form with invalid data
    await user.type(screen.getByLabelText(/Name/i), 'Test Box')
    await user.clear(screen.getByLabelText(/Width/i))
    await user.type(screen.getByLabelText(/Width/i), '0')
    await user.clear(screen.getByLabelText(/Height/i))
    await user.type(screen.getByLabelText(/Height/i), '-1')

    // Submit
    await user.click(screen.getByRole('button', { name: /Add/i }))

    // Should not have called onConfirm with invalid data
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('does not render when isOpen is false', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    const { container } = render(
      <BoxActionModal
        isOpen={false}
        mode="add"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })
})
