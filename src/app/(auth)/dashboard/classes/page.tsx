'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarView } from '@/components/classes/CalendarView';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export default function ClassesPage() {
    const searchParams = useSearchParams();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [resources, setResources] = useState<any>({ students: [], instructors: [], vehicles: [], classTypes: [] });
    const [loading, setLoading] = useState(true);

    const dateParam = searchParams.get('date');
    const viewParam = searchParams.get('view');

    const date = dateParam ? new Date(dateParam) : new Date();
    const view = viewParam || 'week';

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Calculate range based on view
            let start = date;
            let end = date;

            if (view === 'week') {
                start = startOfWeek(date, { weekStartsOn: 1 });
                end = endOfWeek(date, { weekStartsOn: 1 });
            }

            const startStr = format(start, 'yyyy-MM-dd');
            const endStr = format(end, 'yyyy-MM-dd');

            try {
                const [appointmentsRes, resourcesRes] = await Promise.all([
                    fetch(`/api/appointments?start=${startStr}&end=${endStr}`).then(r => r.json()),
                    fetch(`/api/resources`).then(r => r.json())
                ]);

                setAppointments(appointmentsRes.data || []);
                setResources(resourcesRes);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [dateParam, viewParam]);

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendario de Clases</h1>
                    <p className="text-muted-foreground">
                        Gestiona los turnos y disponibilidad.
                    </p>
                </div>
                <div className="flex gap-2">
                    <CreateClassDialog resources={resources} />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            ) : (
                <CalendarView
                    appointments={appointments}
                    currentDate={date}
                    view={view}
                    resources={resources}
                />
            )}
        </div>
    );
}

