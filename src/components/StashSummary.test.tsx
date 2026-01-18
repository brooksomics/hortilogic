import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StashSummary } from './StashSummary'
import { CROP_DATABASE } from '../data/crops'

describe('StashSummary', () => {
    const mockCrops = CROP_DATABASE
    const mockStash = {
        'tomato': 4,
        'carrot': 16
    }

    const defaultProps = {
        stash: mockStash,
        crops: mockCrops,
        totalArea: 5,
        maxArea: 32,
        onClear: vi.fn(),
        onRemoveItem: vi.fn(),
        onDistribute: vi.fn(),
        placementResult: null,
        isDistributing: false
    }

    it('renders nothing when stash is empty and no result', () => {
        const { container } = render(
            <StashSummary
                {...defaultProps}
                stash={{}}
                totalArea={0}
            />
        )
        expect(container.firstChild).toBeNull()
    })

    it('renders stash items correctly', () => {
        render(<StashSummary {...defaultProps} />)

        expect(screen.getByText('Garden Stash')).toBeInTheDocument()
        expect(screen.getByText('4x')).toBeInTheDocument()
        expect(screen.getByText('Tomato')).toBeInTheDocument()
        expect(screen.getByText('16x')).toBeInTheDocument()
        expect(screen.getByText('Carrot')).toBeInTheDocument()
        expect(screen.getByText('5 / 32 sq ft')).toBeInTheDocument()
    })

    it('calls onClear when clear button clicked', () => {
        render(<StashSummary {...defaultProps} />)

        const clearButton = screen.getByRole('button', { name: /clear/i })
        fireEvent.click(clearButton)
        expect(defaultProps.onClear).toHaveBeenCalled()
    })

    it('calls onRemoveItem when item remove button clicked', () => {
        render(<StashSummary {...defaultProps} />)

        // Find remove button by title attribute since text is hidden/icon
        const removeTomatoBtn = screen.getByTitle('Remove Tomato from stash')
        fireEvent.click(removeTomatoBtn)
        expect(defaultProps.onRemoveItem).toHaveBeenCalledWith('tomato')
    })

    it('calls onDistribute with false (default) when distribute button clicked', () => {
        render(<StashSummary {...defaultProps} />)

        const distributeBtn = screen.getByRole('button', { name: /distribute stash/i })
        fireEvent.click(distributeBtn)

        expect(defaultProps.onDistribute).toHaveBeenCalledWith(false)
    })

    it('calls onDistribute with true when fill gaps is toggled on', () => {
        render(<StashSummary {...defaultProps} />)

        const toggle = screen.getByLabelText(/fill remaining gaps/i)
        fireEvent.click(toggle) // Turn ON

        const distributeBtn = screen.getByRole('button', { name: /distribute stash/i })
        fireEvent.click(distributeBtn)

        expect(defaultProps.onDistribute).toHaveBeenCalledWith(true)
    })

    it('disables distribute button when over limit', () => {
        render(
            <StashSummary
                {...defaultProps}
                totalArea={40}
                maxArea={32}
            />
        )

        const distributeBtn = screen.getByRole('button', { name: /distribute stash/i })
        expect(distributeBtn).toBeDisabled()
        expect(screen.getByText(/exceeds available space/i)).toBeInTheDocument()
    })

    it('disables controls when isDistributing is true', () => {
        render(
            <StashSummary
                {...defaultProps}
                isDistributing={true}
            />
        )

        expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /placing/i })).toBeDisabled()
        expect(screen.getByLabelText(/fill remaining gaps/i)).toBeDisabled()
    })

    it('renders placement success report', () => {
        const result = {
            placed: 12,
            failed: []
        }

        render(
            <StashSummary
                {...defaultProps}
                placementResult={result}
            />
        )

        expect(screen.getByText(/placed 12 crops successfully/i)).toBeInTheDocument()
    })

    it('renders placement failure report', () => {
        const result = {
            placed: 5,
            failed: [
                { cropId: 'tomato', reason: 'No space' },
                { cropId: 'carrot', reason: 'Enemies nearby' }
            ]
        }

        // Pass empty stash to avoid "Multiple elements with text Tomato/Carrot" ambiguity
        // The report renders even if stash is empty because placementResult is present
        render(
            <StashSummary
                {...defaultProps}
                stash={{}}
                placementResult={result}
            />
        )

        expect(screen.getByText(/could not place 2 crops/i)).toBeInTheDocument()
        expect(screen.getByText('Tomato')).toBeInTheDocument()
        expect(screen.getByText(': No space')).toBeInTheDocument()
        expect(screen.getByText('Carrot')).toBeInTheDocument()
        expect(screen.getByText(': Enemies nearby')).toBeInTheDocument()
    })
})
