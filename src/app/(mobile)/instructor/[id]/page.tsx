'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { use } from "react";

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [cls, setCls] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isLastClass, setIsLastClass] = useState(false);

    useEffect(() => {
        const fetchClassAndCheckSchedule = async () => {
            const supabase = createClient();

            // 1. Fetch current class details
            const { data: classData } = await supabase
                .from('appointments')
                .select(`
                    *,
                    student:students(*),
                    vehicle:vehicles(*),
                    class_type:class_types(*)
                `)
                .eq('id', id)
                .single();

            setCls(classData);

            if (classData) {
                // 2. Check if there are later classes today
                const { count } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('instructor_id', classData.instructor_id)
                    .eq('scheduled_date', classData.scheduled_date)
                    .gt('start_time', classData.start_time)
                    .neq('status', 'cancelled');

                setIsLastClass(count === 0);
            }

            setLoading(false);
        };
        fetchClassAndCheckSchedule();
    }, [id]);

    // ... handleUpdateStatus code ...

    const onFinishClick = () => {
        if (isLastClass) {
            setMileageDialogOpen(true);
        } else {
            // Not last class, finish immediately without mileage
            handleUpdateStatus('completed');
        }
    };

    const [mileageDialogOpen, setMileageDialogOpen] = useState(false);
    const [currentMileage, setCurrentMileage] = useState('');
    const [classNotes, setClassNotes] = useState('');

    const handleUpdateStatus = async (newStatus: string, mileage?: number, notes?: string) => {
        const supabase = createClient();

        const updateData: any = { status: newStatus };

        // If notes are present, save them
        if (notes && notes.trim()) {
            updateData.notes = notes;
        }
        if (mileage) {
            updateData.end_mileage = mileage;
        }

        const { error } = await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', id);

        if (error) {
            toast.error("Error al actualizar");
        } else {
            toast.success(`Clase marcada como ${newStatus}`);
            router.refresh(); // Refresh current route
            // Manually update local state to reflect change immediately
            setCls((prev: any) => ({ ...prev, status: newStatus }));

            if (newStatus === 'completed') {
                router.push('/instructor');
            }
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (!cls) return <div>Clase no encontrada</div>;

    const isActive = cls.status === 'in_progress';
    const isCompleted = cls.status === 'completed';

    return (
        <div className="space-y-6">
            <Button variant="ghost" className="pl-0 gap-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" /> Volver
            </Button>

            <header>
                <h1 className="text-2xl font-bold">{cls.student.first_name} {cls.student.last_name}</h1>
                <p className="text-muted-foreground">{cls.class_type.name} • {cls.start_time.slice(0, 5)}</p>
            </header>

            {/* Student Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Detalles del Alumno</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full h-fit">
                            <MapPin className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="font-semibold">Dirección</p>
                            <p>{cls.student.address}</p>
                        </div>
                    </div>
                    {cls.student.has_license && (
                        <div className="flex gap-2 items-center text-emerald-600 font-medium">
                            <CheckCircle2 className="h-4 w-4" /> Tiene Licencia
                        </div>
                    )}
                    {cls.student.disability_observation && (
                        <div className="bg-amber-50 text-amber-800 p-3 rounded-md border border-amber-200">
                            <strong>Nota:</strong> {cls.student.disability_observation}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Vehículo Asignado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{cls.vehicle.brand} {cls.vehicle.model}</p>
                            <Badge variant="outline">{cls.vehicle.license_plate}</Badge>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                            <p>KM Actual</p>
                            {/* Placeholder for mileage logic */}
                            <p className="font-mono text-sm">--</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="sticky bottom-20">
                {!isActive && !isCompleted && (
                    <Button className="w-full text-lg h-14 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus('in_progress')}>
                        Comenzar Clase
                    </Button>
                )}

                {isActive && (
                    <>
                        <Button className="w-full text-lg h-14" onClick={onFinishClick}>
                            Finalizar Clase
                        </Button>

                        <Dialog open={mileageDialogOpen} onOpenChange={setMileageDialogOpen}>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Finalizar Clase</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Kilometraje Actual del Vehículo</Label>
                                        <Input
                                            type="number"
                                            placeholder="Ej: 15400"
                                            value={currentMileage}
                                            onChange={(e) => setCurrentMileage(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Ingrese el valor del odómetro al terminar la clase.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Feedback / Observaciones</Label>
                                        <textarea
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Ej: Estacionamiento muy bien. Mejorar uso de luces."
                                            value={classNotes}
                                            onChange={(e) => setClassNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setMileageDialogOpen(false)}>Cancelar</Button>
                                    <Button onClick={() => handleUpdateStatus('completed', parseInt(currentMileage), classNotes)}>
                                        Confirmar y Finalizar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}

                {isCompleted && (
                    <div className="bg-slate-100 text-slate-600 text-center p-4 rounded-lg font-medium">
                        Esta clase ha finalizado.
                    </div>
                )}
            </div>
        </div>
    );
}
