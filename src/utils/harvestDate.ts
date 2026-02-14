/**
 * Calculate estimated harvest date from planting date and days to maturity
 * @param plantingDate - The date the crop is planted
 * @param daysToMaturity - Days until harvest (from crop database)
 * @returns Estimated harvest date
 */
export function calculateHarvestDate(
    plantingDate: Date,
    daysToMaturity: number
): Date {
    const harvestDate = new Date(plantingDate)
    harvestDate.setDate(harvestDate.getDate() + daysToMaturity)
    return harvestDate
}

/**
 * Format harvest date for display
 * @param date - The harvest date
 * @returns Formatted string (e.g., "July 15")
 */
export function formatHarvestDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

/**
 * Get days until harvest from today
 * @param harvestDate - The estimated harvest date
 * @param today - Optional specific "today" date (for testing)
 * @returns Number of days (negative if past)
 */
export function getDaysUntilHarvest(harvestDate: Date, today: Date = new Date()): number {
    // Normalize both dates to midnight to avoid time discrepancies
    const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
    const hDate = new Date(harvestDate)
    hDate.setHours(0, 0, 0, 0)

    const now = new Date(today)
    now.setHours(0, 0, 0, 0)

    return Math.round((hDate.getTime() - now.getTime()) / oneDay)
}
