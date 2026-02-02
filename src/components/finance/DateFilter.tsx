'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function DateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentParam = searchParams.get('month'); // Format: YYYY-MM
    const today = new Date();

    // Parse current selection or default to current month
    const currentYear = currentParam ? parseInt(currentParam.split('-')[0]) : today.getFullYear();
    const currentMonth = currentParam ? parseInt(currentParam.split('-')[1]) : today.getMonth() + 1;

    // Generate years (e.g., current year - 2 to current year + 1)
    const years = Array.from({ length: 4 }, (_, i) => today.getFullYear() - 2 + i);

    const months = [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' },
    ];

    const updateFilter = (newMonth: number, newYear: number) => {
        const monthStr = newMonth.toString().padStart(2, '0');
        const query = `${newYear}-${monthStr}`;
        const params = new URLSearchParams(searchParams);
        params.set('month', query);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex gap-2">
            <Select
                value={currentMonth.toString()}
                onValueChange={(val) => updateFilter(parseInt(val), currentYear)}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                    {months.map((m) => (
                        <SelectItem key={m.value} value={m.value.toString()}>
                            {m.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={currentYear.toString()}
                onValueChange={(val) => updateFilter(currentMonth, parseInt(val))}
            >
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
