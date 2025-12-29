"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, Car } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { paymentsService } from "@/features/finance/services/payments.service";

export function KPICards() {
    const [stats, setStats] = useState({
        students: 0,
        vehicles: 0,
        availableVehicles: 0,
        income: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient();

            // Fetch Students Count
            const { count: studentsCount } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true });

            // Fetch Vehicles (Total & Available)
            const { data: vehicles } = await supabase
                .from('vehicles')
                .select('status');

            const totalVehicles = vehicles?.length || 0;
            const available = vehicles?.filter(v => v.status === 'active').length || 0;

            // Fetch Real Income
            const income = await paymentsService.getIncomeStats();

            setStats({
                students: studentsCount || 0,
                vehicles: totalVehicles,
                availableVehicles: available,
                income: income
            });
        };

        fetchStats();
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Ingresos Totales
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.income.toLocaleString()}</div>
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
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.students}</div>
                    <p className="text-xs text-muted-foreground">
                        Total registrados
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12 / 18</div>
                    <p className="text-xs text-muted-foreground">
                        6 completadas, 6 por dictar
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Vehículos Disponibles
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
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
