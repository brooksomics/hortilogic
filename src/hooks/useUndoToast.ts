import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { GardenBox, GardenStash, GardenLayout } from '../types/garden'

export type UndoSnapshot =
  | {
      type: 'boxes'
      label: string
      boxes: GardenBox[]
      stash?: GardenStash
      timestamp: number
    }
  | {
      type: 'stash'
      label: string
      stash: GardenStash
      timestamp: number
    }
  | {
      type: 'layout'
      label: string
      layout: GardenLayout
      layoutId: string
      timestamp: number
    }

export interface UndoToastHook {
  snapshot: UndoSnapshot | null
  isVisible: boolean
  capture: (snapshot: Omit<UndoSnapshot, 'timestamp'>) => void
  executeUndo: () => void
  dismiss: () => void
  pause: () => void
  resume: () => void
}

const AUTO_DISMISS_MS = 8000

export function useUndoToast(
  restoreBoxes: (boxes: GardenBox[]) => void,
  restoreStash: (stash: GardenStash) => void,
  restoreLayout: (layout: GardenLayout, layoutId: string) => void
): UndoToastHook {
  const [snapshot, setSnapshot] = useState<UndoSnapshot | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const remainingTimeRef = useRef<number>(AUTO_DISMISS_MS)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    startTimeRef.current = Date.now()
    timerRef.current = window.setTimeout(() => {
      setIsVisible(false)
      remainingTimeRef.current = AUTO_DISMISS_MS
    }, remainingTimeRef.current)
  }, [clearTimer])

  const capture = useCallback(
    (snapshotData: Omit<UndoSnapshot, 'timestamp'>) => {
      clearTimer()
      const newSnapshot = {
        ...snapshotData,
        timestamp: Date.now(),
      } as UndoSnapshot
      setSnapshot(newSnapshot)
      setIsVisible(true)
      remainingTimeRef.current = AUTO_DISMISS_MS
      startTimer()
    },
    [clearTimer, startTimer]
  )

  const executeUndo = useCallback(() => {
    if (!snapshot) return

    clearTimer()

    if (snapshot.type === 'boxes') {
      restoreBoxes(snapshot.boxes)
      if (snapshot.stash) {
        restoreStash(snapshot.stash)
      }
    } else if (snapshot.type === 'stash') {
      restoreStash(snapshot.stash)
    } else if (snapshot.type === 'layout') {
      restoreLayout(snapshot.layout, snapshot.layoutId)
    }

    setIsVisible(false)
    setSnapshot(null)
    remainingTimeRef.current = AUTO_DISMISS_MS
  }, [snapshot, clearTimer, restoreBoxes, restoreStash, restoreLayout])

  const dismiss = useCallback(() => {
    clearTimer()
    setIsVisible(false)
    remainingTimeRef.current = AUTO_DISMISS_MS
    // Don't clear snapshot immediately to allow for animation
  }, [clearTimer])

  const pause = useCallback(() => {
    if (timerRef.current === null) return
    clearTimer()
    const elapsed = Date.now() - startTimeRef.current
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
  }, [clearTimer])

  const resume = useCallback(() => {
    if (isVisible && snapshot && timerRef.current === null) {
      startTimer()
    }
  }, [isVisible, snapshot, startTimer])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  return useMemo(
    () => ({
      snapshot,
      isVisible,
      capture,
      executeUndo,
      dismiss,
      pause,
      resume,
    }),
    [snapshot, isVisible, capture, executeUndo, dismiss, pause, resume]
  )
}
