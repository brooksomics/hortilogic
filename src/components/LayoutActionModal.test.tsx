import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LayoutActionModal } from './LayoutActionModal'

describe('LayoutActionModal', () => {
  const mockOnConfirm = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create mode', () => {
    it('renders create modal when mode is "create"', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="create"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Create New Layout')).toBeInTheDocument()
      expect(screen.getByLabelText('Layout Name')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('calls onConfirm with layout name when create form submitted', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="create"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      const input = screen.getByLabelText('Layout Name')
      const createButton = screen.getByRole('button', { name: /create/i })

      fireEvent.change(input, { target: { value: 'Spring 2026' } })
      fireEvent.click(createButton)

      expect(mockOnConfirm).toHaveBeenCalledWith('Spring 2026')
    })

    it('does not allow submitting empty layout name', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="create"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      const createButton = screen.getByRole('button', { name: /create/i })
      fireEvent.click(createButton)

      expect(mockOnConfirm).not.toHaveBeenCalled()
      expect(screen.getByText('Layout name cannot be empty')).toBeInTheDocument()
    })
  })

  describe('Rename mode', () => {
    it('renders rename modal with pre-filled current name', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="rename"
          currentName="My Garden"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Rename Layout')).toBeInTheDocument()
      const input = screen.getByLabelText('Layout Name')
      expect(input).toHaveValue('My Garden')
      expect(screen.getByRole('button', { name: /rename/i })).toBeInTheDocument()
    })

    it('calls onConfirm with new layout name when rename form submitted', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="rename"
          currentName="My Garden"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      const input = screen.getByLabelText('Layout Name')
      const renameButton = screen.getByRole('button', { name: /rename/i })

      fireEvent.change(input, { target: { value: 'Updated Garden' } })
      fireEvent.click(renameButton)

      expect(mockOnConfirm).toHaveBeenCalledWith('Updated Garden')
    })
  })

  describe('Delete mode', () => {
    it('renders delete confirmation modal', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="delete"
          currentName="My Garden"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('Delete Layout')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
      expect(screen.getByText('My Garden')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('calls onConfirm when delete confirmed', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="delete"
          currentName="My Garden"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      expect(mockOnConfirm).toHaveBeenCalledWith('')
    })
  })

  describe('Common behavior', () => {
    it('does not render when isOpen is false', () => {
      const { container } = render(
        <LayoutActionModal
          isOpen={false}
          mode="create"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('calls onClose when cancel button clicked', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="create"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls onClose when Escape key pressed', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="create"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('trims whitespace from layout name', () => {
      render(
        <LayoutActionModal
          isOpen={true}
          mode="create"
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      )

      const input = screen.getByLabelText('Layout Name')
      const createButton = screen.getByRole('button', { name: /create/i })

      fireEvent.change(input, { target: { value: '  Spring 2026  ' } })
      fireEvent.click(createButton)

      expect(mockOnConfirm).toHaveBeenCalledWith('Spring 2026')
    })
  })
})
