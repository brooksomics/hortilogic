import { describe, it, expect } from 'vitest'
import { calculateHarvestDate, formatHarvestDate, getDaysUntilHarvest } from './harvestDate'

describe('harvestDate utils', () => {
    describe('calculateHarvestDate', () => {
        it('adds days to maturity to planting date', () => {
            const plantingDate = new Date('2024-04-01')
            const daysToMaturity = 60
            const expected = new Date('2024-05-31')

            const result = calculateHarvestDate(plantingDate, daysToMaturity)
            // Compare timestamps or formatted strings to avoid timezone issues with plain retrieval
            expect(result.getFullYear()).toBe(expected.getFullYear())
            expect(result.getMonth()).toBe(expected.getMonth())
            expect(result.getDate()).toBe(expected.getDate())
        })
    })

    describe('formatHarvestDate', () => {
        it('formats date as Month Day', () => {
            const date = new Date('2024-07-15T12:00:00')
            expect(formatHarvestDate(date)).toBe('July 15')
        })
    })

    describe('getDaysUntilHarvest', () => {
        it('calculates days remaining correctly', () => {
            const today = new Date('2024-06-01')
            const harvestDate = new Date('2024-06-11')

            expect(getDaysUntilHarvest(harvestDate, today)).toBe(10)
        })

        it('returns negative days for past dates', () => {
            const today = new Date('2024-06-15')
            const harvestDate = new Date('2024-06-10')

            expect(getDaysUntilHarvest(harvestDate, today)).toBe(-5)
        })

        it('returns 0 for today', () => {
            const today = new Date('2024-06-01')
            const harvestDate = new Date('2024-06-01')

            expect(getDaysUntilHarvest(harvestDate, today)).toBe(0)
        })
    })
})
