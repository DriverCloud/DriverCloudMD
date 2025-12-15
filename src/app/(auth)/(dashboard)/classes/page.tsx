import { getAppointments, getResources } from './actions';
import { CalendarView } from '@/components/classes/CalendarView';
import { Button } from '@/components/ui/button';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function ClassesPage({
    searchParams,
}: {
    searchParams: { date?: string; view?: string }
}) {
    const date = searchParams.date ? new Date(searchParams.date) : new Date();
    const view = searchParams.view || 'week'; // 'week' | 'day'

    // Calculate range based on view
    let start = date;
    let end = date;

    if (view === 'week') {
        start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
        end = endOfWeek(date, { weekStartsOn: 1 });
    }

    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    const [appointmentsResult, resources] = await Promise.all([
        getAppointments(startStr, endStr),
        getResources()
    ]);

    const appointments = appointmentsResult.success ? appointmentsResult.data : [];

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

            <CalendarView
                appointments={appointments || []}
                currentDate={date}
                view={view}
                resources={resources}
            />
        </div>
    );
}
