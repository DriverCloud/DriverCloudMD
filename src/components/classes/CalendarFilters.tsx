'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CalendarFiltersProps {
    instructors: { id: string; first_name: string; last_name: string }[];
    vehicles: { id: string; brand: string; model: string; license_plate: string }[];
    currentInstructorId?: string;
    currentVehicleId?: string;
}

export function CalendarFilters({
    instructors,
    vehicles,
    currentInstructorId,
    currentVehicleId
}: CalendarFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/dashboard/classes?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('instructorId');
        params.delete('vehicleId');
        router.push(`/dashboard/classes?${params.toString()}`);
    };

    const hasFilters = currentInstructorId || currentVehicleId;

    return (
        <div className="flex items-center gap-2">
            <Select
                value={currentInstructorId || "all"}
                onValueChange={(val) => updateFilter('instructorId', val === "all" ? null : val)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por Instructor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los Instructores</SelectItem>
                    {instructors.map((ins) => (
                        <SelectItem key={ins.id} value={ins.id}>
                            {ins.first_name} {ins.last_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={currentVehicleId || "all"}
                onValueChange={(val) => updateFilter('vehicleId', val === "all" ? null : val)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por Vehículo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los Vehículos</SelectItem>
                    {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                            {v.brand} {v.model} ({v.license_plate})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasFilters && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFilters}
                    title="Limpiar filtros"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
