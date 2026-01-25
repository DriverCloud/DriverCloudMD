'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin, Calendar, CheckCircle2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function StudentDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [stats, setStats] = useState({ completed: 0, total: 0 });

    useEffect(() => {
        const loadStudentData = async () => {
            const supabase = createClient();

            // 1. Get Auth User
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // If demoing without real login, we might need a fallback or redirect
                // For development, assuming we are testing logic
                setLoading(false);
                return;
            }

            // 2. Get Student Profile linked to this user
            const { data: studentData } = await supabase
                .from('students')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (studentData) {
                setStudent(studentData);

                // 3. Get Classes
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
                    // Assuming a standard package of 10 if not defined, or calculating logic
                    const total = 10;
                    setStats({ completed, total });
                }
            }
            setLoading(false);
        };

        loadStudentData();
    }, []);

    if (loading) return <div className="p-8 text-center">Cargando tu perfil...</div>;

    // Demo state if no user found (for presentation without auth flow setup yet)
    if (!student && !loading) {
        return (
            <div className="p-8 text-center space-y-4">
                <h2 className="text-xl font-bold">Vista de Demostración</h2>
                <p>Para ver datos reales, el administrador debe invitarte al portal.</p>
                <Card className="text-left opacity-75 grayscale max-w-lg mx-auto pointer-events-none">
                    <CardHeader><CardTitle>Mi Progreso</CardTitle></CardHeader>
                    <CardContent>Ejemplo de visualización...</CardContent>
                </Card>
            </div>
        );
    }

    const progressPercentage = (stats.completed / stats.total) * 100;

    return (
        <div className="space-y-6 pb-20">
            {/* Welcome & Stats */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Hola, {student.first_name} 👋</h1>
                <p className="text-muted-foreground">Aquí tienes el resumen de tu aprendizaje.</p>
            </div>

            <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardHeader className="pb-2">
                    <CardTitle className=" text-base">Tu Progreso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between mb-2 text-sm font-medium">
                        <span>{stats.completed} clases completadas</span>
                        <span>{stats.total} total</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                        ¡Vas muy bien! Te faltan {stats.total - stats.completed} clases para terminar.
                    </p>
                </CardContent>
            </Card>

            {/* Classes List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Tus Clases</h2>
                {classes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No tienes clases registradas aún.</p>
                ) : (
                    classes.map((cls) => (
                        <Card key={cls.id} className="overflow-hidden">
                            <div className={`h-2 w-full ${cls.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <CardHeader className="py-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{cls.class_type?.name || 'Clase Práctica'}</CardTitle>
                                        <CardDescription className="capitalize">
                                            {format(new Date(cls.scheduled_date), "EEEE d 'de' MMMM", { locale: es })}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={cls.status === 'completed' ? 'default' : 'outline'}>
                                        {cls.status === 'completed' ? 'Completada' : 'Pendiente'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="py-3 space-y-3 text-sm">
                                <div className="flex gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{cls.start_time.slice(0, 5)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>Punto de encuentro</span>
                                    </div>
                                </div>

                                {/* Instructor Notes Section */}
                                {cls.notes && (
                                    <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 p-3 rounded-md">
                                        <div className="flex items-center gap-2 mb-1 text-amber-800 dark:text-amber-500 font-medium text-xs uppercase tracking-wide">
                                            <MessageSquare className="h-3 w-3" />
                                            Correcciones del Instructor
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 italic">
                                            "{cls.notes}"
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
