import { useContext } from 'react'
import { GardenContext, type GardenContextValue } from '../context/GardenContext'

/**
 * Custom hook to access Garden Context
 * Throws error if used outside GardenProvider
 */
export function useGardenContext(): GardenContextValue {
    const context = useContext(GardenContext)
    if (!context) {
        throw new Error('useGardenContext must be used within GardenProvider')
    }
    return context
}
