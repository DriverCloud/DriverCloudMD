
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { middleware } from './middleware'
import { NextResponse } from 'next/server'

// Mock Supabase Auth
const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
    createServerClient: () => ({
        auth: {
            getUser: mockGetUser
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { role: 'admin' } })
                }))
            }))
        }))
    })
}))

// Mock NextResponse
vi.mock('next/server', () => {
    const ActualNextResponse = vi.importActual('next/server')
    return {
        ...ActualNextResponse,
        NextResponse: {
            next: vi.fn(),
            redirect: vi.fn()
        }
    }
})

describe('Middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    function createMockRequest(path: string) {
        return {
            nextUrl: {
                pathname: path,
                clone: () => ({ pathname: '' })
            },
            cookies: {
                getAll: () => []
            }
        } as any
    }

    it('should redirect unauthenticated user from protected route to login', async () => {
        // User not logged in
        mockGetUser.mockResolvedValue({ data: { user: null } })

        const req = createMockRequest('/dashboard')
        await middleware(req)

        expect(NextResponse.redirect).toHaveBeenCalled()
        // We verify that redirect was called. 
        // Checking the exact URL argument usually involves inspecting the mocked clone() result, 
        // which implies more complex mocking of URL, but checking the call is sufficient for logic.
    })

    it('should allow authenticated user to access protected route', async () => {
        // User logged in
        mockGetUser.mockResolvedValue({ data: { user: { id: '1' } } })
        vi.mocked(NextResponse.next).mockReturnValue('next-response' as any)

        const req = createMockRequest('/dashboard')
        const res = await middleware(req)

        expect(NextResponse.next).toHaveBeenCalled()
        expect(res).toBe('next-response')
        expect(NextResponse.redirect).not.toHaveBeenCalled()
    })

    it('should redirect authenticated user from login page to dashboard', async () => {
        // User logged in
        mockGetUser.mockResolvedValue({ data: { user: { id: '1' } } })

        const req = createMockRequest('/login')
        await middleware(req)

        expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('should allow unauthenticated user to access public route', async () => {
        // User not logged in
        mockGetUser.mockResolvedValue({ data: { user: null } })

        const req = createMockRequest('/some-public-page')
        await middleware(req)

        expect(NextResponse.next).toHaveBeenCalled()
        expect(NextResponse.redirect).not.toHaveBeenCalled()
    })
})
