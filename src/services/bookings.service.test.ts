
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bookingsService } from './bookings.service'

// Mock Supabase
const mockSingle = vi.fn()
const mockSelect = vi.fn()
const mockGte = vi.fn()
const mockLte = vi.fn()
const mockEq = vi.fn()

// Chain builder
const mockQueryBuilder = {
    select: mockSelect,
    gte: mockGte,
    lte: mockLte,
    eq: mockEq,
    insert: vi.fn(() => ({
        select: vi.fn(() => ({ single: mockSingle }))
    }))
}

// Make chainable
mockSelect.mockReturnValue(mockQueryBuilder)
mockGte.mockReturnValue(mockQueryBuilder)
mockLte.mockReturnValue(mockQueryBuilder)
mockEq.mockReturnValue(mockQueryBuilder)

const mockFrom = vi.fn(() => mockQueryBuilder)

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: mockFrom
    })
}))

// Mock Slots Generator
vi.mock('@/features/scheduling/utils/slots', () => ({
    generateDailySlots: vi.fn().mockReturnValue([
        { startTime: '09:00', endTime: '10:00', available: true },
        { startTime: '10:00', endTime: '11:00', available: true },
        { startTime: '11:00', endTime: '12:00', available: true }
    ]),
    TimeSlot: {}
}))

describe('Bookings Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAvailability', () => {
        it('should mark slots as unavailable if conflicting appointment exists', async () => {
            const testDate = new Date('2024-03-20T00:00:00')

            // Mock database returning one appointment at 10:00
            // The service calls: select.gte.lte
            // Since our mock chain returns itself, we just need to make the last call awaitable

            // We need to mock the promise resolution of the query
            // In the code: await query
            // The query object itself needs to be thenable or we mock the last method to return { data: ... }

            // The logical chain is: from -> select -> gte -> lte
            // So 'lte' is likely the last call before await
            mockLte.mockResolvedValueOnce({
                data: [
                    { start_time: '2024-03-20T10:00:00' }
                ],
                error: null
            })

            const slots = await bookingsService.getAvailability(testDate)

            // 09:00 -> Available
            expect(slots[0].startTime).toBe('09:00')
            expect(slots[0].available).toBe(true)

            // 10:00 -> Unavailable (Conflict)
            expect(slots[1].startTime).toBe('10:00')
            expect(slots[1].available).toBe(false)

            // 11:00 -> Available
            expect(slots[2].startTime).toBe('11:00')
            expect(slots[2].available).toBe(true)
        })

        it('should filter by instructor if provided', async () => {
            const testDate = new Date('2024-03-20T00:00:00')
            mockLte.mockReturnValue({
                eq: mockEq // If instructorId is present, .eq gets called
            })
            mockEq.mockResolvedValueOnce({ data: [], error: null })

            await bookingsService.getAvailability(testDate, 'instructor-1')

            expect(mockEq).toHaveBeenCalledWith('instructor_id', 'instructor-1')
        })
    })

    describe('createBooking', () => {
        it('should successfully insert booking', async () => {
            const mockData = { id: 'enroll-1', status: 'confirmed' }
            mockSingle.mockResolvedValueOnce({ data: mockData, error: null })

            const result = await bookingsService.createBooking('student-1', 'appt-1')

            expect(mockFrom).toHaveBeenCalledWith('appointment_enrollments')
            expect(result).toEqual(mockData)
        })

        it('should throw error on failure', async () => {
            mockSingle.mockResolvedValueOnce({
                data: null,
                error: { message: 'DB Error' }
            })

            await expect(bookingsService.createBooking('s-1', 'a-1'))
                .rejects.toThrow('DB Error')
        })
    })
})
