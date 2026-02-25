'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Calendar, CheckCircle2, MessageSquare, User, MoreVertical, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function StudentDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [stats, setStats] = useState({ completed: 0, total: 0 });

    useEffect(() => {
        const loadStudentData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: studentData } = await supabase
                .from('students')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (studentData) {
                setStudent(studentData);

                const { data: appts } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        instructor:instructors(first_name, last_name),
                        class_type:class_types(name)
                    `)
                    .eq('student_id', studentData.id)
                    .order('scheduled_date', { ascending: false });

                if (appts) {
                    setClasses(appts);
                    const completed = appts.filter(c => c.status === 'completed' || c.status === 'rated').length;
                    const total = 10; // Logic for total package credits could be fetched here
                    setStats({ completed, total });
                }
            }
            setLoading(false);
        };

        loadStudentData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-muted-foreground animate-pulse">Cargando tu progreso...</p>
        </div>
    );

    if (!student && !loading) {
        return (
            <div className="p-8 text-center space-y-6 max-w-md mx-auto">
                <div className="bg-slate-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                    <User className="h-10 w-10 text-slate-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Portal no activado</h2>
                    <p className="text-muted-foreground text-sm">
                        Para ver tu progreso, el administrador de la autoescuela debe invitarte al portal.
                    </p>
                </div>
            </div>
        );
    }

    const progressPercentage = (stats.completed / stats.total) * 100;
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "¡Buen día!";
        if (hour < 19) return "¡Buenas tardes!";
        return "¡Buenas noches!";
    };

    return (
        <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">{greeting()} {student.first_name} 👋</h1>
                    <p className="text-muted-foreground text-sm">Tu aprendizaje al día: {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-200">
                    {student.first_name[0]}
                </div>
            </div>

            {/* Premium Progress Card */}
            <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Calendar className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-medium text-emerald-50">Resumen de Cursada</CardTitle>
                        <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                            {(progressPercentage).toFixed(0)}% Completado
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-end mb-1">
                        <div className="text-3xl font-bold tracking-tight">
                            {stats.completed} <span className="text-emerald-200 text-lg font-normal">/ {stats.total} clases</span>
                        </div>
                        <div className="text-xs text-emerald-100 font-medium pb-1 uppercase tracking-wider">
                            Créditos de Pack
                        </div>
                    </div>
                    <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-50 bg-black/10 p-2 rounded-md backdrop-blur-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        <span>¡Excelente ritmo! Próximo objetivo: clase {stats.completed + 1}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Classes List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-bold tracking-tight">Tu Bitácora de Clases</h2>
                    <Button variant="ghost" size="sm" className="text-muted-foreground h-8">Ver todo</Button>
                </div>

                {classes.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl border-slate-200 bg-slate-50/50">
                        <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">Aún no tienes turnos registrados.</p>
                        <p className="text-xs text-slate-400 mt-1">Cuando agendes tu primera clase, aparecerá aquí.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {classes.map((cls, idx) => {
                            const isCompleted = cls.status === 'completed' || cls.status === 'rated';
                            return (
                                <Card key={cls.id} className={cn(
                                    "group transition-all hover:shadow-md border-slate-200 overflow-hidden",
                                    isCompleted ? "bg-slate-50/30" : "bg-white ring-1 ring-emerald-500/5 shadow-sm"
                                )}>
                                    <div className="flex">
                                        {/* Status indicator bar */}
                                        <div className={cn(
                                            "w-1.5 shrink-0",
                                            isCompleted ? "bg-emerald-500" : "bg-blue-500"
                                        )} />

                                        <div className="flex-1">
                                            <CardHeader className="py-4 px-5">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-lg font-bold">{cls.class_type?.name || 'Clase Práctica'}</CardTitle>
                                                            <div className={cn(
                                                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                                                isCompleted ? "bg-emerald-500" : "bg-blue-500"
                                                            )} />
                                                        </div>
                                                        <CardDescription className="flex items-center gap-1.5 font-medium text-slate-600">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {format(new Date(cls.scheduled_date), "EEEE d 'de' MMMM", { locale: es })}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge
                                                            variant={isCompleted ? "secondary" : "default"}
                                                            className={cn(
                                                                "capitalize text-[10px] font-bold tracking-wider",
                                                                isCompleted ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-blue-600"
                                                            )}
                                                        >
                                                            {isCompleted ? 'Finalizada' : 'Próxima'}
                                                        </Badge>
                                                        <div className="text-lg font-mono font-bold text-slate-800">
                                                            {cls.start_time.slice(0, 5)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pb-5 px-5 pt-0 space-y-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <div className="p-1.5 bg-slate-100 rounded-full">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="font-medium">Punto de encuentro</span>
                                                    </div>
                                                    <Button variant="link" className="h-auto p-0 text-emerald-600 text-xs font-bold gap-1">
                                                        Ver Mapa <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                {/* Instructor Feedback Premium Box */}
                                                {cls.notes && (
                                                    <div className="relative mt-2">
                                                        <div className="absolute -left-1 top-2 bottom-2 w-0.5 bg-amber-400 rounded-full" />
                                                        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/30 p-3.5 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-400 font-bold text-[10px] uppercase tracking-[0.1em]">
                                                                <MessageSquare className="h-3 w-3" />
                                                                Devolución del Instructor
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium italic">
                                                                "{cls.notes}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                                            {cls.instructor?.first_name?.[0]}
                                                        </div>
                                                        <span className="text-xs text-slate-500 font-medium">
                                                            {cls.instructor?.first_name} {cls.instructor?.last_name}
                                                        </span>
                                                    </div>
                                                    {!isCompleted && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Contact Floater Hint */}
            <div className="fixed bottom-24 right-6 left-6 md:static">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">¿Necesitas ayuda?</p>
                            <p className="text-xs text-muted-foreground">Contacta con secretaría</p>
                        </div>
                    </div>
                    <Button size="sm" className="rounded-full px-4 h-9">Chatear</Button>
                </div>
            </div>
        </div>
    );
}
