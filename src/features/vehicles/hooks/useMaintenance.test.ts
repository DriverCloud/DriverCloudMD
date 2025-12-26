
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVehicleMaintenance } from './useMaintenance'

// No need to mock Supabase here as the hook uses local state + setTimeout
// But if it imported client, we'd mock it to avoid crashes
vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({})
}))

describe('useVehicleMaintenance', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useVehicleMaintenance('vehicle-1'))

        expect(result.current.logs).toEqual([])
        expect(result.current.loading).toBe(false)
    })

    it('should add log after maintenance marked (with delay)', async () => {
        const { result } = renderHook(() => useVehicleMaintenance('vehicle-1'))

        let promise: Promise<any>

        act(() => {
            promise = result.current.markUnderMaintenance('Oil Change')
        })

        // Should be loading immediately
        expect(result.current.loading).toBe(true)

        // Fast-forward time
        await act(async () => {
            vi.runAllTimers()
            await promise
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.logs).toHaveLength(1)
        expect(result.current.logs[0]).toMatchObject({
            vehicle_id: 'vehicle-1',
            description: 'Oil Change',
            status: 'in_progress'
        })
    })

    it('should complete maintenance', async () => {
        const { result } = renderHook(() => useVehicleMaintenance('vehicle-1'))

        // Setup: Add a log first
        let logId: string = ''
        await act(async () => {
            const promise = result.current.markUnderMaintenance('Repair')
            vi.runAllTimers()
            const log = await promise
            logId = log.id
        })

        // Act: Complete it
        let completePromise: Promise<void>
        act(() => {
            completePromise = result.current.completeMaintenance(logId, 500)
        })

        expect(result.current.loading).toBe(true)

        await act(async () => {
            vi.runAllTimers()
            await completePromise
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.logs[0]).toMatchObject({
            status: 'completed',
            cost: 500
        })
    })
})
