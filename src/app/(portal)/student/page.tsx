'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, MapPin, Calendar, CheckCircle2, MessageSquare, User, MoreVertical, ExternalLink, Activity, BookOpen, Star, AlertCircle, ShieldCheck, Trophy, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { rateClass } from "@/app/actions/student";
import { toast } from "sonner";


export default function StudentDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [stats, setStats] = useState({ completed: 0, total: 0 });

    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [classToRate, setClassToRate] = useState<any>(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

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

    const handleRateClass = async () => {
        if (!classToRate || ratingValue === 0) return;
        setIsSubmittingRating(true);
        const result = await rateClass(classToRate.id, ratingValue);
        setIsSubmittingRating(false);
        if (result.success) {
            toast.success("¡Gracias por calificar tu clase!");
            setRatingModalOpen(false);
            setClassToRate(null);
            setRatingValue(0);
            // Quick optimistic update
            setClasses(prev => prev.map(c => c.id === classToRate.id ? { ...c, status: 'rated', student_rating: ratingValue } : c));
        } else {
            toast.error(result.error);
        }
    };

    const isPerfectAttendance = classes.length > 0 && !classes.some(c => c.status === 'cancelled' || c.status === 'no_show');

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
                        <UiBadge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                            {(progressPercentage).toFixed(0)}% Completado
                        </UiBadge>
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

                    {/* Gamification Badges */}
                    <div className="pt-4 mt-2 border-t border-white/10">
                        <p className="text-xs font-medium text-emerald-100 mb-3 uppercase tracking-wider">Logros Desbloqueados</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
                            <div className={cn("shrink-0 snap-center flex flex-col items-center justify-center w-20 h-24 rounded-xl border-2 transition-all", stats.completed >= 1 ? "bg-amber-100 border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.3)] shadow-inner" : "bg-white/5 border-white/10 grayscale opacity-50")}>
                                <div className={cn("p-2 rounded-full mb-1", stats.completed >= 1 ? "bg-amber-50 text-amber-500" : "bg-white/10 text-white")}>
                                    <Activity className="h-5 w-5" />
                                </div>
                                <span className={cn("text-[10px] font-bold text-center leading-tight", stats.completed >= 1 ? "text-amber-700" : "text-emerald-100")}>Primeros<br />Pasos</span>
                            </div>
                            <div className={cn("shrink-0 snap-center flex flex-col items-center justify-center w-20 h-24 rounded-xl border-2 transition-all", stats.completed >= 5 ? "bg-amber-100 border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.3)] shadow-inner" : "bg-white/5 border-white/10 grayscale opacity-50")}>
                                <div className={cn("p-2 rounded-full mb-1", stats.completed >= 5 ? "bg-amber-50 text-amber-500" : "bg-white/10 text-white")}>
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <span className={cn("text-[10px] font-bold text-center leading-tight", stats.completed >= 5 ? "text-amber-700" : "text-emerald-100")}>Conductor<br />Medio</span>
                            </div>
                            <div className={cn("shrink-0 snap-center flex flex-col items-center justify-center w-20 h-24 rounded-xl border-2 transition-all", isPerfectAttendance ? "bg-amber-100 border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.3)] shadow-inner" : "bg-white/5 border-white/10 grayscale opacity-50")}>
                                <div className={cn("p-2 rounded-full mb-1", isPerfectAttendance ? "bg-amber-50 text-amber-500" : "bg-white/10 text-white")}>
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <span className={cn("text-[10px] font-bold text-center leading-tight", isPerfectAttendance ? "text-amber-700" : "text-emerald-100")}>Asistencia<br />Perfecta</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="classes" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-slate-100/80 p-1">
                    <TabsTrigger value="classes" className="rounded-md font-bold text-sm h-full data-[state=active]:shadow-sm data-[state=active]:bg-white">Mi Progreso</TabsTrigger>
                    <TabsTrigger value="study" className="rounded-md font-bold text-sm h-full data-[state=active]:shadow-sm data-[state=active]:bg-white">Estudio & Reglas</TabsTrigger>
                </TabsList>

                <TabsContent value="classes" className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <Alert className="bg-blue-50/50 border-blue-100 text-blue-800">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-900 font-bold">Política de Cancelación</AlertTitle>
                        <AlertDescription className="text-sm mt-1">
                            Recuerda: Si necesitas cancelar un turno, hazlo con mínimo <strong>24 horas de antelación</strong>. Las cancelaciones tardías se descuentan de tu abono mensual.
                        </AlertDescription>
                    </Alert>

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
                                                                <UiBadge
                                                                    variant={isCompleted ? "secondary" : "default"}
                                                                    className={cn(
                                                                        "capitalize text-[10px] font-bold tracking-wider",
                                                                        isCompleted ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-blue-600"
                                                                    )}
                                                                >
                                                                    {isCompleted ? 'Finalizada' : 'Próxima'}
                                                                </UiBadge>

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

                                                        {/* Rating Action for completed classes without a rating */}
                                                        {cls.status === 'completed' && !cls.student_rating && (
                                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                                <Button
                                                                    variant="default"
                                                                    className="w-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2"
                                                                    onClick={() => {
                                                                        setClassToRate(cls);
                                                                        setRatingModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Star className="h-4 w-4" />
                                                                    Calificar Clase
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Show stars if already rated */}
                                                        {cls.student_rating && (
                                                            <div className="mt-4 flex items-center gap-1">
                                                                <span className="text-xs font-bold text-slate-500 mr-2 uppercase">Tu Calificación:</span>
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <Star
                                                                        key={star}
                                                                        className={cn("h-4 w-4", cls.student_rating >= star ? "text-amber-400 fill-amber-400" : "text-slate-200")}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </div>
                                            </div>
                                        </Card>

                                    );
                                })}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* STUDY MATERIALS TAB */}
                <TabsContent value="study" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Alert className="bg-amber-50/50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 font-bold">¡Prepárate para tu examen!</AlertTitle>
                        <AlertDescription className="text-amber-700/80 text-sm mt-1">
                            Para rendir el examen municipal necesitas conocer las señales de tránsito y las velocidades máximas.
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-3">
                        <Card className="hover:border-emerald-300 transition-colors cursor-pointer group bg-gradient-to-br from-white to-slate-50">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-orange-200/50">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Manual del Conductor Básico</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">PDF oficial de la agencia de seguridad vial nacional.</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </CardContent>
                        </Card>

                        <Card className="hover:border-emerald-300 transition-colors cursor-pointer group bg-gradient-to-br from-white to-slate-50">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-purple-200/50">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Simulador de Examen</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">Pon a prueba tu conocimiento con exámenes de múltiple choice.</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </CardContent>
                        </Card>

                        <Card className="hover:border-emerald-300 transition-colors cursor-pointer group bg-gradient-to-br from-white to-slate-50">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-sky-200/50">
                                    <Info className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Reglas y Prioridades</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">Aprende quién pasa primero en esquinas y rotondas clave.</p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>


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

            {/* Rating Modal */}
            <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="pt-4 px-2 items-center flex flex-col gap-2">
                        <div className="h-12 w-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-2">
                            <Star className="h-6 w-6 fill-amber-500" />
                        </div>
                        <DialogTitle className="text-2xl text-center font-bold">¡Califica a tu instructor!</DialogTitle>
                        <DialogDescription className="text-center mt-1">
                            ¿Cómo estuvo tu clase con {classToRate?.instructor?.first_name}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center gap-2 py-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-transform hover:scale-110 active:scale-90"
                                onClick={() => setRatingValue(star)}
                            >
                                <Star
                                    className={cn(
                                        "h-10 w-10 transition-colors",
                                        ratingValue >= star
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-slate-200 fill-slate-100 hover:text-amber-200"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            className="w-full sm:w-auto"
                            disabled={ratingValue === 0 || isSubmittingRating}
                            onClick={handleRateClass}
                        >
                            {isSubmittingRating ? "Enviando..." : "Guardar Calificación"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    );
}
