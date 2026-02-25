'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, AlertCircle, ArrowLeft, Phone, Navigation, Clock, MessageSquare, Car, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { use } from "react";
import { completeClass } from "@/app/actions/instructor";
import { cn } from "@/lib/utils";

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [cls, setCls] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLastClass, setIsLastClass] = useState(false);
    const [mileageDialogOpen, setMileageDialogOpen] = useState(false);
    const [currentMileage, setCurrentMileage] = useState('');
    const [classNotes, setClassNotes] = useState('');

    useEffect(() => {
        const fetchClassAndCheckSchedule = async () => {
            const supabase = createClient();
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

    const handleUpdateStatus = async (newStatus: string, mileage?: number, notes?: string) => {
        setLoading(true);
        if (newStatus === 'completed') {
            const result = await completeClass(id, mileage || 0, notes || "");
            if (!result.success) {
                toast.error(`Error: ${result.error}`);
                setLoading(false);
            } else {
                toast.success("Clase finalizada correctamente");
                router.push('/instructor');
            }
        } else {
            const supabase = createClient();
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) {
                toast.error("Error al actualizar estado");
            } else {
                toast.success(newStatus === 'in_progress' ? "Clase iniciada" : "Estado actualizado");
                setCls((prev: any) => ({ ...prev, status: newStatus }));
            }
            setLoading(false);
        }
    };

    const onFinishClick = () => {
        setMileageDialogOpen(true);
    };

    if (loading && !cls) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-muted-foreground">Cargando detalles...</p>
        </div>
    );

    if (!cls) return <div className="p-8 text-center text-muted-foreground uppercase tracking-widest font-bold">Clase no encontrada</div>;

    const isActive = cls.status === 'in_progress';
    const isCompleted = cls.status === 'completed';

    return (
        <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button variant="ghost" className="pl-0 gap-2 text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" /> Volver a mi agenda
            </Button>

            <header className="space-y-2">
                <div className="flex items-center gap-2">
                    <Badge variant={isCompleted ? "secondary" : isActive ? "default" : "outline"} className={cn(
                        "uppercase text-[10px] font-bold tracking-widest",
                        isActive && "bg-blue-600"
                    )}>
                        {isCompleted ? "Completada" : isActive ? "En Curso" : "Pendiente"}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400">• {cls.class_type.name}</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {cls.student.first_name} {cls.student.last_name}
                </h1>
                <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                    <div className="flex items-center gap-1.5 underline decoration-emerald-500/30 underline-offset-4">
                        <Clock className="h-4 w-4" /> {cls.start_time.slice(0, 5)}hs
                    </div>
                </div>
            </header>

            {/* Student Info Card */}
            <Card className="overflow-hidden border-none shadow-md bg-slate-50 dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-white/50 dark:border-black/20">
                    <CardTitle className="text-xs uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                        <User className="h-3 w-3" /> Información del Alumno
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                <MapPin className="h-5 w-5 text-rose-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección de recogida</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{cls.student.address || 'No especificada'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions for mobile */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button variant="outline" className="h-12 font-bold gap-2 bg-emerald-50 text-emerald-700 border-emerald-100" asChild>
                            <a href={`https://wa.me/${cls.student.phone?.replace(/\D/g, '')}`} target="_blank">
                                <Phone className="h-4 w-4" /> WhatsApp
                            </a>
                        </Button>
                        <Button variant="outline" className="h-12 font-bold gap-2 bg-blue-50 text-blue-700 border-blue-100" asChild>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cls.student.address)}`} target="_blank">
                                <Navigation className="h-4 w-4" /> Mapas
                            </a>
                        </Button>
                    </div>

                    {cls.student.disability_observation && (
                        <div className="bg-amber-100/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold text-amber-800 dark:text-amber-500 uppercase text-[10px] tracking-widest mb-1">Nota médica / Especial</p>
                                <p className="text-amber-900 dark:text-amber-200 font-medium italic">"{cls.student.disability_observation}"</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card className="border-none shadow-sm ring-1 ring-slate-100">
                <CardContent className="p-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Car className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vehículo Asignado</p>
                                <p className="font-black text-xl text-slate-800">{cls.vehicle.brand} {cls.vehicle.model}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="h-fit font-mono font-bold text-slate-600 bg-slate-50">{cls.vehicle.license_plate}</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t z-50 flex gap-3">
                {!isActive && !isCompleted && (
                    <Button
                        className="w-full text-lg h-16 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 font-black rounded-2xl active:scale-[0.98] transition-all"
                        onClick={() => handleUpdateStatus('in_progress')}
                    >
                        COMENZAR CLASE
                    </Button>
                )}

                {isActive && (
                    <>
                        <Button
                            className="w-full text-lg h-16 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-black rounded-2xl active:scale-[0.98] transition-all"
                            onClick={onFinishClick}
                        >
                            FINALIZAR CLASE
                        </Button>

                        <Dialog open={mileageDialogOpen} onOpenChange={setMileageDialogOpen}>
                            <DialogContent className="sm:max-w-md w-[90vw] rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Resumen de Clase</DialogTitle>
                                    <DialogDescription className="font-medium text-slate-500">
                                        Completa el reporte final para {cls.student.first_name}.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-5 py-4">
                                    {isLastClass && (
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-black text-slate-400 tracking-widest">Kilometraje Actual</Label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="Ej: 15400"
                                                    className="h-14 text-xl font-bold bg-slate-50 border-slate-200 rounded-xl pl-12"
                                                    value={currentMileage}
                                                    onChange={(e) => setCurrentMileage(e.target.value)}
                                                />
                                                <Car className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-black text-slate-400 tracking-widest">Feedback para el Alumno</Label>
                                        <textarea
                                            className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all resize-none"
                                            placeholder="¿Cómo manejó hoy? Ej: Estacionamiento muy bien. Mejorar uso de luces."
                                            value={classNotes}
                                            onChange={(e) => setClassNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="gap-3">
                                    <Button variant="ghost" onClick={() => setMileageDialogOpen(false)} className="h-12 font-bold text-slate-500">Volver</Button>
                                    <Button
                                        className="h-12 bg-emerald-600 hover:bg-emerald-700 font-black px-8 rounded-xl"
                                        onClick={() => handleUpdateStatus('completed', parseInt(currentMileage) || 0, classNotes)}
                                        disabled={isLastClass && !currentMileage}
                                    >
                                        GUARDAR Y SALIR
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}

                {isCompleted && (
                    <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-center py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> CLASE FINALIZADA
                    </div>
                )}
            </div>
        </div>
    );
}
