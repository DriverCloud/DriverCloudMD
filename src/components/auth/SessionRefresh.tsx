'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SessionRefresh() {
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.push('/login')
            }
            if (event === 'TOKEN_REFRESHED') {
                router.refresh()
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    return null
}
