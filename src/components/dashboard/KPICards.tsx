"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, Car } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { paymentsService } from "@/features/finance/services/payments.service";

interface KPICardsProps {
    userRole?: string | null;
}

export function KPICards({ userRole }: KPICardsProps) {
    const [stats, setStats] = useState({
        students: 0,
        vehicles: 0,
        availableVehicles: 0,
        income: 0,
        classesTotal: 0,
        classesCompleted: 0
    });

    const isInstructor = userRole === 'instructor';

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient();

            // Fetch Students Count (Active only)
            const { count: studentsCount } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Fetch Vehicles (Total & Available)
            const { data: vehicles } = await supabase
                .from('vehicles')
                .select('status');

            const totalVehicles = vehicles?.length || 0;
            const available = vehicles?.filter(v => v.status === 'active').length || 0;

            // Fetch Today's Classes
            const todayStr = new Date().toISOString().split('T')[0];
            const { data: classesToday } = await supabase
                .from('appointments')
                .select('status')
                .eq('scheduled_date', todayStr);

            const totalClasses = classesToday?.length || 0;
            const completedClasses = classesToday?.filter(c => c.status === 'completed' || c.status === 'rated').length || 0;

            // Fetch Real Income (Only if not instructor)
            let income = 0;
            if (!isInstructor) {
                income = await paymentsService.getIncomeStats();
            }

            setStats({
                students: studentsCount || 0,
                vehicles: totalVehicles,
                availableVehicles: available,
                income: income,
                classesTotal: totalClasses,
                classesCompleted: completedClasses
            });
        };

        fetchStats();
    }, [isInstructor]);

    // Role-based visibility
    if (isInstructor) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-violet-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.classesCompleted} / {stats.classesTotal}</div>
                        <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-violet-500 transition-all duration-500"
                                style={{ width: `${stats.classesTotal > 0 ? (stats.classesCompleted / stats.classesTotal) * 100 : 0}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {stats.classesCompleted} completadas, {stats.classesTotal - stats.classesCompleted} por dictar
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Vehículos Disponibles
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <Car className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.availableVehicles} / {stats.vehicles}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.vehicles - stats.availableVehicles} en mantenimiento/uso
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Ingresos Totales
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-700">${stats.income.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        +20.1% respecto al mes pasado
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Estudiantes Activos
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-700">{stats.students}</div>
                    <p className="text-xs text-muted-foreground">
                        Total registrados (Activos)
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
                    <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-violet-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-violet-700">{stats.classesCompleted} / {stats.classesTotal}</div>
                    <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-violet-500 transition-all duration-500"
                            style={{ width: `${stats.classesTotal > 0 ? (stats.classesCompleted / stats.classesTotal) * 100 : 0}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {stats.classesCompleted} completadas, {stats.classesTotal - stats.classesCompleted} por dictar
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Vehículos Disponibles
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Car className="h-4 w-4 text-orange-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-700">{stats.availableVehicles} / {stats.vehicles}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.vehicles - stats.availableVehicles} en mantenimiento/uso
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
