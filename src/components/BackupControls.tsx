import { useState, useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import { exportAll, importAll, downloadBackup } from '../utils/backupAll'
import { readJSONFile } from '../utils/layoutExportImport'

/**
 * Export-all / import-all backup controls (hortilogic-a0h.4).
 * Rendered in SettingsModal so one browser data-clear is recoverable.
 */
export function BackupControls() {
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    downloadBackup(exportAll())
  }

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    try {
      const result = importAll(await readJSONFile(file))
      if (!result.ok) {
        setError(result.error)
        return
      }
      // Reload so all hooks rehydrate from localStorage (same idiom as Reset All Data)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file')
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-soil-200">
      <h3 className="text-sm font-semibold text-soil-700 mb-2">Backup</h3>
      <p className="text-xs text-soil-600 mb-3">
        Download all layouts, profiles, and stashes as one file, or restore from a backup.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-soil-300 text-soil-700 rounded-md hover:bg-soil-50 focus:outline-none focus:ring-2 focus:ring-leaf-600"
        >
          <Download className="w-4 h-4" />
          Export All Data
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-soil-300 text-soil-700 rounded-md hover:bg-soil-50 focus:outline-none focus:ring-2 focus:ring-leaf-600"
        >
          <Upload className="w-4 h-4" />
          Import All Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(e) => void handleFileSelected(e)}
          className="hidden"
          aria-label="Import backup file"
        />
      </div>
      {error && (
        <p className="text-sm text-red-700 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
