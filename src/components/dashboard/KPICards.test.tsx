
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KPICards } from './KPICards'

// Mock the dependencies
const mockSelect = vi.fn()
const mockFrom = vi.fn(() => ({
    select: mockSelect
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: mockFrom
    })
}))

vi.mock('@/features/finance/services/payments.service', () => ({
    paymentsService: {
        getIncomeStats: vi.fn()
    }
}))

import { paymentsService } from '@/features/finance/services/payments.service'

describe('KPICards', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render KPIs with fetched data', async () => {
        // Setup mocks
        // 1. Students count mock
        mockSelect.mockResolvedValueOnce({ count: 150 })

        // 2. Vehicles mock (Total & Available)
        // KPICards calls select('status') on 'vehicles' table
        mockSelect.mockResolvedValueOnce({
            data: [
                { status: 'available' },
                { status: 'available' },
                { status: 'maintenance' }
            ]
        })

        // 3. Income mock
        vi.mocked(paymentsService.getIncomeStats).mockResolvedValue(500000)

        render(<KPICards />)

        // Verify "Ingresos Totales"
        // Observed output was $500.000 (dot separator)
        await waitFor(() => {
            expect(screen.getByText(/\$500[.,]000/)).toBeInTheDocument()
        })

        // Verify "Estudiantes Activos" -> 150
        expect(screen.getByText('150')).toBeInTheDocument()

        // Verify "Vehículos Disponibles" -> 2 / 3
        expect(screen.getByText('2 / 3')).toBeInTheDocument()

        // Verify logic text: 1 en mantenimiento/uso (3 total - 2 available)
        expect(screen.getByText('1 en mantenimiento/uso')).toBeInTheDocument()
    })
})
