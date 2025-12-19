import { createClient } from "@/lib/supabase/server"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Activity,
    DollarSign,
    Users,
    Car,
    CalendarDays,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ActivityChart } from "@/components/dashboard/ActivityChart"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get User Role
    const { data: { user } } = await supabase.auth.getUser();
    let userRole = null;
    if (user) {
        const { data: membership } = await supabase.from('memberships').select('role').eq('user_id', user.id).single();
        userRole = membership?.role;
    }
    const isInstructor = userRole === 'instructor';

    // Dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
    const today = now.toISOString().split('T')[0];

    // Fetch Data Parallelly
    const [
        { count: activeStudents },
        { data: monthlyPayments },
        { data: previousMonthPayments },
        { data: todaysClasses },
        { data: vehicles },
        { data: recentClasses },
        { data: recentPayments },
        { data: weeklyStats } // We'll fetch appointments for last 7 days for the chart
    ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
        !isInstructor ? supabase.from('payments').select('amount').gte('payment_date', startOfMonth).lte('payment_date', endOfMonth) : Promise.resolve({ data: [] }),
        !isInstructor ? supabase.from('payments').select('amount').gte('payment_date', startOfPreviousMonth).lte('payment_date', endOfPreviousMonth) : Promise.resolve({ data: [] }),
        supabase.from('appointments').select('id, status').eq('scheduled_date', today),
        supabase.from('vehicles').select('status').is('deleted_at', null),
        supabase.from('appointments')
            .select(`
                id, 
                scheduled_date, 
                start_time, 
                status,
                student:students(first_name, last_name),
                instructor:instructors(first_name, last_name),
                vehicle:vehicles(brand, model)
            `)
            .gte('scheduled_date', today)
            .order('scheduled_date', { ascending: true })
            .order('start_time', { ascending: true })
            .limit(3),
        !isInstructor ? supabase.from('payments')
            .select(`
                id, 
                amount, 
                created_at, 
                description:notes,
                student:students(first_name, last_name)
            `)
            .order('created_at', { ascending: false })
            .limit(3) : Promise.resolve({ data: [] }),
        // Chart data: last 7 days
        supabase.from('appointments').select('scheduled_date').gte('scheduled_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ]);

    // KPI Calculations
    const totalIncome = monthlyPayments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const previousIncome = previousMonthPayments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

    let growthPercentage = 0;
    if (previousIncome > 0) {
        growthPercentage = ((totalIncome - previousIncome) / previousIncome) * 100;
    } else if (totalIncome > 0) {
        growthPercentage = 100;
    }

    // Vehicles
    const totalVehicles = vehicles?.length || 0;
    const availableVehicles = vehicles?.filter((v: any) => v.status === 'active').length || 0;
    const maintenanceVehicles = vehicles?.filter((v: any) => v.status === 'maintenance').length || 0;

    // Classes Today
    const totalClassesToday = todaysClasses?.length || 0;
    const completedClassesToday = todaysClasses?.filter((c: any) => c.status === 'completed').length || 0;
    const progressPercentage = totalClassesToday > 0 ? (completedClassesToday / totalClassesToday) * 100 : 0;

    // Chart Data Processing
    // Generate last 7 days labels
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];

        const count = weeklyStats?.filter((a: any) => a.scheduled_date === dateStr).length || 0;
        chartData.push({ name: dayName, total: count });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    {!isInstructor && <Button>Descargar Reporte</Button>}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {!isInstructor && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalIncome)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {growthPercentage !== 0 && (
                                    <span className={growthPercentage >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                                        {growthPercentage > 0 ? "+" : ""}{growthPercentage.toFixed(1)}%
                                    </span>
                                )}
                                {" "}vs mes anterior
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total registrados activos
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedClassesToday} / {totalClassesToday}</div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                            <div
                                className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vehículos Disponibles</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableVehicles} / {totalVehicles}</div>
                        <p className="text-xs text-muted-foreground text-yellow-600 font-medium">
                            {maintenanceVehicles} en mantenimiento
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Main Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Actividad de Clases</CardTitle>
                        <CardDescription>
                            Clases agendadas en los últimos 7 días.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ActivityChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Quick Lists */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Próximas Clases</CardTitle>
                        <CardDescription>
                            Próximos turnos agendados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentClasses && recentClasses.length > 0 ? (
                                recentClasses.map((cls: any) => (
                                    <div key={cls.id} className="flex items-center">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <CalendarDays className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {cls.start_time.slice(0, 5)} - {cls.student?.first_name} {cls.student?.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Inst. {cls.instructor?.first_name}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs capitalize">
                                            {cls.status === 'scheduled' ? 'Agendado' : cls.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay clases próximas.</p>
                            )}
                        </div>

                        {!isInstructor && (
                            <div className="mt-8">
                                <h4 className="text-sm font-medium mb-4">Pagos Recientes</h4>
                                <div className="space-y-4">
                                    {recentPayments && recentPayments.length > 0 ? (
                                        (recentPayments as any[]).map((payment: any) => (
                                            <div key={payment.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <DollarSign className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                    <div className="grid gap-0.5">
                                                        <span className="text-sm font-medium">
                                                            {payment.student?.first_name} {payment.student?.last_name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(payment.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium">
                                                    +{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(payment.amount)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No hay pagos recientes.</p>
                                    )}
                                </div>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
