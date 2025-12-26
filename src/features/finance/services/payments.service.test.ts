
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { paymentsService } from './payments.service'

// Mock Supabase
const mockSingle = vi.fn()
const mockLimit = vi.fn()
const mockOrder = vi.fn(() => ({ limit: mockLimit }))
const mockEq = vi.fn()
const mockSelect = vi.fn(() => ({
    eq: mockEq,
    order: mockOrder,
    single: mockSingle
}))
const mockInsert = vi.fn(() => ({
    select: vi.fn(() => ({ single: mockSingle }))
}))

const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    eq: mockEq // For potential immediate eq after from, though typical is select first
}))

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: mockFrom,
        auth: {
            getUser: mockGetUser
        }
    })
}))

describe('Payments Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getIncomeStats', () => {
        it('should sum all completed payments', async () => {
            // Setup mock for: .from('payments').select('amount').eq('payment_status', 'completed')
            mockEq.mockResolvedValueOnce({
                data: [
                    { amount: 100 },
                    { amount: 200 },
                    { amount: 50.5 }
                ],
                error: null
            })
            // Since .eq is called on the result of .select
            // mockSelect returns object with .eq

            const total = await paymentsService.getIncomeStats()
            expect(total).toBe(350.5)

            expect(mockFrom).toHaveBeenCalledWith('payments')
            expect(mockSelect).toHaveBeenCalledWith('amount')
            expect(mockEq).toHaveBeenCalledWith('payment_status', 'completed')
        })

        it('should return 0 on error', async () => {
            mockEq.mockResolvedValueOnce({
                data: null,
                error: { message: 'Database error' }
            })

            const total = await paymentsService.getIncomeStats()
            expect(total).toBe(0)
        })
    })

    describe('createPayment', () => {
        const samplePayment = {
            student_id: 'student-123',
            amount: 1000,
            payment_method: 'cash',
            notes: 'Test payment'
        }

        it('should throw error if user is not authenticated', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null } })

            await expect(paymentsService.createPayment(samplePayment))
                .rejects.toThrow("User not authenticated")
        })

        it('should successfully create a payment when authorized', async () => {
            const mockUser = { id: 'user-123' }
            const mockMembership = { school_id: 'school-1', owner_id: 'owner-1' }
            const mockCreatedPayment = { id: 'pay-1', ...samplePayment, ...mockMembership }

            // 1. Auth check
            mockGetUser.mockResolvedValue({ data: { user: mockUser } })

            // 2. Membership check
            // .from('memberships').select(...).eq(...).single()
            mockFrom.mockReturnValueOnce({ // For memberships call
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: mockMembership })
                    }))
                }))
            })

            // 3. Payment insert
            // .from('payments').insert(...).select().single()
            mockFrom.mockReturnValueOnce({ // For payments call
                insert: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({ data: mockCreatedPayment, error: null })
                    }))
                }))
            })

            const result = await paymentsService.createPayment(samplePayment)

            expect(result).toEqual(mockCreatedPayment)
            expect(mockGetUser).toHaveBeenCalled()
        })
    })
})
