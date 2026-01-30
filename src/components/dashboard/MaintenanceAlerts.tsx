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
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const fetchFleetStatus = async () => {
            const supabase = createClient();

            // Fetch active vehicles with their maintenance schedules
            const { data: vehicles } = await supabase
                .from('vehicles')
                .select(`
                    id, 
                    brand, 
                    model, 
                    license_plate, 
                    current_mileage,
                    vehicle_maintenance_schedules (
                        id,
                        service_name,
                        interval_km,
                        last_service_km
                    )
                `)
                .eq('status', 'active');

            if (vehicles) {
                const alertsList: any[] = [];

                vehicles.forEach((v: any) => {
                    const current = v.current_mileage || 0;

                    if (v.vehicle_maintenance_schedules) {
                        v.vehicle_maintenance_schedules.forEach((sch: any) => {
                            const nextDue = sch.last_service_km + sch.interval_km;
                            const remaining = nextDue - current;

                            // Alert if overdue OR warning within 500km
                            if (remaining < 500) {
                                alertsList.push({
                                    id: sch.id,
                                    brand: v.brand,
                                    model: v.model,
                                    license_plate: v.license_plate,
                                    service_name: sch.service_name,
                                    overdue_by: -remaining, // Positive if overdue
                                    current_mileage: current
                                });
                            }
                        });
                    }
                });

                setAlerts(alertsList);
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
                {alerts.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-md border border-rose-100 dark:border-rose-900/50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-full">
                                <Wrench className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{item.brand} {item.model} - {item.service_name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{item.license_plate}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {item.overdue_by > 0 ? (
                                <Badge variant="destructive" className="mb-1">Vencido hace {item.overdue_by.toLocaleString()}km</Badge>
                            ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Vence en {Math.abs(item.overdue_by).toLocaleString()}km</Badge>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Actual: {item.current_mileage.toLocaleString()}km
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
