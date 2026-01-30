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
    const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);

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

            {/* Calendar Grid (Column-based for better overlap handling) */}
            <div className="flex-1 overflow-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                        {/* Header Row (Days) */}
                        <div className="p-2 border-r text-xs text-muted-foreground text-center content-center bg-muted/20 sticky top-0 z-30">Hora</div>
                        {weekDays.map((day) => (
                            <div key={day.toString()} className={cn(
                                "p-2 text-center border-r last:border-r-0 bg-muted/20 sticky top-0 z-30",
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

                        {/* Time Labels Column */}
                        <div className="bg-background sticky left-0 z-20 border-r border-b-0">
                            {timeSlots.map((hour) => (
                                <div key={hour} className="h-[60px] border-b text-xs text-muted-foreground text-right pr-2 pt-1 relative">
                                    <span className="-top-2.5 absolute right-2">{`${hour}:00`}</span>
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {weekDays.map((day) => {
                            const dayStr = format(day, 'yyyy-MM-dd');

                            // Filter appointments for this day
                            // We now include 'completed' and 'cancelled' in the main flow so they don't break the layout structure.
                            // However, we might want to hide cancelled or simple cross them out. 
                            // The user specifically asked for 'completed' to remain in the structure.
                            // Let's include everything except maybe rejected/deleted if those existed. 
                            const dayApps = appointments.filter(app =>
                                app.scheduled_date === dayStr
                                // We include ALL statuses so the grid structure remains consistent.
                                // If you want to hide cancelled, uncomment the next line:
                                // && app.status !== 'cancelled'
                            ).sort((a, b) => { // Sort by start time, then duration
                                const startA = parseInt(a.start_time.split(':')[0]) * 60 + parseInt(a.start_time.split(':')[1]);
                                const startB = parseInt(b.start_time.split(':')[0]) * 60 + parseInt(b.start_time.split(':')[1]);
                                if (startA !== startB) return startA - startB;
                                return (b.class_type?.duration_minutes || 60) - (a.class_type?.duration_minutes || 60);
                            });

                            // otherApps is now likely empty or reserved for really special statuses if any
                            const otherApps: any[] = [];

                            return (
                                <div key={day.toString()} className={cn(
                                    "border-r last:border-r-0 relative min-h-[780px]", // 13 slots * 60px
                                    isSameDay(day, new Date()) && "bg-primary/5"
                                )}>
                                    {/* Background Slots (Clickable) */}
                                    {timeSlots.map((hour) => (
                                        <div
                                            key={hour}
                                            className="h-[60px] border-b hover:bg-muted/5 transition-colors"
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
                                                    className="absolute bg-green-200/50 border border-green-300 text-green-800 rounded p-1 text-[10px] flex items-center justify-center z-10 cursor-pointer pointer-events-auto"
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
                                                    Disponible
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
                                                        className="absolute z-20"
                                                        style={{ top: `${topOffset}px`, left: '1%', width: '98%', height: `${duration}px` }}
                                                    >
                                                        {/* Summary Card */}
                                                        <div
                                                            className="w-full h-full rounded bg-slate-800 text-white border border-slate-700 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors p-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedClusterId(isOpen ? null : clusterKey);
                                                            }}
                                                        >
                                                            <div className="font-bold text-sm text-center leading-tight">
                                                                {cluster.apps.length} Clases
                                                            </div>
                                                            <div className="text-[10px] opacity-80 text-center">
                                                                {new Set(cluster.apps.map(a => a.vehicle_id)).size} Vehículos
                                                            </div>
                                                            {!isOpen && <div className="text-[9px] mt-1 opacity-50">Click para ver</div>}
                                                        </div>

                                                        {/* Dropdown / Details List */}
                                                        {isOpen && (
                                                            <div
                                                                className="absolute top-full mt-1 left-0 min-w-[200px] w-full bg-white border shadow-xl rounded-md z-50 p-2 max-h-[300px] overflow-y-auto"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="flex justify-between items-center mb-2 px-1 border-b pb-1">
                                                                    <span className="text-xs font-bold text-slate-700">Detalle de Clases</span>
                                                                    <div
                                                                        className="p-1 hover:bg-slate-100 rounded cursor-pointer"
                                                                        onClick={() => setExpandedClusterId(null)}
                                                                    >
                                                                        <XCircle className="w-4 h-4 text-slate-400" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {cluster.apps.map(app => {
                                                                        const vColors = getVehicleColor(app.vehicle_id || 'default');
                                                                        const appDur = app.class_type?.duration_minutes || 60;

                                                                        // Custom styling for status
                                                                        let statusStyle = vColors;
                                                                        if (app.status === 'completed') statusStyle = { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
                                                                        if (app.status === 'cancelled') statusStyle = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };

                                                                        return (
                                                                            <div
                                                                                key={app.id}
                                                                                className={cn(
                                                                                    "p-2 rounded border text-xs cursor-pointer hover:shadow-md transition-all",
                                                                                    statusStyle.bg, statusStyle.border, statusStyle.text,
                                                                                    app.status === 'cancelled' && "line-through opacity-70"
                                                                                )}
                                                                                onClick={() => handleAppointmentClick(app)}
                                                                            >
                                                                                <div className="flex justify-between items-start">
                                                                                    <div className="font-bold">{app.student?.first_name} {app.student?.last_name}</div>
                                                                                    {app.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-600" />}
                                                                                    {app.status === 'cancelled' && <XCircle className="w-3 h-3 text-red-600" />}
                                                                                </div>
                                                                                <div className="flex justify-between mt-1 text-[10px] opacity-80">
                                                                                    <span>{app.start_time.slice(0, 5)} - {app.vehicle?.brand}</span>
                                                                                </div>
                                                                                {app.class_number && app.package?.total_credits && (
                                                                                    <div className="mt-1 text-[10px] font-semibold bg-white/40 w-fit px-1 rounded">
                                                                                        Clase {app.class_number} de {app.package.total_credits}
                                                                                    </div>
                                                                                )}
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
                                                const vehicleColors = getVehicleColor(app.vehicle_id || 'default');

                                                // Custom styling for status on individual cards
                                                let statusStyle = vehicleColors;
                                                if (app.status === 'completed') statusStyle = { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
                                                if (app.status === 'cancelled') statusStyle = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };

                                                let colIndex = 0;
                                                subCols.forEach((col, i) => { if (col.includes(app)) colIndex = i; });
                                                const width = 96 / subCols.length;
                                                const left = (width * colIndex) + 2;

                                                return (
                                                    <ContextMenu key={app.id}>
                                                        <ContextMenuTrigger>
                                                            <div
                                                                className={cn(
                                                                    "absolute rounded p-1 text-xs border shadow-sm cursor-pointer transition-all duration-200 z-20 hover:z-30 hover:brightness-95 flex flex-col justify-between overflow-hidden",
                                                                    statusStyle.bg,
                                                                    statusStyle.border,
                                                                    statusStyle.text,
                                                                    app.status === 'cancelled' && "line-through opacity-60"
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
                                                                <div>
                                                                    <div className="font-semibold truncate text-[10px] leading-tight">
                                                                        {app.student?.first_name} {app.student?.last_name}
                                                                    </div>
                                                                    <div className="truncate opacity-75 text-[9px]">
                                                                        {app.start_time.slice(0, 5)} - {app.vehicle?.brand}
                                                                    </div>
                                                                </div>
                                                                {app.class_number && app.package?.total_credits && (
                                                                    <div className="text-[9px] font-bold opacity-90 mt-auto bg-white/20 px-1 rounded w-fit">
                                                                        {app.class_number}/{app.package.total_credits}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </ContextMenuTrigger>
                                                        <ContextMenuContent>
                                                            <ContextMenuItem onClick={() => handleAppointmentClick(app)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Editar
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
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                Cancelar
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
