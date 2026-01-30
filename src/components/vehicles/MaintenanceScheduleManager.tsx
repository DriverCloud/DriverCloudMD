'use client';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Settings, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MaintenanceSchedule } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface MaintenanceScheduleManagerProps {
    vehicleId: string;
    currentMileage: number;
    schedules: MaintenanceSchedule[];
}

export function MaintenanceScheduleManager({ vehicleId, currentMileage, schedules }: MaintenanceScheduleManagerProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        service_name: '',
        interval_km: 10000,
        last_service_km: currentMileage // Default to 'just done' or 'current'
    });

    const handleAdd = async () => {
        if (!formData.service_name) {
            toast.error("El nombre es requerido");
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.from('vehicle_maintenance_schedules').insert({
            vehicle_id: vehicleId,
            service_name: formData.service_name,
            interval_km: formData.interval_km,
            last_service_km: formData.last_service_km
        });

        setLoading(false);
        if (error) {
            toast.error("Error al guardar");
        } else {
            toast.success("Regla agregada");
            setOpen(false);
            setFormData({ service_name: '', interval_km: 10000, last_service_km: currentMileage });
            router.refresh();
        }
    };

    const handleDelete = async (id: string) => {
        const supabase = createClient();
        const { error } = await supabase.from('vehicle_maintenance_schedules').delete().eq('id', id);
        if (error) toast.error("Error al eliminar");
        else {
            toast.success("Eliminado");
            router.refresh();
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Reglas de Mantenimiento
                </CardTitle>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Regla
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Configurar Alerta de Mantenimiento</DialogTitle>
                            <DialogDescription>
                                Define cada cuánto se debe realizar este servicio.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Servicio</Label>
                                <Input
                                    placeholder="Ej: Cambio de Aceite, Rotación, Correa..."
                                    value={formData.service_name}
                                    onChange={e => setFormData({ ...formData, service_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Intervalo (KM)</Label>
                                    <Input
                                        type="number"
                                        value={formData.interval_km}
                                        onChange={e => setFormData({ ...formData, interval_km: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Realizado a los (KM)</Label>
                                    <Input
                                        type="number"
                                        value={formData.last_service_km}
                                        onChange={e => setFormData({ ...formData, last_service_km: parseInt(e.target.value) })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Última vez que se hizo</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAdd} disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Regla"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {schedules.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                            No hay reglas definidas.<br />Agrega una para recibir alertas.
                        </p>
                    ) : (
                        schedules.map(sch => {
                            const nextDue = sch.last_service_km + sch.interval_km;
                            const remaining = nextDue - currentMileage;
                            const isOverdue = remaining < 0;
                            const isSoon = remaining < 1000 && !isOverdue; // Warning at 1000km

                            return (
                                <div key={sch.id} className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-slate-950">
                                    <div>
                                        <div className="font-semibold text-sm flex items-center gap-2">
                                            {sch.service_name}
                                            {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                            {isSoon && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                                            {!isOverdue && !isSoon && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Cada {sch.interval_km.toLocaleString()} km
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={isOverdue ? "destructive" : isSoon ? "secondary" : "outline"} className={isSoon ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : ""}>
                                            {isOverdue
                                                ? `Vencido (${Math.abs(remaining).toLocaleString()} km)`
                                                : `Faltan ${remaining.toLocaleString()} km`
                                            }
                                        </Badge>
                                        <div className="text-[10px] text-muted-foreground mt-1">
                                            Próx: {nextDue.toLocaleString()} km
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(sch.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
