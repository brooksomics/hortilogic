import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { GardenProfile } from '../types/garden'

interface SettingsModalProps {
  isOpen: boolean
  profile: GardenProfile
  onSave: (profile: GardenProfile) => void
  onClose: () => void
}

export function SettingsModal({ isOpen, profile, onSave, onClose }: SettingsModalProps) {
  // Get today's date in ISO format (YYYY-MM-DD)
  const todayISO = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState<GardenProfile>({
    ...profile,
    location: profile.location || '',
    targetPlantingDate: profile.targetPlantingDate || todayISO
  })
  const [errors, setErrors] = useState<string[]>([])
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Update form when profile prop changes
  useEffect(() => {
    setFormData({
      ...profile,
      location: profile.location || '',
      targetPlantingDate: profile.targetPlantingDate || todayISO
    })
    setErrors([])
  }, [profile, isOpen, todayISO])

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const validate = (): boolean => {
    const newErrors: string[] = []

    // Validate dates
    const lastFrost = new Date(formData.last_frost_date)
    const firstFrost = new Date(formData.first_frost_date)

    if (lastFrost >= firstFrost) {
      newErrors.push('Last frost date must be before first frost date')
    }

    // Validate season extension
    if (formData.season_extension_weeks < 0 || formData.season_extension_weeks > 8) {
      newErrors.push('Season extension must be between 0 and 8 weeks')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  const handleResetData = () => {
    // Clear all localStorage
    localStorage.clear()
    // Reload the page to reinitialize with defaults
    window.location.reload()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 id="settings-title" className="text-2xl font-bold mb-4 text-soil-900">
          Garden Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Garden Name */}
          <div>
            <label htmlFor="garden-name" className="block text-sm font-medium text-soil-700 mb-1">
              Garden Name
            </label>
            <input
              id="garden-name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
              }}
              className="w-full px-3 py-2 border border-soil-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leaf-600"
              required
            />
          </div>

          {/* Hardiness Zone */}
          <div>
            <label htmlFor="hardiness-zone" className="block text-sm font-medium text-soil-700 mb-1">
              Hardiness Zone
            </label>
            <input
              id="hardiness-zone"
              type="text"
              value={formData.hardiness_zone}
              onChange={(e) => {
                setFormData({ ...formData, hardiness_zone: e.target.value })
              }}
              className="w-full px-3 py-2 border border-soil-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leaf-600"
              placeholder="e.g., 5b, 10a"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-soil-700 mb-1">
              Location (optional)
            </label>
            <input
              id="location"
              type="text"
              value={formData.location || ''}
              onChange={(e) => {
                setFormData({ ...formData, location: e.target.value })
              }}
              className="w-full px-3 py-2 border border-soil-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leaf-600"
              placeholder="e.g., Denver, CO"
            />
          </div>

          {/* Last Frost Date */}
          <div>
            <label htmlFor="last-frost-date" className="block text-sm font-medium text-soil-700 mb-1">
              Last Frost Date (Spring)
            </label>
            <input
              id="last-frost-date"
              type="date"
              value={formData.last_frost_date}
              onChange={(e) => {
                setFormData({ ...formData, last_frost_date: e.target.value })
              }}
              className="w-full px-3 py-2 border border-soil-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leaf-600"
              required
            />
          </div>

          {/* First Frost Date */}
          <div>
            <label htmlFor="first-frost-date" className="block text-sm font-medium text-soil-700 mb-1">
              First Frost Date (Fall)
            </label>
            <input
              id="first-frost-date"
              type="date"
              value={formData.first_frost_date}
              onChange={(e) => {
                setFormData({ ...formData, first_frost_date: e.target.value })
              }}
              className="w-full px-3 py-2 border border-soil-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leaf-600"
              required
            />
          </div>

          {/* Season Extension */}
          <div>
            <label htmlFor="season-extension" className="block text-sm font-medium text-soil-700 mb-1">
              Season Extension (weeks)
            </label>
            <input
              id="season-extension"
              type="number"
              value={formData.season_extension_weeks}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10)
                setFormData({ ...formData, season_extension_weeks: isNaN(value) ? 0 : value })
              }}
              className="w-full px-3 py-2 border border-soil-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leaf-600"
              required
            />
            <p className="text-xs text-soil-600 mt-1">
              Use hoop houses or row covers? Add 0-8 weeks to your growing season.
            </p>
          </div>

          {/* Target Planting Date */}
          <div>
            <label htmlFor="target-planting-date" className="block text-sm font-medium text-soil-700 mb-1">
              Target Planting Date
            </label>
            <input
              id="target-planting-date"
              type="date"
              value={formData.targetPlantingDate || todayISO}
              onChange={(e) => {
                setFormData({ ...formData, targetPlantingDate: e.target.value })
              }}
              className="w-full px-3 py-2 border border-soil-300 rounded-md focus:outline-none focus:ring-2 focus:ring-leaf-600"
              required
            />
            <p className="text-xs text-soil-600 mt-1">
              Show which crops are plantable on this date.
            </p>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              {errors.map((error, idx) => (
                <p key={idx} className="text-sm text-red-700">
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-soil-300 rounded-md text-soil-700 hover:bg-soil-50 focus:outline-none focus:ring-2 focus:ring-leaf-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-leaf-600 text-white rounded-md hover:bg-leaf-700 focus:outline-none focus:ring-2 focus:ring-leaf-600"
            >
              Save
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-6 pt-6 border-t border-soil-200">
          <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h3>
          <p className="text-xs text-soil-600 mb-3">
            Reset all data including gardens, layouts, and settings. This cannot be undone.
          </p>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => {
                setShowResetConfirm(true)
              }}
              className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reset All Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-700 font-medium">Are you sure?</span>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false)
                }}
                className="px-3 py-1.5 text-sm border border-soil-300 text-soil-700 rounded-md hover:bg-soil-50 focus:outline-none focus:ring-2 focus:ring-soil-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
