import { getAppointments, getResources } from './actions';
import { CalendarView } from '@/components/classes/CalendarView';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';
import { StudentClassesView } from '@/components/dashboard/student/StudentClassesView';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { createClient } from '@/lib/supabase/server';

export default async function ClassesPage({
    searchParams
}: {
    searchParams: Promise<{ date?: string; view?: string }>;
}) {
    const params = await searchParams;
    const dateParam = params.date;
    const viewParam = params.view;

    const date = dateParam ? new Date(dateParam) : new Date();
    const view = viewParam || 'week';

    // Calculate range based on view
    let start = date;
    let end = date;

    if (view === 'week') {
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = endOfWeek(date, { weekStartsOn: 1 });
    }

    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isInstructor = false;
    let isStudent = false;
    let studentId = null;

    if (user) {
        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (membership?.role === 'instructor') isInstructor = true;
        if (membership?.role === 'student') {
            isStudent = true;
            const { data: studentRecord } = await supabase
                .from('students')
                .select('id')
                .eq('user_id', user.id)
                .single();
            studentId = studentRecord?.id;
        }
    }

    let appointments: any[] = [];
    let resources: any = { students: [], instructors: [], vehicles: [], classTypes: [] };

    if (isStudent && studentId) {
        // Fetch wider range for student view
        const studStart = '2025-01-01';
        const studEnd = '2025-12-31';
        const res = await getAppointments(studStart, studEnd, studentId);
        appointments = res.data || [];
    } else {
        const [appRes, resRes] = await Promise.all([
            getAppointments(startStr, endStr),
            getResources()
        ]);
        appointments = appRes.data || [];
        resources = resRes;
    }

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

            {isStudent ? (
                <StudentClassesView appointments={appointments} loading={false} />
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
