'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarView } from '@/components/classes/CalendarView';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';
import { StudentClassesView } from '@/components/dashboard/student/StudentClassesView';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export default function ClassesPage() {
    const searchParams = useSearchParams();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [resources, setResources] = useState<any>({ students: [], instructors: [], vehicles: [], classTypes: [] });
    const [loading, setLoading] = useState(true);
    const [isInstructor, setIsInstructor] = useState(false);
    const [isStudent, setIsStudent] = useState(false);

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
                // Get Role & Student ID (Client Side check)
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                let isStudent = false;
                let studentId = null;

                if (user) {
                    const { data: membership } = await supabase.from('memberships').select('role').eq('user_id', user.id).single();
                    if (membership?.role === 'instructor') setIsInstructor(true);
                    if (membership?.role === 'student') {
                        isStudent = true;
                        setIsStudent(true);
                        // Fetch linked student ID
                        const { data: studentRecord } = await supabase.from('students').select('id').eq('user_id', user.id).single();
                        studentId = studentRecord?.id;
                    }
                }

                if (isStudent && studentId) {
                    // STUDENT MODE: Fetch ALL appointments (upcoming & history) to show in tabs
                    // For now, let's fetch a wide range (e.g. past year to next year?) 
                    // Or modify API to not require dates?
                    // Let's stick to the current API range for consistency, BUT for Student View we probably want EVERYTHING.
                    // Let's widen the range significantly for Student View or call API without dates if updated.
                    // Using a 6 month window for MVP.
                    const studStart = '2025-01-01'; // MVP fixed start
                    const studEnd = '2025-12-31';   // MVP fixed end
                    const res = await fetch(`/api/appointments?start=${studStart}&end=${studEnd}&student_id=${studentId}`).then(r => r.json());
                    setAppointments(res.data || []);
                } else {
                    // ADMIN/INSTRUCTOR MODE: Default fetch
                    const [appointmentsRes, resourcesRes] = await Promise.all([
                        fetch(`/api/appointments?start=${startStr}&end=${endStr}`).then(r => r.json()),
                        fetch(`/api/resources`).then(r => r.json())
                    ]);
                    setAppointments(appointmentsRes.data || []);
                    setResources(resourcesRes);
                }

                // Expose state for rendering check
                // However, we need a way to tell the render logic which view to use.
                // We can use a state variable.
                if (isStudent) {
                    // We need a state specifically for "Student Mode View"
                    // reusing isInstructor for now isn't enough.
                    // Let's add setViewMode('student') logic.
                }

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
                    {!isInstructor && <CreateClassDialog resources={resources} />}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            ) : isStudent ? (
                <StudentClassesView appointments={appointments} loading={loading} />
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

