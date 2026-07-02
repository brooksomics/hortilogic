import { AlertTriangle } from 'lucide-react'
import { useStorageHealth } from '../hooks/useStorageHealth'

/**
 * Persistent warning shown when localStorage writes are failing (quota
 * exceeded or storage disabled). Without it, the user keeps planting crops
 * that silently never save.
 */
export function StorageWarning() {
  const writeFailed = useStorageHealth()
  if (!writeFailed) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
    >
      <AlertTriangle size={18} aria-hidden="true" />
      <span className="text-sm font-medium">
        Changes are not being saved. Your browser storage is full or disabled.
      </span>
    </div>
  )
}
