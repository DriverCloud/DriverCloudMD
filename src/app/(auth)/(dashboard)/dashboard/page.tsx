import {
    Users,
    Calendar,
    DollarSign,
    Car,
    TrendingUp,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats } from './actions';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ActivityChart } from '@/components/dashboard/ActivityChart';

export default async function DashboardPage() {
    const supabase = await createClient();

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const formattedDate = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    // Fetch active students count
    const { count: activeStudentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .is('deleted_at', null);

    // Fetch today's appointments
    const { data: todayAppointments, count: todayAppointmentsCount } = await supabase
        .from('appointments')
        .select('*, students(first_name, last_name), instructors(first_name, last_name), class_types(name)', { count: 'exact' })
        .eq('scheduled_date', today)
        .is('deleted_at', null)
        .order('start_time', { ascending: true });

    // Fetch completed appointments today
    const { count: completedTodayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('scheduled_date', today)
        .eq('status', 'completed')
        .is('deleted_at', null);

    // Fetch vehicles
    const { count: totalVehiclesCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

    const { count: activeVehiclesCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .is('deleted_at', null);

    // Fetch upcoming appointments (next 3)
    const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select('*, students(first_name, last_name), instructors(first_name, last_name), class_types(name)')
        .gte('scheduled_date', today)
        .eq('status', 'scheduled')
        .is('deleted_at', null)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(3);

    // Fetch recent payments (last 3)
    const { data: recentPayments } = await supabase
        .from('payments')
        .select('*, students(first_name, last_name)')
        .eq('payment_status', 'completed')
        .is('deleted_at', null)
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

    // Calculate totals
    const totalStudents = activeStudentsCount || 0;
    const totalAppointmentsToday = todayAppointmentsCount || 0;
    const completedToday = completedTodayCount || 0;
    const totalVehicles = totalVehiclesCount || 0;
    const activeVehicles = activeVehiclesCount || 0;
    const maintenanceVehicles = totalVehicles - activeVehicles;
    const completionPercentage = totalAppointmentsToday > 0 ? Math.round((completedToday / totalAppointmentsToday) * 100) : 0;

    // Fetch Analytics Stats
    const stats = await getDashboardStats();

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Panel de Control</h2>
                    <p className="text-muted-foreground mt-1">{formattedDate}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        Exportar Reporte
                    </Button>
                    <Button>
                        Nueva Clase
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* KPI 1: Revenue */}
                <div className="bg-card rounded-xl p-6 shadow-sm border flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Ingresos Mensuales</p>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight">${stats.currentMonthRevenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {stats.revenueTrend > 0 ? (
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            ) : (
                                <TrendingUp className="h-4 w-4 text-rose-600 transform rotate-180" />
                            )}
                            <p className={cn("text-sm font-medium", stats.revenueTrend > 0 ? "text-emerald-600" : "text-rose-600")}>
                                {stats.revenueTrend > 0 ? '+' : ''}{stats.revenueTrend}%
                            </p>
                            <p className="text-muted-foreground text-sm ml-1">vs mes anterior</p>
                        </div>
                    </div>
                </div>

                {/* KPI 2: Active Students */}
                <div className="bg-card rounded-xl p-6 shadow-sm border flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Alumnos Activos</p>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight">{totalStudents}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <div className="h-4 w-4 flex items-center justify-center text-emerald-600 font-bold">✓</div>
                            <p className="text-muted-foreground text-sm font-medium">estudiantes activos</p>
                        </div>
                    </div>
                </div>

                {/* KPI 3: Classes Today */}
                <div className="bg-card rounded-xl p-6 shadow-sm border flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Clases Hoy</p>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Calendar className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <p className="text-3xl font-bold tracking-tight">{completedToday}<span className="text-muted-foreground text-xl font-normal">/{totalAppointmentsToday}</span></p>
                            <p className="text-muted-foreground text-xs font-medium mb-1">{completionPercentage}% Completado</p>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* KPI 4: Vehicles */}
                <div className="bg-card rounded-xl p-6 shadow-sm border flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Vehículos Disp.</p>
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                            <Car className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold tracking-tight">{activeVehicles} <span className="text-muted-foreground text-xl font-normal">de {totalVehicles}</span></p>
                        <div className="flex items-center gap-1 mt-1">
                            {maintenanceVehicles > 0 && (
                                <>
                                    <div className="h-4 w-4 bg-orange-50 rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-orange-500 rounded-full"></div></div>
                                    <p className="text-orange-600 text-sm font-medium">{maintenanceVehicles} en taller</p>
                                </>
                            )}
                            {maintenanceVehicles === 0 && (
                                <p className="text-emerald-600 text-sm font-medium">Todos disponibles</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="w-full bg-card rounded-xl p-6 shadow-sm border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Ingresos (Últimos 6 Meses)</h3>
                    </div>
                    <RevenueChart data={stats.revenueChartData} />
                </div>
                <div className="w-full bg-card rounded-xl p-6 shadow-sm border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Actividad Semanal</h3>
                    </div>
                    <ActivityChart data={stats.activityChartData} />
                </div>
            </div>

            {/* Bottom Grid: Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Classes */}
                <div className="bg-card rounded-xl shadow-sm border overflow-hidden flex flex-col">
                    <div className="p-6 border-b flex justify-between items-center bg-muted/30">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Calendar className="text-primary h-5 w-5" />
                            Próximas Clases
                        </h3>
                        <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">Ver todas</a>
                    </div>
                    <div className="divide-y">
                        {/* Items */}
                        {upcomingAppointments && upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((appointment, i) => {
                                const appointmentDate = new Date(appointment.scheduled_date);
                                const isToday = appointmentDate.toISOString().split('T')[0] === today;
                                const isTomorrow = new Date(appointmentDate.getTime() + 86400000).toISOString().split('T')[0] === today;
                                const dayLabel = isToday ? 'Hoy' : isTomorrow ? 'Mañ' : appointmentDate.getDate().toString();
                                const isPractical = appointment.class_types?.name?.toLowerCase().includes('práctica');

                                return (
                                    <div key={appointment.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("flex flex-col items-center justify-center rounded-lg w-14 h-14 min-w-[3.5rem]",
                                                isPractical ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                                            )}>
                                                <span className="text-xs font-bold uppercase">{dayLabel}</span>
                                                <span className="text-lg font-bold">{appointment.start_time?.slice(0, 5)}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{appointment.students?.first_name} {appointment.students?.last_name}</p>
                                                <p className="text-muted-foreground text-sm flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    Instr. {appointment.instructors?.first_name} {appointment.instructors?.last_name}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold",
                                            isPractical ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                        )}>
                                            {appointment.class_types?.name || 'Clase'}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No hay clases programadas próximamente</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-card rounded-xl shadow-sm border overflow-hidden flex flex-col">
                    <div className="p-6 border-b flex justify-between items-center bg-muted/30">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <DollarSign className="text-emerald-600 h-5 w-5" />
                            Pagos Recientes
                        </h3>
                        <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">Ver historial</a>
                    </div>
                    <div className="divide-y">
                        {recentPayments && recentPayments.length > 0 ? (
                            recentPayments.map((payment, i) => {
                                const paymentDate = new Date(payment.payment_date);
                                const isToday = paymentDate.toISOString().split('T')[0] === today;
                                const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
                                const isYesterday = paymentDate.toISOString().split('T')[0] === yesterday;

                                let timeLabel = '';
                                if (isToday) {
                                    timeLabel = 'Hoy';
                                } else if (isYesterday) {
                                    timeLabel = 'Ayer';
                                } else {
                                    timeLabel = `${paymentDate.getDate()}/${paymentDate.getMonth() + 1}`;
                                }

                                const icon = payment.payment_method === 'card' ? CreditCard : DollarSign;
                                const color = payment.payment_status === 'completed' ? 'green' : 'gray';

                                return (
                                    <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-2.5 rounded-full",
                                                color === "green" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"
                                            )}>
                                                {icon === CreditCard ? <CreditCard className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{payment.students?.first_name} {payment.students?.last_name}</p>
                                                <p className="text-muted-foreground text-xs">{timeLabel}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-lg">+${payment.amount}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No hay pagos recientes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
