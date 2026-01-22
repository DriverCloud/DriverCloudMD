'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function StudentSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('search') || '')

    // Keep local query in sync with URL (e.g. when clearing filters)
    useEffect(() => {
        setQuery(searchParams.get('search') || '')
    }, [searchParams])

    useEffect(() => {
        // Only run if the query differs from what's currently in the URL
        const currentSearch = searchParams.get('search') || ''
        if (query === currentSearch) return

        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (query) {
                params.set('search', query)
            } else {
                params.delete('search')
            }
            router.push(`?${params.toString()}`, { scroll: false })
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [query, router]) // Removed searchParams to avoid loops

    return (
        <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Buscar por nombre o apellido..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-9 h-10 bg-card"
            />
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}
