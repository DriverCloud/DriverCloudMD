'use client';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapChartProps {
    data: number[][]; // 7x24 array
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HeatmapChart({ data }: HeatmapChartProps) {
    if (!data || data.length === 0) return null;

    // Find max value for normalization
    let max = 0;
    data.forEach(day => day.forEach(val => max = Math.max(max, val)));

    const getIntensityClass = (value: number) => {
        if (value === 0) return 'bg-muted/30';
        const ratio = value / max;
        if (ratio < 0.25) return 'bg-emerald-100 dark:bg-emerald-950/30';
        if (ratio < 0.5) return 'bg-emerald-300 dark:bg-emerald-900/50';
        if (ratio < 0.75) return 'bg-emerald-500 dark:bg-emerald-700';
        return 'bg-emerald-700 dark:bg-emerald-500';
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[600px]">
                {/* Header Hours */}
                <div className="flex mb-2">
                    <div className="w-10 flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-24 gap-1">
                        {HOURS.map(h => (
                            h % 3 === 0 && (
                                <div key={h} className="text-xs text-muted-foreground col-span-3 text-left pl-1 border-l">
                                    {h}hs
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-rows-7 gap-1">
                    {DAYS.map((dayName, dayIndex) => (
                        <div key={dayName} className="flex items-center h-8">
                            <div className="w-10 text-xs font-medium text-muted-foreground flex-shrink-0">
                                {dayName}
                            </div>
                            <div className="flex-1 grid grid-cols-24 gap-1 h-full">
                                {HOURS.map((hour) => {
                                    const value = data[dayIndex][hour];
                                    return (
                                        <TooltipProvider key={hour}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "w-full h-full rounded-sm transition-colors",
                                                            getIntensityClass(value)
                                                        )}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-sm font-semibold">{dayName} {hour}:00hs</p>
                                                    <p className="text-xs">{value} clases</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground justify-end">
                    <span>Menos actividad</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-4 bg-muted/30 rounded-sm" />
                        <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-950/30 rounded-sm" />
                        <div className="w-4 h-4 bg-emerald-300 dark:bg-emerald-900/50 rounded-sm" />
                        <div className="w-4 h-4 bg-emerald-500 dark:bg-emerald-700 rounded-sm" />
                        <div className="w-4 h-4 bg-emerald-700 dark:bg-emerald-500 rounded-sm" />
                    </div>
                    <span>Más actividad</span>
                </div>
            </div>
        </div>
    );
}
