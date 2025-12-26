
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { LoginForm } from './LoginForm'
import userEvent from '@testing-library/user-event'

// Mock Next.js Router
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh
    })
}))

// Mock Supabase
const mockSignIn = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            signInWithPassword: mockSignIn,
            signInAnonymously: vi.fn()
        }
    })
}))

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show validation errors for empty fields', async () => {
        render(<LoginForm />)

        const submitButton = screen.getByRole('button', { name: "Ingresar" })

        // Click without filling anything
        fireEvent.click(submitButton)

        // React Hook Form validation matches schema messages
        await waitFor(() => {
            expect(screen.getByText(/email válido/i)).toBeInTheDocument()
            expect(screen.getByText(/6 caracteres/i)).toBeInTheDocument()
        })
    })

    it('should call sign in with correct credentials', async () => {
        render(<LoginForm />)
        const user = userEvent.setup()

        mockSignIn.mockResolvedValueOnce({ data: {}, error: null })

        await user.type(screen.getByLabelText(/correo/i), 'test@test.com')
        await user.type(screen.getByLabelText(/contraseña/i), 'password123')

        const submitButton = screen.getByRole('button', { name: "Ingresar" })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: 'password123'
            })
        })

        expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should show error message on failed login', async () => {
        render(<LoginForm />)
        const user = userEvent.setup()

        // Mock error from Supabase
        mockSignIn.mockResolvedValueOnce({
            data: {},
            error: { message: 'Invalid login credentials' }
        })

        await user.type(screen.getByLabelText(/correo/i), 'wrong@test.com')
        await user.type(screen.getByLabelText(/contraseña/i), 'wrongpass')

        const submitButton = screen.getByRole('button', { name: "Ingresar" })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
        })

        expect(mockPush).not.toHaveBeenCalled()
    })
})
