import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLayoutActions } from './useLayoutActions'
import type { GardenLayout } from '../types/garden'

describe('useLayoutActions', () => {
  const layout: GardenLayout = {
    id: 'layout-1',
    name: 'Spring Bed',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    profileId: 'profile-1',
    boxes: [],
  }

  let manager: {
    layouts: Record<string, GardenLayout>
    createLayout: ReturnType<typeof vi.fn>
    renameLayout: ReturnType<typeof vi.fn>
    deleteLayout: ReturnType<typeof vi.fn>
    duplicateLayout: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    manager = {
      layouts: { 'layout-1': layout },
      createLayout: vi.fn(),
      renameLayout: vi.fn(),
      deleteLayout: vi.fn(),
      duplicateLayout: vi.fn(),
    }
  })

  const render = () => renderHook(() => useLayoutActions(manager))

  it('starts with no modal open and no target', () => {
    const { result } = render()
    expect(result.current.layoutModalMode).toBeNull()
    expect(result.current.targetLayoutId).toBeNull()
  })

  it('create flow: opens modal, confirm calls createLayout and resets', () => {
    const { result } = render()

    act(() => { result.current.handleCreateLayout() })
    expect(result.current.layoutModalMode).toBe('create')

    act(() => { result.current.handleLayoutModalConfirm('New Bed') })
    expect(manager.createLayout).toHaveBeenCalledWith('New Bed')
    expect(result.current.layoutModalMode).toBeNull()
    expect(result.current.targetLayoutId).toBeNull()
  })

  it('rename flow: sets target, confirm calls renameLayout with target id', () => {
    const { result } = render()

    act(() => { result.current.handleRenameLayout('layout-1') })
    expect(result.current.layoutModalMode).toBe('rename')
    expect(result.current.targetLayoutId).toBe('layout-1')

    act(() => { result.current.handleLayoutModalConfirm('Renamed') })
    expect(manager.renameLayout).toHaveBeenCalledWith('layout-1', 'Renamed')
    expect(result.current.layoutModalMode).toBeNull()
  })

  it('delete flow: sets target, confirm calls deleteLayout', () => {
    const { result } = render()

    act(() => { result.current.handleDeleteLayout('layout-1') })
    expect(result.current.layoutModalMode).toBe('delete')
    expect(result.current.targetLayoutId).toBe('layout-1')

    act(() => { result.current.handleLayoutModalConfirm('ignored') })
    expect(manager.deleteLayout).toHaveBeenCalledWith('layout-1')
  })

  it('duplicate calls duplicateLayout with "(Copy)" suffix, no modal', () => {
    const { result } = render()

    act(() => { result.current.handleDuplicateLayout('layout-1') })
    expect(manager.duplicateLayout).toHaveBeenCalledWith('layout-1', 'Spring Bed (Copy)')
    expect(result.current.layoutModalMode).toBeNull()
  })

  it('duplicate of unknown layout id is a no-op', () => {
    const { result } = render()

    act(() => { result.current.handleDuplicateLayout('missing') })
    expect(manager.duplicateLayout).not.toHaveBeenCalled()
  })

  it('confirm with no mode open calls nothing', () => {
    const { result } = render()

    act(() => { result.current.handleLayoutModalConfirm('x') })
    expect(manager.createLayout).not.toHaveBeenCalled()
    expect(manager.renameLayout).not.toHaveBeenCalled()
    expect(manager.deleteLayout).not.toHaveBeenCalled()
  })

  it('close resets modal state without invoking manager', () => {
    const { result } = render()

    act(() => { result.current.handleRenameLayout('layout-1') })
    act(() => { result.current.handleLayoutModalClose() })

    expect(result.current.layoutModalMode).toBeNull()
    expect(result.current.targetLayoutId).toBeNull()
    expect(manager.renameLayout).not.toHaveBeenCalled()
  })
})
