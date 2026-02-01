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
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { updateAppointmentStatus } from '@/app/(auth)/dashboard/classes/actions';
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

// Helper to get soft pastel colors for backgrounds but strong borders
function getVehicleColor(vehicleId: string): { bg: string; border: string; text: string; indicator: string } {
    const colors = [
        { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', indicator: 'bg-blue-500' },
        { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', indicator: 'bg-purple-500' },
        { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', indicator: 'bg-pink-500' },
        { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', indicator: 'bg-orange-500' },
        { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', indicator: 'bg-teal-500' },
        { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', indicator: 'bg-cyan-500' },
        { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', indicator: 'bg-indigo-500' },
        { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', indicator: 'bg-emerald-500' },
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
    const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);

    // Current time indicator logic
    const [now, setNow] = useState(new Date());
    React.useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

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
    const weekDays = useMemo(() => {
        if (view === 'day') {
            return [currentDate];
        }
        return Array.from({ length: 7 }).map((_, i) => addDays(monday, i)); // Mon-Sun
    }, [currentDate, view, monday]);

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
        <div className="flex flex-col h-full border rounded-xl bg-white text-card-foreground shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 hover:bg-gray-100">
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </Button>
                    <span className="text-xl font-bold capitalize text-gray-800 ml-2 mr-2 min-w-[180px] text-center">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 hover:bg-gray-100">
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={showAvailability ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowAvailability(!showAvailability)}
                        className={cn("text-xs", showAvailability ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "text-gray-600")}
                    >
                        {showAvailability ? "Ocultar Disp." : "Ver Disponibilidad"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToday} className="text-xs text-gray-600">
                        Hoy
                    </Button>
                    <Select defaultValue={view} onValueChange={(v) => {
                        router.push(`/dashboard/classes?date=${format(currentDate, 'yyyy-MM-dd')}&view=${v}`);
                    }}>
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                            <SelectValue placeholder="Vista" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Semana</SelectItem>
                            <SelectItem value="day">Día</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Calendar Grid (Column-based for better overlap handling) */}
            <div className="flex-1 overflow-auto bg-white relative">
                <div className={cn("min-w-[800px]", view === 'day' && "min-w-full")}>
                    <div className={cn(
                        "grid",
                        view === 'day' ? "grid-cols-[60px_1fr]" : "grid-cols-[60px_repeat(7,1fr)]"
                    )}>
                        {/* Header Row (Days) */}
                        <div className="p-2 border-r border-gray-200 text-[10px] font-medium text-gray-400 text-center content-center bg-white sticky top-0 z-30 shadow-sm">GMT-3</div>
                        {weekDays.map((day) => (
                            <div key={day.toString()} className={cn(
                                "py-3 px-2 text-center border-r border-gray-200 bg-white sticky top-0 z-30 shadow-sm flex flex-col items-center justify-center gap-1",
                                isSameDay(day, new Date()) && "bg-blue-50/30"
                            )}>
                                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                    {format(day, 'EEE', { locale: es })}
                                </div>
                                <div className={cn(
                                    "text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                                    isSameDay(day, new Date()) ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-800"
                                )}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}

                        {/* Time Labels Column */}
                        <div className="bg-white sticky left-0 z-20 border-r border-gray-200">
                            {timeSlots.map((hour) => (
                                <div key={hour} className="h-[60px] border-b border-gray-200 text-[10px] font-medium text-gray-400 text-right pr-3 pt-2 relative">
                                    <span className="-top-2 absolute right-3">{`${hour}:00`}</span>
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {weekDays.map((day) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const isToday = isSameDay(day, now);
                            let currentTimeTop = -1;

                            if (isToday) {
                                const hours = now.getHours();
                                const minutes = now.getMinutes();
                                if (hours >= 8 && hours < 21) {
                                    currentTimeTop = ((hours - 8) * 60) + minutes;
                                }
                            }

                            // Filter appointments for this day
                            const dayApps = appointments.filter(app =>
                                app.scheduled_date === dayStr
                            ).sort((a, b) => { // Sort by start time, then duration
                                const startA = parseInt(a.start_time.split(':')[0]) * 60 + parseInt(a.start_time.split(':')[1]);
                                const startB = parseInt(b.start_time.split(':')[0]) * 60 + parseInt(b.start_time.split(':')[1]);
                                if (startA !== startB) return startA - startB;
                                return (b.class_type?.duration_minutes || 60) - (a.class_type?.duration_minutes || 60);
                            });

                            const otherApps: any[] = []; // Reserved for filtered out apps if needed

                            return (
                                <div key={day.toString()} className={cn(
                                    "border-r border-gray-200 relative min-h-[780px]", // 13 slots * 60px
                                    isSameDay(day, new Date()) ? "bg-blue-50/10" : "bg-white"
                                )}>
                                    {/* Current Time Indicator Line */}
                                    {isToday && currentTimeTop >= 0 && (
                                        <div
                                            className="absolute w-full z-40 pointer-events-none flex items-center"
                                            style={{ top: `${currentTimeTop}px` }}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                                            <div className="h-[2px] bg-red-500 w-full shadow-[0_0_4px_rgba(239,68,68,0.4)]"></div>
                                        </div>
                                    )}

                                    {/* Background Slots (Clickable) */}
                                    {timeSlots.map((hour) => (
                                        <div
                                            key={hour}
                                            className="h-[60px] border-b border-gray-200 transition-colors hover:bg-gray-50/50"
                                            onClick={() => handleSlotClick(dayStr, hour)}
                                        />
                                    ))}

                                    {/* Availability Layer */}
                                    {showAvailability && timeSlots.map(hour => {
                                        const freeSlots = calculateFreeSlots(day, hour);
                                        return freeSlots.map((slot, idx) => {
                                            const startMin = slot.start.getMinutes();
                                            const duration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
                                            const topOffset = ((hour - 8) * 60) + startMin;

                                            return (
                                                <div
                                                    key={`free-${hour}-${idx}`}
                                                    className="absolute bg-emerald-50/80 border border-emerald-100 text-emerald-600 rounded-md p-1 text-[10px] font-medium flex items-center justify-center z-10 cursor-pointer pointer-events-auto hover:bg-emerald-100 transition-colors"
                                                    style={{
                                                        top: `${topOffset}px`,
                                                        left: '2%',
                                                        width: '96%',
                                                        height: `${duration}px`,
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSlotClick(dayStr, slot.start.getHours());
                                                    }}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Libre
                                                </div>
                                            )
                                        });
                                    })}

                                    {/* Active Apps Layer with Grouping */}
                                    {(() => {
                                        // Simple clustering: group overlapping intervals
                                        const clusters: { start: number; end: number; apps: any[] }[] = [];

                                        dayApps.forEach(app => {
                                            const appStart = parseInt(app.start_time.split(':')[0]) * 60 + parseInt(app.start_time.split(':')[1]);
                                            const duration = app.class_type?.duration_minutes || 60;
                                            const appEnd = appStart + duration;

                                            const lastCluster = clusters[clusters.length - 1];
                                            if (lastCluster && appStart < lastCluster.end - 10) {
                                                lastCluster.apps.push(app);
                                                lastCluster.end = Math.max(lastCluster.end, appEnd);
                                            } else {
                                                clusters.push({ start: appStart, end: appEnd, apps: [app] });
                                            }
                                        });

                                        return clusters.map((cluster, cIdx) => {
                                            const isGrouped = cluster.apps.length > 2; // "Mas de 2" -> 3 or more
                                            const clusterKey = `${dayStr}-${cIdx}`;

                                            if (isGrouped) {
                                                const topOffset = cluster.start - (8 * 60);
                                                const duration = Math.max((cluster.end - cluster.start), 60);
                                                const isOpen = expandedClusterId === clusterKey;

                                                return (
                                                    <div
                                                        key={clusterKey}
                                                        className={cn("absolute", isOpen ? "z-50" : "z-20")}
                                                        style={{ top: `${topOffset}px`, left: '1%', width: '98%', height: `${duration}px` }}
                                                    >
                                                        {/* Summary Card */}
                                                        <div
                                                            className="w-full h-full rounded-md bg-slate-800 text-white border border-slate-700 shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition-all p-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedClusterId(isOpen ? null : clusterKey);
                                                            }}
                                                        >
                                                            <div className="font-bold text-sm text-center leading-tight">
                                                                {cluster.apps.length} Clases
                                                            </div>
                                                            <div className="text-[10px] opacity-70 text-center font-light">
                                                                {new Set(cluster.apps.map(a => a.vehicle_id)).size} Vehículos
                                                            </div>
                                                            {!isOpen && <div className="text-[9px] mt-1 opacity-50">Click para ver</div>}
                                                        </div>

                                                        {/* Dropdown / Details List */}
                                                        {isOpen && (
                                                            <div
                                                                className="absolute top-full mt-2 left-0 min-w-[220px] w-full bg-white border border-gray-200 shadow-xl rounded-lg z-50 p-2 max-h-[300px] overflow-y-auto ring-1 ring-black/5"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="flex justify-between items-center mb-2 px-1 border-b pb-2">
                                                                    <span className="text-xs font-bold text-gray-700">Detalle de Clases</span>
                                                                    <div
                                                                        className="p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                                                                        onClick={() => setExpandedClusterId(null)}
                                                                    >
                                                                        <XCircle className="w-4 h-4 text-gray-400" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {cluster.apps.map(app => {
                                                                        const vColors = getVehicleColor(app.vehicle_id || 'default');
                                                                        const appDur = app.class_type?.duration_minutes || 60;

                                                                        // Custom styling for status
                                                                        let statusStyle = vColors;
                                                                        // Force pastel/light colors regardless
                                                                        if (app.status === 'completed') statusStyle = { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', indicator: 'bg-green-500' };
                                                                        if (app.status === 'cancelled') statusStyle = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', indicator: 'bg-red-500' };

                                                                        return (
                                                                            <div
                                                                                key={app.id}
                                                                                className={cn(
                                                                                    "p-2 rounded-md border text-xs cursor-pointer hover:shadow-md transition-all relative overflow-hidden pl-3",
                                                                                    statusStyle.bg, statusStyle.border, statusStyle.text,
                                                                                    app.status === 'cancelled' && "opacity-70"
                                                                                )}
                                                                                onClick={() => handleAppointmentClick(app)}
                                                                            >
                                                                                <div className={cn("absolute left-0 top-0 bottom-0 w-1", statusStyle.indicator)}></div>
                                                                                <div className="flex justify-between items-start">
                                                                                    <div className="font-bold">{app.student?.first_name} {app.student?.last_name}</div>
                                                                                    {app.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-600" />}
                                                                                    {app.status === 'cancelled' && <XCircle className="w-3 h-3 text-red-600" />}
                                                                                </div>
                                                                                <div className="flex justify-between mt-1 text-[10px] opacity-80">
                                                                                    <span>{app.start_time.slice(0, 5)} - {app.vehicle?.brand}</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            // Render Individual items (Standard column logic for this cluster)
                                            // Mini-layout engine for non-grouped items
                                            const subCols: any[][] = [];
                                            cluster.apps.forEach(app => {
                                                const appStart = parseInt(app.start_time.split(':')[0]) * 60 + parseInt(app.start_time.split(':')[1]);
                                                const duration = app.class_type?.duration_minutes || 60;
                                                const appEnd = appStart + duration;

                                                let placed = false;
                                                for (let i = 0; i < subCols.length; i++) {
                                                    const last = subCols[i][subCols[i].length - 1];
                                                    const lastEnd = (parseInt(last.start_time.split(':')[0]) * 60 + parseInt(last.start_time.split(':')[1])) + (last.class_type?.duration_minutes || 60);
                                                    if (appStart >= lastEnd) {
                                                        subCols[i].push(app);
                                                        placed = true;
                                                        break;
                                                    }
                                                }
                                                if (!placed) subCols.push([app]);
                                            });

                                            return cluster.apps.map(app => {
                                                const appStart = parseInt(app.start_time.split(':')[0]) * 60 + parseInt(app.start_time.split(':')[1]);
                                                const topOffset = appStart - (8 * 60);
                                                const duration = app.class_type?.duration_minutes || 60;
                                                const isSmall = duration < 50;

                                                const vehicleColors = getVehicleColor(app.vehicle_id || 'default');

                                                // Calculate End Time
                                                const endMins = appStart + duration;
                                                const endHrs = Math.floor(endMins / 60);
                                                const endMinRem = endMins % 60;
                                                const endTimeStr = `${endHrs.toString().padStart(2, '0')}:${endMinRem.toString().padStart(2, '0')}`;

                                                // Custom styling for status on individual cards
                                                let statusStyle = vehicleColors;
                                                if (app.status === 'completed') statusStyle = { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', indicator: 'bg-green-500' };
                                                if (app.status === 'cancelled') statusStyle = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', indicator: 'bg-red-500' };

                                                let colIndex = 0;
                                                subCols.forEach((col, i) => { if (col.includes(app)) colIndex = i; });
                                                const width = 96 / subCols.length;
                                                const left = (width * colIndex) + 2;

                                                return (
                                                    <ContextMenu key={app.id}>
                                                        <ContextMenuTrigger>
                                                            <div
                                                                className={cn(
                                                                    "absolute rounded-md text-xs shadow-sm cursor-pointer transition-all duration-200 z-20 hover:z-30 hover:shadow-md flex flex-col justify-start overflow-hidden border",
                                                                    // Reduce padding for small cards
                                                                    isSmall ? "p-1 pl-2" : "p-1.5 pl-2.5",
                                                                    statusStyle.bg,
                                                                    statusStyle.border,
                                                                    statusStyle.text,
                                                                    app.status === 'cancelled' && "opacity-60 grayscale-[0.5]"
                                                                )}
                                                                style={{
                                                                    top: `${topOffset}px`,
                                                                    left: `${left}%`,
                                                                    width: `${width}%`,
                                                                    height: `${duration}px`,
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAppointmentClick(app);
                                                                }}
                                                            >
                                                                <div className={cn("absolute left-0 top-0 bottom-0 w-1", statusStyle.indicator)}></div>

                                                                <div className="w-full">
                                                                    <div className={cn(
                                                                        "font-bold truncate leading-tight w-full flex items-center justify-between gap-1",
                                                                        isSmall ? "text-[10px] mb-0" : "text-[11px] mb-0.5"
                                                                    )}>
                                                                        <span className="truncate">
                                                                            {app.student?.first_name} {app.student?.last_name}
                                                                        </span>
                                                                    </div>

                                                                    <div className="truncate opacity-80 text-[10px] font-medium flex items-center gap-1">
                                                                        <Clock className="w-3 h-3 inline opacity-70" /> {app.start_time.slice(0, 5)} - {endTimeStr}
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-between items-end mt-auto w-full">
                                                                    <div className="text-[9px] opacity-75 truncate max-w-[70%]">
                                                                        {app.vehicle?.brand}
                                                                    </div>
                                                                    {app.class_number && app.package?.total_credits && (
                                                                        <div className={cn(
                                                                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0",
                                                                            "bg-white/40 shadow-sm"
                                                                        )}>
                                                                            {(app.class_type?.duration_minutes || 60) >= 85
                                                                                ? `${app.class_number} y ${app.class_number + 1}`
                                                                                : app.class_number}
                                                                            /{app.package.total_credits}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </ContextMenuTrigger>
                                                        <ContextMenuContent className="w-48">
                                                            <ContextMenuItem onClick={() => handleAppointmentClick(app)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Editar clase
                                                            </ContextMenuItem>
                                                            <ContextMenuSeparator />
                                                            <ContextMenuItem
                                                                disabled={app.status === 'completed'}
                                                                onClick={async () => {
                                                                    await updateAppointmentStatus(app.id, 'completed');
                                                                    router.refresh();
                                                                }}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                Marcar Completado
                                                            </ContextMenuItem>
                                                            <ContextMenuItem
                                                                disabled={app.status === 'cancelled'}
                                                                onClick={async () => {
                                                                    if (confirm('¿Cancelar esta clase?')) {
                                                                        await updateAppointmentStatus(app.id, 'cancelled');
                                                                        router.refresh();
                                                                    }
                                                                }}
                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Cancelar clase
                                                            </ContextMenuItem>
                                                        </ContextMenuContent>
                                                    </ContextMenu>
                                                );
                                            });
                                        });

                                    })()}

                                    {/* Completed/Cancelled Apps (Simplified Render) */}
                                    {otherApps.map(app => {
                                        const appStart = parseInt(app.start_time.split(':')[0]) * 60 + parseInt(app.start_time.split(':')[1]);
                                        const topOffset = appStart - (8 * 60);
                                        const duration = app.class_type?.duration_minutes || 60;

                                        let finalColors = { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-500' };
                                        if (app.status === 'completed') finalColors = { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
                                        if (app.status === 'cancelled') finalColors = { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-300' };

                                        return (
                                            <div
                                                key={app.id}
                                                className={cn(
                                                    "absolute rounded p-1 text-[10px] border opacity-60 z-10",
                                                    finalColors.bg,
                                                    finalColors.border,
                                                    finalColors.text,
                                                    app.status === 'cancelled' && "line-through"
                                                )}
                                                style={{
                                                    top: `${topOffset}px`,
                                                    left: '2%',
                                                    width: '96%',
                                                    height: `${duration}px`,
                                                }}
                                            >
                                                {app.student?.first_name} - {app.status}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div >

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
        </div >
    );
}
