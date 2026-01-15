'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, MapPin, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, subMonths } from 'date-fns'

interface ReportFiltersProps {
    locations: Array<{ id: string; name: string }>
}

export function ReportFilters({ locations }: ReportFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const startDate = searchParams.get('startDate') || format(subMonths(new Date(), 6), 'yyyy-MM-dd')
    const endDate = searchParams.get('endDate') || format(new Date(), 'yyyy-MM-dd')
    const locationId = searchParams.get('locationId') || ''

    const updateFilter = (params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams.toString())
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value)
            } else {
                newParams.delete(key)
            }
        })
        router.push(`?${newParams.toString()}`)
    }

    const clearFilters = () => {
        router.push('/dashboard/reports')
    }

    const isFiltered = !!searchParams.get('startDate') || !!searchParams.get('endDate') || !!searchParams.get('locationId')

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card border rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                Filtros
            </div>

            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => updateFilter({ startDate: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 text-sm p-0 w-32"
                />
                <span className="text-muted-foreground">al</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => updateFilter({ endDate: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 text-sm p-0 w-32"
                />
            </div>

            <div className="h-4 w-px bg-border mx-2 hidden md:block" />

            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <select
                    value={locationId}
                    onChange={(e) => updateFilter({ locationId: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 text-sm p-0 outline-none min-w-[150px]"
                >
                    <option value="">Todas las Sedes</option>
                    {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                            {loc.name}
                        </option>
                    ))}
                </select>
            </div>

            {isFiltered && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="ml-auto h-8 text-xs gap-1"
                >
                    <X className="h-3 w-3" />
                    Limpiar
                </Button>
            )}
        </div>
    )
}
