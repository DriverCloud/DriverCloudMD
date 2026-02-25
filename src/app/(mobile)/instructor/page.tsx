'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, ChevronRight, Phone, Navigation, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function InstructorHomePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let { data: instructor } = await supabase
                .from('instructors')
                .select('id')
                .eq('user_id', user.id)
                .single();

            let instructorId = instructor?.id;

            if (!instructorId) {
                const { data: instrByEmail } = await supabase
                    .from('instructors')
                    .select('id')
                    .eq('email', user.email)
                    .single();
                instructorId = instrByEmail?.id;
            }

            if (!instructorId) {
                setLoading(false);
                return;
            }

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            const { data } = await supabase
                .from('appointments')
                .select(`
                    *,
                    student:students(*),
                    vehicle:vehicles(*),
                    class_type:class_types(name)
                `)
                .eq('instructor_id', instructorId)
                .eq('scheduled_date', todayStr)
                .order('start_time', { ascending: true });

            if (data) {
                setClasses(data);
            }
            setLoading(false);
        };

        fetchClasses();
    }, []);

    useEffect(() => {
        const searchStudents = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            const supabase = createClient();
            const { data } = await supabase
                .from('students')
                .select('*')
                .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,dni.ilike.%${searchQuery}%`)
                .is('deleted_at', null)
                .limit(5);

            if (data) setSearchResults(data);
            setSearching(false);
        };

        const timer = setTimeout(searchStudents, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-muted-foreground animate-pulse">Cargando tu agenda...</p>
        </div>
    );

    const todayPretty = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                    {todayPretty.split(' ')[0]}
                </h1>
                <p className="text-slate-500 font-medium">Tienes {classes.length} clases para hoy</p>
            </div>

            {/* Global Student Search */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar alumnos por nombre o DNI..."
                        className="pl-10 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-emerald-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {searchQuery.length >= 2 && (
                    <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-slate-200 overflow-hidden">
                        <CardContent className="p-0">
                            {searching ? (
                                <div className="p-4 text-center text-sm text-slate-500 animate-pulse">Buscando...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="divide-y">
                                    {searchResults.map((student) => (
                                        <Link
                                            key={student.id}
                                            href={`/instructor/student/${student.id}`}
                                            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                {student.first_name[0]}{student.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{student.first_name} {student.last_name}</p>
                                                <p className="text-xs text-slate-500">DNI: {student.dni || 'S/D'}</p>
                                            </div>
                                            <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-slate-500">No se encontraron alumnos</div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {classes.length === 0 ? (
                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="text-center py-20 text-muted-foreground flex flex-col items-center gap-2">
                        <Clock className="h-10 w-10 text-slate-300" />
                        <p className="font-semibold">Sin clases asignadas</p>
                        <p className="text-xs">¡Disfruta tu día libre!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-slate-200 before:to-slate-200 lg:before:hidden">
                    {classes.map((cls, idx) => {
                        const isCompleted = cls.status === 'completed';
                        const isInProgress = cls.status === 'in_progress';

                        return (
                            <div key={cls.id} className="relative flex items-start gap-4 lg:gap-0">
                                {/* Timeline Dot */}
                                <div className={cn(
                                    "absolute left-0 mt-6 h-10 w-10 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center lg:static lg:mt-0 z-10 shrink-0 shadow-sm",
                                    isCompleted ? "bg-emerald-500 text-white" : isInProgress ? "bg-blue-600 text-white animate-pulse" : "bg-white text-slate-400 border-slate-200"
                                )}>
                                    <Clock className="h-4 w-4" />
                                </div>

                                <Card className={cn(
                                    "flex-1 overflow-hidden transition-all duration-300 ml-12 lg:ml-4",
                                    isInProgress ? "border-blue-200 ring-4 ring-blue-500/10" : isCompleted ? "opacity-90 grayscale-[0.3]" : ""
                                )}>
                                    <div className={cn(
                                        "h-1.5 w-full",
                                        isCompleted ? "bg-emerald-500" : isInProgress ? "bg-blue-600" : "bg-slate-200"
                                    )} />

                                    <CardHeader className="py-3 px-4">
                                        <div className="flex justify-between items-center">
                                            <div className="text-xl font-black tracking-tighter text-slate-800 dark:text-slate-100">
                                                {cls.start_time.slice(0, 5)}
                                            </div>
                                            <Badge variant={isCompleted ? 'secondary' : isInProgress ? 'default' : 'outline'} className={cn(
                                                "uppercase text-[10px] font-bold tracking-widest px-2",
                                                isInProgress && "bg-blue-600"
                                            )}>
                                                {isCompleted ? 'Finalizada' : isInProgress ? 'En Curso' : 'Pendiente'}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="px-4 pb-4 pt-0 space-y-4">
                                        <Link href={`/instructor/student/${cls.student_id}`} className="flex items-start gap-3 group active:opacity-70 transition-opacity">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                                <User className="h-5 w-5 text-slate-600 group-hover:text-emerald-600" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-bold text-lg leading-tight truncate group-hover:text-emerald-700 transition-colors">
                                                    {cls.student.first_name} {cls.student.last_name}
                                                </p>
                                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                                                    {cls.class_type.name}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300 mt-2" />
                                        </Link>

                                        <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
                                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                                <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                                <span className="leading-tight">{cls.student.address || 'Sin dirección de recogida'}</span>
                                            </div>

                                            {/* Quick Mobile Actions */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" size="sm" className="h-10 font-bold gap-2 text-emerald-700 bg-emerald-50 border-emerald-100" asChild>
                                                    <a href={`https://wa.me/${cls.student.phone?.replace(/\D/g, '')}`} target="_blank">
                                                        <Phone className="h-4 w-4" /> WhatsApp
                                                    </a>
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-10 font-bold gap-2 text-blue-700 bg-blue-50 border-blue-100" asChild>
                                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cls.student.address)}`} target="_blank">
                                                        <Navigation className="h-4 w-4" /> Mapas
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Main CTA */}
                                        {!isCompleted && (
                                            <Button
                                                asChild
                                                className={cn(
                                                    "w-full mt-2 h-12 text-md font-bold transition-transform active:scale-[0.98]",
                                                    isInProgress ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
                                                )}
                                            >
                                                <Link href={`/instructor/${cls.id}`}>
                                                    {isInProgress ? 'Continuar Clase' : 'Iniciar Clase'} <ChevronRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
