'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, MapPin, Calendar, Clock, MessageSquare, CheckCircle2, AlertCircle, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function InstructorStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [student, setStudent] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            const supabase = createClient();

            // Fetch student basic info
            const { data: studentData } = await supabase
                .from('students')
                .select('*')
                .eq('id', id)
                .single();

            setStudent(studentData);

            // Fetch student classes history
            const { data: appData } = await supabase
                .from('appointments')
                .select(`
                    *,
                    instructor:instructors(first_name, last_name),
                    class_type:class_types(name)
                `)
                .eq('student_id', id)
                .order('scheduled_date', { ascending: false })
                .order('start_time', { ascending: false });

            if (appData) setAppointments(appData);
            setLoading(false);
        };

        fetchStudentData();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-muted-foreground">Cargando perfil del alumno...</p>
        </div>
    );

    if (!student) return <div className="p-8 text-center text-muted-foreground">Alumno no encontrado</div>;

    const completedClasses = appointments.filter(a => a.status === 'completed').length;
    const totalClasses = appointments.filter(a => a.status !== 'cancelled').length;
    const progress = totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-black">Historial del Alumno</h1>
            </div>

            {/* Header / Profile Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden rounded-3xl">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/20">
                            {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{student.first_name} {student.last_name}</h2>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">DNI: {student.dni || 'S/D'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Progreso</p>
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-black text-emerald-400">{completedClasses}</span>
                                <span className="text-xs text-slate-400 font-bold mb-1.5">/ {totalClasses} clases</span>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Estado</p>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black uppercase">Activo</Badge>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button variant="secondary" className="w-full h-12 rounded-xl font-bold gap-2 text-slate-900" asChild>
                            <a href={`https://wa.me/${student.phone?.replace(/\D/g, '')}`} target="_blank">
                                <Phone className="h-4 w-4" /> Enviar WhatsApp
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Details */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] px-1">Detalles de Contacto</h3>
                <Card className="border-none shadow-sm rounded-2xl">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dirección de recogida</p>
                                <p className="font-bold text-slate-700">{student.address || 'No especificada'}</p>
                            </div>
                        </div>
                        {student.disability_observation && (
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold text-amber-800 uppercase text-[9px] tracking-widest">Observación Médica</p>
                                    <p className="text-amber-900 font-medium italic">"{student.disability_observation}"</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Class History Timeline */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Historial de Clases</h3>
                    <History className="h-4 w-4 text-slate-300" />
                </div>

                <div className="space-y-4">
                    {appointments.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 border-2 border-dashed rounded-3xl font-bold">
                            Sin clases previas
                        </div>
                    ) : (
                        appointments.map((cls) => (
                            <Card key={cls.id} className={cn(
                                "border-none shadow-sm rounded-2xl overflow-hidden",
                                cls.status === 'completed' ? "bg-white" : "bg-slate-50 opacity-80"
                            )}>
                                <CardContent className="p-0">
                                    <div className={cn(
                                        "h-1 w-full",
                                        cls.status === 'completed' ? "bg-emerald-500" : "bg-slate-300"
                                    )} />
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                    {format(new Date(cls.scheduled_date + 'T12:00:00'), "d 'de' MMMM", { locale: es })}
                                                </p>
                                                <h4 className="font-black text-slate-800">{cls.class_type.name}</h4>
                                            </div>
                                            <Badge variant={cls.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px] uppercase font-bold">
                                                {cls.status === 'completed' ? 'Realizada' : cls.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {cls.start_time.slice(0, 5)}hs
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" /> {cls.instructor.first_name}
                                            </div>
                                        </div>

                                        {cls.notes && (
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 italic text-sm text-slate-600">
                                                <div className="flex gap-2">
                                                    <MessageSquare className="h-4 w-4 text-slate-400 shrink-0" />
                                                    <p>"{cls.notes}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
