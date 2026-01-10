import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { Crop, GardenProfile } from '@/types'
import { isCropViable } from './dateEngine'

/**
 * Viability status for a crop
 */
export type ViabilityStatus = 'viable' | 'marginal' | 'not-viable'

/**
 * Styles and metadata for displaying crop viability
 */
export interface ViabilityStyles {
  className: string
  icon: typeof CheckCircle2
  label: string
}

/**
 * Determine the viability status of a crop for a given profile and date
 *
 * @param crop - The crop to check
 * @param profile - The garden profile with frost dates
 * @param targetDate - The target planting date
 * @returns Viability status: 'viable', 'marginal', or 'not-viable'
 */
export function getCropViabilityStatus(
  crop: Crop,
  profile: GardenProfile,
  targetDate: Date
): ViabilityStatus {
  // Check if viable with current season extension
  if (isCropViable(crop, profile, targetDate)) {
    return 'viable'
  }

  // Check if would be viable with maximum season extension (8 weeks)
  const profileWithMaxExtension: GardenProfile = {
    ...profile,
    season_extension_weeks: 8,
  }

  if (isCropViable(crop, profileWithMaxExtension, targetDate)) {
    return 'marginal'
  }

  return 'not-viable'
}

/**
 * Get display styles for a viability status
 *
 * @param status - The viability status
 * @returns Object containing className, icon component, and label
 */
export function getViabilityStyles(status: ViabilityStatus): ViabilityStyles {
  switch (status) {
    case 'viable':
      return {
        className: 'border-green-500 bg-green-50',
        icon: CheckCircle2,
        label: 'Plantable now',
      }
    case 'marginal':
      return {
        className: 'border-orange-400 bg-orange-50',
        icon: AlertTriangle,
        label: 'Marginal (season extension needed)',
      }
    case 'not-viable':
      return {
        className: 'border-gray-300 bg-gray-50 opacity-60',
        icon: XCircle,
        label: 'Out of season',
      }
  }
}
