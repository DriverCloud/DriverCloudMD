'use client'

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfWeek, addWeeks, subWeeks, endOfWeek, parseISO, isSameDay, addHours, setHours, setMinutes, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Pencil, Calendar as CalendarIcon, Clock, User, Car, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreateClassDialog } from './CreateClassDialog';
import { EditClassDialog } from './EditClassDialog';

interface CalendarViewProps {
    appointments: any[];
    currentDate: Date;
    view: string;
    resources: {
        students: any[];
        instructors: any[];
        vehicles: any[];
        classTypes: any[];
    };
    filterVehicleId?: string;
    userRole: string;
}

// Helper to generate consistent color for a vehicle
function getVehicleColor(vehicleId: string): { bg: string; border: string; text: string } {
    const colors = [
        { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
        { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
        { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
        { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
        { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900' },
        { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-900' },
        { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-900' },
        { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-900' },
    ];

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < vehicleId.length; i++) {
        hash = vehicleId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export function CalendarView({ appointments, currentDate, view, resources, filterVehicleId, userRole }: CalendarViewProps) {
    const router = useRouter();
    const [showAvailability, setShowAvailability] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

    const handlePrev = () => {
        const newDate = subWeeks(currentDate, 1);
        router.push(`/dashboard/classes?date=${format(newDate, 'yyyy-MM-dd')}&view=${view}`);
    };

    const handleNext = () => {
        const newDate = addWeeks(currentDate, 1);
        router.push(`/dashboard/classes?date=${format(newDate, 'yyyy-MM-dd')}&view=${view}`);
    };

    const handleToday = () => {
        router.push(`/dashboard/classes?date=${format(new Date(), 'yyyy-MM-dd')}&view=${view}`);
    };

    const handleSlotClick = (dateStr: string, hour: number) => {
        setSelectedDate(dateStr);
        setSelectedTime(`${hour.toString().padStart(2, '0')}:00`);
        setCreateOpen(true);
    };

    const handleAppointmentClick = (app: any) => {
        setSelectedAppointment(app);
        setEditOpen(true);
    };

    // Generate week days
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(monday, i)); // Mon-Sun

    // Generate time slots (8:00 to 20:00)
    const timeSlots = Array.from({ length: 13 }).map((_, i) => 8 + i); // 8 AM to 8 PM

    // Function to calculate free slots
    const calculateFreeSlots = useMemo(() => {
        return (day: Date, hour: number) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const startOfHour = setMinutes(setHours(parseISO(dayStr), hour), 0);
            const endOfHour = setMinutes(setHours(parseISO(dayStr), hour), 59);

            const appointmentsForDay = appointments
                .filter(app => app.scheduled_date === dayStr && app.status !== 'cancelled' && app.status !== 'completed')
                .map(app => {
                    const [startHour, startMinute] = app.start_time.split(':').map(Number);
                    const [endHour, endMinute] = app.end_time.split(':').map(Number);
                    return {
                        start: setMinutes(setHours(parseISO(dayStr), startHour), startMinute),
                        end: setMinutes(setHours(parseISO(dayStr), endHour), endMinute),
                        duration: app.class_type?.duration_minutes || 60,
                        vehicleId: app.vehicle_id,
                    };
                })
                .sort((a, b) => a.start.getTime() - b.start.getTime());

            const freeSlots = [];
            let currentCheckTime = startOfHour;

            for (const app of appointmentsForDay) {
                // If the appointment starts within this hour
                if (isBefore(app.start, endOfHour) && isAfter(app.end, startOfHour)) {
                    // Check for free space before this appointment
                    if (isBefore(currentCheckTime, app.start)) {
                        const freeStart = currentCheckTime;
                        const freeEnd = isBefore(app.start, endOfHour) ? app.start : endOfHour;
                        if (isBefore(freeStart, freeEnd)) {
                            freeSlots.push({ start: freeStart, end: freeEnd });
                        }
                    }
                    // Move currentCheckTime past this appointment's end
                    currentCheckTime = isAfter(app.end, currentCheckTime) ? app.end : currentCheckTime;
                }
            }

            // Check for free space after the last appointment or if no appointments
            if (isBefore(currentCheckTime, endOfHour)) {
                freeSlots.push({ start: currentCheckTime, end: endOfHour });
            }

            // Filter out slots that are too short (e.g., less than 30 minutes)
            return freeSlots.filter(slot => {
                const duration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
                return duration >= 30; // Minimum 30 minutes for a "free slot"
            });
        };
    }, [appointments]);


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
                    <Button
                        variant={showAvailability ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowAvailability(!showAvailability)}
                        className={showAvailability ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    >
                        {showAvailability ? "Ocultar Disponibilidad" : "Ver Disponibilidad"}
                    </Button>
                    <Button variant="outline" onClick={handleToday}>
                        Hoy
                    </Button>
                    <Select defaultValue={view} onValueChange={(v) => {
                        router.push(`/dashboard/classes?date=${format(currentDate, 'yyyy-MM-dd')}&view=${v}`);
                    }}>
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
                <div className="min-w-[800px] h-full">
                    {/* Header Row (Days) */}
                    <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-muted/20 sticky top-0 z-30">
                        <div className="p-2 border-r text-xs text-muted-foreground text-center content-center bg-muted/20">Hora</div>
                        {weekDays.map((day) => (
                            <div key={day.toString()} className={cn(
                                "p-2 text-center border-r last:border-r-0 bg-muted/20",
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
                        <div key={hour} className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b last:border-b-0">
                            {/* Time Label */}
                            <div className="p-2 border-r text-xs text-muted-foreground text-right pr-3 -mt-2.5 bg-background sticky left-0 z-10">
                                {`${hour}:00`}
                            </div>

                            {/* Columns for each day */}
                            {weekDays.map((day) => {
                                // Find appointments for this slot
                                const dayStr = format(day, 'yyyy-MM-dd');

                                const slotApps = appointments.filter(app => {
                                    if (app.scheduled_date !== dayStr) return false;
                                    const appHour = parseInt(app.start_time.split(':')[0]);
                                    return appHour === hour;
                                });

                                // Calculate width for each appointment if multiple
                                const appCount = slotApps.length;
                                const widthPercent = appCount > 0 ? 100 / appCount : 100;

                                const freeSlots = showAvailability ? calculateFreeSlots(day, hour) : [];

                                return (
                                    <div
                                        key={day.toString()}
                                        className="border-r last:border-r-0 relative min-h-[60px] group transition-colors hover:bg-muted/5 cursor-pointer"
                                        onClick={() => handleSlotClick(dayStr, hour)}
                                    >
                                        {/* Render free slots */}
                                        {showAvailability && freeSlots.map((slot, index) => {
                                            const startMinute = slot.start.getMinutes();
                                            const endMinute = slot.end.getMinutes();
                                            const durationMinutes = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);

                                            // Only render if the slot starts within this hour
                                            if (slot.start.getHours() !== hour) return null;

                                            return (
                                                <div
                                                    key={`free-${index}`}
                                                    className="absolute bg-green-200/50 border border-green-300 text-green-800 rounded p-1 text-[10px] flex items-center justify-center"
                                                    style={{
                                                        top: `${(startMinute / 60) * 60}px`,
                                                        left: '2%',
                                                        width: '96%',
                                                        height: `${durationMinutes}px`,
                                                        zIndex: 10,
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSlotClick(dayStr, slot.start.getHours());
                                                    }}
                                                >
                                                    Disponible
                                                </div>
                                            );
                                        })}

                                        {/* Render appointments */}
                                        {slotApps.map((app, index) => {
                                            const vehicleColors = getVehicleColor(app.vehicle_id || 'default');

                                            // Override colors if cancelled or completed
                                            let finalColors = vehicleColors;
                                            if (app.status === 'completed') {
                                                finalColors = { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' };
                                            } else if (app.status === 'cancelled') {
                                                finalColors = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };
                                            }

                                            const appStartMinute = parseInt(app.start_time.split(':')[1]);
                                            const appDuration = app.class_type?.duration_minutes || 60;

                                            return (
                                                <div
                                                    key={app.id}
                                                    className={cn(
                                                        "absolute rounded p-1 text-xs border shadow-sm cursor-pointer hover:shadow-md transition-shadow z-20",
                                                        finalColors.bg,
                                                        finalColors.border,
                                                        finalColors.text,
                                                        app.status === 'cancelled' && "line-through opacity-60"
                                                    )}
                                                    style={{
                                                        top: `${(appStartMinute / 60) * 60}px`,
                                                        left: `${index * widthPercent}%`,
                                                        width: `${widthPercent - 2}%`,
                                                        height: `${appDuration}px`
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent slot click
                                                        handleAppointmentClick(app);
                                                    }}
                                                >
                                                    <div className="font-semibold truncate text-[10px]">
                                                        {app.student?.first_name} {app.student?.last_name}
                                                    </div>
                                                    {app.class_number && app.package?.total_credits && (
                                                        <div className="text-[9px] opacity-90 font-medium">
                                                            {app.class_type?.duration_minutes >= 90
                                                                ? `Clase ${app.class_number} y ${app.class_number + 1}`
                                                                : `Clase ${app.class_number}`} de {app.package.total_credits}
                                                        </div>
                                                    )}
                                                    <div className="truncate opacity-75 text-[9px]">
                                                        {app.start_time.slice(0, 5)} - {app.vehicle?.brand}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <CreateClassDialog
                resources={resources}
                open={createOpen}
                onOpenChange={setCreateOpen}
                defaultDate={selectedDate}
                defaultTime={selectedTime}
            />

            <EditClassDialog
                resources={resources}
                appointment={selectedAppointment}
                open={editOpen}
                onOpenChange={setEditOpen}
                userRole={userRole}
            />
        </div>
    );
}
