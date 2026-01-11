import { Trash2, Sprout, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Crop, GardenStash } from '../types/garden'
import { useState } from 'react'

export interface PlacementSummary {
    placed: number
    failed: Array<{ cropId: string; reason: string }>
}

export interface StashSummaryProps {
    stash: GardenStash
    crops: Crop[]
    totalArea: number
    maxArea: number
    onClear: () => void
    onRemoveItem: (id: string) => void
    onDistribute: (fillGaps: boolean) => void
    placementResult: PlacementSummary | null
    isDistributing?: boolean
    onUndo?: () => void
    canUndo?: boolean
}

/**
 * Stash Summary Component
 * Displays the current crops in the planning stash and total area usage
 */
export function StashSummary({
    stash,
    crops,
    totalArea,
    maxArea,
    onClear,
    onRemoveItem,
    onDistribute,
    placementResult,
    isDistributing = false,
    onUndo,
    canUndo = false
}: StashSummaryProps) {
    const isOverLimit = totalArea > maxArea

    const [fillGaps, setFillGaps] = useState(false)
    const entries = Object.entries(stash)

    // If stash is empty and no result to show, hide component
    if (entries.length === 0 && !placementResult) return null

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-stone-800 flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-emerald-600" />
                    Garden Stash
                </h3>

                <div className="flex gap-2">
                    {canUndo && onUndo && (
                        <button
                            onClick={onUndo}
                            className="text-stone-500 hover:text-stone-700 text-sm px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 transition-colors"
                        >
                            Undo
                        </button>
                    )}
                    <button
                        onClick={onClear}
                        disabled={Object.keys(stash).length === 0 || isDistributing}
                        className="text-red-500 hover:text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <Trash2 className="w-3 h-3" />
                        Clear
                    </button>
                </div>
            </div>

            {/* Loading Overlay */}
            {isDistributing && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <span className="text-emerald-800 font-medium">Solving Placement...</span>
                    </div>
                </div>
            )}

            {/* Stash Content List */}
            {entries.length > 0 && (
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                    {entries.map(([cropId, qty]) => {
                        const crop = crops.find((c) => c.id === cropId)
                        if (!crop) return null

                        const itemArea = Math.ceil(qty / crop.sfg_density)

                        return (
                            <div key={cropId} className="flex justify-between items-center text-sm group">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onRemoveItem(cropId)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={`Remove ${crop.name} from stash`}
                                        type="button"
                                        disabled={isDistributing}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                    <span className="text-lg w-6 text-center">{crop.emoji}</span>
                                    <span className="text-soil-800">
                                        <span className="font-medium">{qty}x</span> {crop.name}
                                    </span>
                                </div>
                                <div className="text-soil-500 text-xs">
                                    {itemArea} sq ft
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Area Usage Bar */}
            {entries.length > 0 && (
                <div className="pt-3 border-t border-soil-200 mb-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-medium text-soil-700">Total Area Used</span>
                        <span className={`text-sm font-bold ${isOverLimit ? 'text-red-600' : 'text-leaf-700'}`}>
                            {totalArea} / {maxArea} sq ft
                        </span>
                    </div>

                    <div className="w-full bg-soil-100 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all ${isOverLimit ? 'bg-red-500' : 'bg-leaf-500'}`}
                            style={{ width: `${Math.min((totalArea / maxArea) * 100, 100)}%` }}
                        />
                    </div>

                    {isOverLimit && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                            Warning: Stash exceeds available space!
                        </p>
                    )}
                </div>
            )}

            {/* Distribute Controls */}
            {entries.length > 0 && (
                <div className="pt-2 border-t border-soil-200 space-y-3">
                    <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={fillGaps}
                                onChange={(e) => setFillGaps(e.target.checked)}
                                disabled={isDistributing}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-leaf-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-leaf-600"></div>
                            <span className="ml-3 text-sm font-medium text-soil-700">Fill remaining gaps?</span>
                        </label>
                    </div>

                    <button
                        onClick={() => onDistribute(fillGaps)}
                        disabled={isOverLimit || isDistributing}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors ${isOverLimit
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-leaf-600 text-white hover:bg-leaf-700 shadow-sm'
                            }`}
                    >
                        {isDistributing ? (
                            <span className="animate-pulse">Placing...</span>
                        ) : (
                            <>
                                <Sprout className="w-4 h-4" />
                                Distribute Stash
                            </>
                        )}
                    </button>
                    {isOverLimit && <p className="text-xs text-center text-red-500">Reduce items to distribute</p>}
                </div>
            )}

            {/* Placement Report */}
            {placementResult && (
                <div className="mt-4 p-3 bg-soil-50 rounded border border-soil-200 animate-fadeIn">
                    <h4 className="text-sm font-semibold text-soil-800 mb-2">Placement Results</h4>

                    {placementResult.placed > 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Placed {placementResult.placed} crops successfully!</span>
                        </div>
                    )}

                    {placementResult.failed.length > 0 && (
                        <div className="text-sm text-amber-700">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Could not place {placementResult.failed.length} crops:</span>
                            </div>
                            <ul className="list-disc pl-5 text-xs space-y-1 opacity-90">
                                {placementResult.failed.map((fail, i) => {
                                    const cropName = crops.find(c => c.id === fail.cropId)?.name || fail.cropId
                                    return (
                                        <li key={i}>
                                            <span className="font-medium">{cropName}</span>: {fail.reason}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
