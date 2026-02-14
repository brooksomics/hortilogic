import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UndoToast } from './UndoToast'

describe('UndoToast', () => {
  it('should not render when not visible', () => {
    const { container } = render(
      <UndoToast
        isVisible={false}
        label="Test Action"
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
        onMouseEnter={vi.fn()}
        onMouseLeave={vi.fn()}
      />
    )

    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument()
  })

  it('should render when visible', () => {
    render(
      <UndoToast
        isVisible={true}
        label="Cleared all crops"
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
        onMouseEnter={vi.fn()}
        onMouseLeave={vi.fn()}
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Cleared all crops')).toBeInTheDocument()
  })

  it('should call onUndo when Undo button is clicked', async () => {
    const onUndo = vi.fn()
    const user = userEvent.setup()

    render(
      <UndoToast
        isVisible={true}
        label="Test Action"
        onUndo={onUndo}
        onDismiss={vi.fn()}
        onMouseEnter={vi.fn()}
        onMouseLeave={vi.fn()}
      />
    )

    const undoButton = screen.getByRole('button', { name: /undo/i })
    await user.click(undoButton)

    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('should call onDismiss when dismiss button is clicked', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()

    render(
      <UndoToast
        isVisible={true}
        label="Test Action"
        onUndo={vi.fn()}
        onDismiss={onDismiss}
        onMouseEnter={vi.fn()}
        onMouseLeave={vi.fn()}
      />
    )

    const dismissButton = screen.getByRole('button', { name: /close/i })
    await user.click(dismissButton)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('should call onMouseEnter when hovered', async () => {
    const onMouseEnter = vi.fn()
    const user = userEvent.setup()

    render(
      <UndoToast
        isVisible={true}
        label="Test Action"
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
        onMouseEnter={onMouseEnter}
        onMouseLeave={vi.fn()}
      />
    )

    const toast = screen.getByRole('alert')
    await user.hover(toast)

    expect(onMouseEnter).toHaveBeenCalled()
  })

  it('should call onMouseLeave when unhovered', async () => {
    const onMouseLeave = vi.fn()
    const user = userEvent.setup()

    render(
      <UndoToast
        isVisible={true}
        label="Test Action"
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
        onMouseEnter={vi.fn()}
        onMouseLeave={onMouseLeave}
      />
    )

    const toast = screen.getByRole('alert')
    await user.hover(toast)
    await user.unhover(toast)

    expect(onMouseLeave).toHaveBeenCalled()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <UndoToast
        isVisible={true}
        label="Test Action"
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
        onMouseEnter={vi.fn()}
        onMouseLeave={vi.fn()}
      />
    )

    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'polite')
  })

  it('should render undo icon', () => {
    render(
      <UndoToast
        isVisible={true}
        label="Test Action"
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
        onMouseEnter={vi.fn()}
        onMouseLeave={vi.fn()}
      />
    )

    const undoButton = screen.getByRole('button', { name: /undo/i })
    expect(undoButton).toBeInTheDocument()
  })

  it('should render dismiss icon', () => {
    render(
      <UndoToast
        isVisible={true}
        label="Test Action"
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
        onMouseEnter={vi.fn()}
        onMouseLeave={vi.fn()}
      />
    )

    const dismissButton = screen.getByRole('button', { name: /close/i })
    expect(dismissButton).toBeInTheDocument()
  })
})
