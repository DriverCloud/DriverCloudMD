
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
        // Dynamic mock implementation based on table name
        const mockSelect = vi.fn().mockImplementation((path) => {
            // Depending on what chain follows, we need to return specific data
            // The component awaits these promises.
            return Promise.resolve({ data: [], count: 0 })
        })

        // We need 'from' to return an object that has 'select'
        // That 'select' needs to return a Promise that resolves to data OR an object with 'count'.

        // Let's control the mocks directly in the implementation of the module factory for better control, 
        // OR simply mock the return values based on call order if deterministic.
        // It calls 'students' first, then 'vehicles'.
        // students -> select('*', count) -> returns { count: 150 }
        // vehicles -> select('status') -> returns { data: [Array] }

        mockSelect
            .mockResolvedValueOnce({ count: 150 }) // 1st call: students
            .mockResolvedValueOnce({ // 2nd call: vehicles
                data: [
                    { status: 'active' },
                    { status: 'active' },
                    { status: 'maintenance' }
                ]
            })

        mockFrom.mockReturnValue({
            select: mockSelect
        })

        // 3. Income mock
        vi.mocked(paymentsService.getIncomeStats).mockResolvedValue(500000)

        render(<KPICards />)

        // Verify "Ingresos Totales"
        // Use a flexible matcher for currency that might include non-breaking spaces or differen locale formats
        await waitFor(() => {
            const incomeElement = screen.getByText((content) => {
                return content.includes('500') && (content.includes('$') || content.includes('USD'))
            })
            expect(incomeElement).toBeInTheDocument()
        })

        // Verify "Estudiantes Activos" -> 150
        expect(screen.getByText('150')).toBeInTheDocument()

        // Verify "Vehículos Disponibles" -> 2 / 3
        expect(screen.getByText('2 / 3')).toBeInTheDocument()

        // Verify logic text: 1 en mantenimiento/uso (3 total - 2 available)
        expect(screen.getByText('1 en mantenimiento/uso')).toBeInTheDocument()
    })
})
