'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface VehicleMaintenanceStatus {
    id: string;
    brand: string;
    model: string;
    license_plate: string;
    current_mileage: number;
    next_service_at: number;
    overdue_by: number;
}

export function MaintenanceAlerts() {
    const [alerts, setAlerts] = useState<VehicleMaintenanceStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFleetStatus = async () => {
            const supabase = createClient();

            const { data: vehicles } = await supabase
                .from('vehicles')
                .select('*')
                .eq('status', 'active'); // Only check active vehicles

            if (vehicles) {
                const needingService = vehicles.map(v => {
                    const lastService = v.last_service_mileage || 0;
                    const interval = v.service_interval_km || 10000;
                    const current = v.current_mileage || 0;
                    const nextService = lastService + interval;

                    return {
                        id: v.id,
                        brand: v.brand,
                        model: v.model,
                        license_plate: v.license_plate,
                        current_mileage: current,
                        next_service_at: nextService,
                        overdue_by: current - nextService
                    };
                }).filter(v => v.overdue_by > -500); // Show if overdue OR within 500km of service

                setAlerts(needingService);
            }
            setLoading(false);
        };

        fetchFleetStatus();
    }, []);

    if (loading || alerts.length === 0) return null;

    return (
        <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-900/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                    Alertas de Mantenimiento
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {alerts.map(vehicle => (
                    <div key={vehicle.id} className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-md border border-rose-100 dark:border-rose-900/50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-full">
                                <Wrench className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-xs text-muted-foreground font-mono">{vehicle.license_plate}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {vehicle.overdue_by > 0 ? (
                                <Badge variant="destructive" className="mb-1">Vencido por {vehicle.overdue_by}km</Badge>
                            ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Próximo: {Math.abs(vehicle.overdue_by)}km</Badge>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Actual: {vehicle.current_mileage.toLocaleString()}km
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
