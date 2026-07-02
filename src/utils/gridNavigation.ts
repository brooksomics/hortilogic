/**
 * Roving-tabindex keyboard navigation for a fixed-width grid of cells.
 * Returns the target cell index for an arrow/Home/End key, or null when the
 * key doesn't move focus (unhandled key, or a move that would leave the grid).
 */
export function nextGridIndex(
  key: string,
  index: number,
  width: number,
  total: number
): number | null {
  const col = index % width
  const rowStart = index - col
  switch (key) {
    case 'ArrowRight':
      return col < width - 1 && index + 1 < total ? index + 1 : null
    case 'ArrowLeft':
      return col > 0 ? index - 1 : null
    case 'ArrowDown':
      return index + width < total ? index + width : null
    case 'ArrowUp':
      return index - width >= 0 ? index - width : null
    case 'Home':
      return rowStart
    case 'End':
      return Math.min(rowStart + width - 1, total - 1)
    default:
      return null
  }
}
