'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/login?error=Invalid credentials')
    }

    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}

export async function loginAsDemo() {
    const supabase = await createClient()

    // Try to login with demo user
    const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@drivercloud.com',
        password: 'password123'
    })

    if (error) {
        // Should prompt to register if demo doesn't exist, but for now just redirect to error
        redirect('/login?error=Demo user not found')
    }

    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}
