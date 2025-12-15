'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CalendarViewProps {
    appointments: any[];
    currentDate: Date;
    view: string;
    resources: any;
}

export function CalendarView({ appointments, currentDate, view, resources }: CalendarViewProps) {
    const router = useRouter();

    const handlePrev = () => {
        const newDate = subWeeks(currentDate, 1);
        router.push(`?date=${format(newDate, 'yyyy-MM-dd')}&view=${view}`);
    };

    const handleNext = () => {
        const newDate = addWeeks(currentDate, 1);
        router.push(`?date=${format(newDate, 'yyyy-MM-dd')}&view=${view}`);
    };

    const handleToday = () => {
        router.push(`?date=${format(new Date(), 'yyyy-MM-dd')}&view=${view}`);
    };

    // Generate week days
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(monday, i)); // Mon-Sat

    // Generate time slots (8:00 to 20:00)
    const timeSlots = Array.from({ length: 13 }).map((_, i) => 8 + i);

    return (
        <div className="flex flex-col h-full border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrev}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold capitalize ml-2">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleToday}>
                        Hoy
                    </Button>
                    <Select defaultValue={view} onValueChange={(v) => router.push(`?date=${format(currentDate, 'yyyy-MM-dd')}&view=${v}`)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Vista" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Semana</SelectItem>
                            <SelectItem value="day">Día</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto">
                <div className="min-w-[800px]">
                    {/* Header Row (Days) */}
                    <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted/20">
                        <div className="p-2 border-r text-xs text-muted-foreground text-center content-center">Hora</div>
                        {weekDays.map((day) => (
                            <div key={day.toString()} className={cn(
                                "p-2 text-center border-r last:border-r-0",
                                isSameDay(day, new Date()) && "bg-primary/10"
                            )}>
                                <div className="text-xs text-muted-foreground capitalize">
                                    {format(day, 'EEE', { locale: es })}
                                </div>
                                <div className={cn(
                                    "text-sm font-bold",
                                    isSameDay(day, new Date()) && "text-primary"
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    {timeSlots.map((hour) => (
                        <div key={hour} className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr] border-b last:border-b-0">
                            {/* Time Label */}
                            <div className="p-2 border-r text-xs text-muted-foreground text-right pr-3 -mt-2.5 bg-background sticky left-0 z-10">
                                {`${hour}:00`}
                            </div>

                            {/* Columns for each day */}
                            {weekDays.map((day) => {
                                // Find appointments for this slot
                                const slotApps = appointments.filter(app => {
                                    const appDate = new Date(app.scheduled_date + 'T00:00:00'); // Fix timezone issue carefully? 
                                    // Actually scheduled_date is YYYY-MM-DD string.
                                    // Let's compare strings.
                                    const dayStr = format(day, 'yyyy-MM-dd');
                                    if (app.scheduled_date !== dayStr) return false;

                                    const appHour = parseInt(app.start_time.split(':')[0]);
                                    return appHour === hour;
                                });

                                return (
                                    <div key={day.toString()} className="border-r last:border-r-0 relative min-h-[60px] p-1 group hover:bg-muted/5 transition-colors">
                                        {slotApps.map(app => (
                                            <div
                                                key={app.id}
                                                className={cn(
                                                    "absolute left-1 right-1 rounded p-1 text-xs border shadow-sm cursor-pointer hover:shadow-md transition-shadow z-20",
                                                    app.status === 'scheduled' ? "bg-blue-100 border-blue-200 text-blue-800" :
                                                        app.status === 'completed' ? "bg-green-100 border-green-200 text-green-800" :
                                                            app.status === 'cancelled' ? "bg-red-50 border-red-100 text-red-800 line-through" :
                                                                "bg-gray-100 border-gray-200"
                                                )}
                                                style={{
                                                    top: '0px',
                                                    // Simple height calc: if duration is minutes, map to pixels. 1 hour = 60px height.
                                                    // app.class_type.duration_minutes
                                                    height: `${(app.class_type?.duration_minutes || 60)}px`
                                                }}
                                            >
                                                <div className="font-semibold truncate">
                                                    {app.student?.first_name} {app.student?.last_name}
                                                </div>
                                                <div className="truncate opacity-75">
                                                    {app.start_time} - {app.vehicle?.brand}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
