'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from 'next/link';

export default function InstructorHomePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            const supabase = createClient();

            // 1. Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Should be handled by middleware, but safe check

            // 2. Get Instructor ID linked to this User
            // We need to find which instructor has this user_id. 
            // Note: In a real app we might store this in metadata or a context.
            const { data: instructor } = await supabase
                .from('instructors')
                .select('id')
                .eq('user_id', user.id) // Assuming we added user_id to instructors too, similar to students.
                // If instructors don't have user_id yet, we have a missing link.
                // Let's assume for now they are linked via email or a 'user_id' column if it exists.
                // Wait, in previous steps we only added user_id to STUDENTS.
                // Let me check if instructors have user_id. If not, we found the root cause.
                .single();

            // Correction: I need to verify if instructors table has user_id. 
            // If not, I can't link them easily. 
            // BUT, wait, the middleware checks "membership" table for role. 
            // Let's check 'memberships' to get the role, but 'instructors' table is where the Appointments are linked (instructor_id).

            // Hypothethical Fix: Use email to link if user_id is missing, OR check memberships.
            // Let's try to find an instructor with the same email as the user.

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
                console.error("No instructor profile found for user");
                setLoading(false);
                return;
            }

            // 3. Get Appointments for TODAY (Local Time)
            // Creating a date object and getting YYYY-MM-DD in local time
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;



            const { data } = await supabase
                .from('appointments')
                .select(`
                    *,
                    student:students(first_name, last_name, address),
                    vehicle:vehicles(brand, model, license_plate),
                    class_type:class_types(name)
                `)
                .eq('instructor_id', instructorId) // Filter by THIS instructor
                .eq('scheduled_date', todayStr)
                .order('start_time', { ascending: true });

            if (data) {
                setClasses(data);
            }
            setLoading(false);
        };

        fetchClasses();
    }, []);

    if (loading) return <div className="p-4 text-center">Cargando agenda...</div>;

    const todayPretty = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold capitalize">
                {todayPretty}
            </h1>

            {classes.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    <p>No tienes clases asignadas para hoy.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {classes.map((cls) => (
                        <Card key={cls.id} className="overflow-hidden border-l-4 border-l-emerald-500">
                            <CardHeader className="py-3 px-4 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 font-bold text-lg">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
                                    </div>
                                    <Badge variant={cls.status === 'completed' ? 'secondary' : 'default'}>
                                        {cls.status === 'completed' ? 'Completada' : 'Pendiente'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-3 space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-emerald-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-base">{cls.student.first_name} {cls.student.last_name}</p>
                                        <p className="text-sm text-muted-foreground">{cls.class_type.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <p className="text-sm">{cls.student.address || 'Sin dirección de recogida'}</p>
                                </div>

                                {/* Actions */}
                                {cls.status !== 'completed' && (
                                    <Button asChild className="w-full mt-2" size="lg">
                                        <Link href={`/instructor/${cls.id}`}>
                                            Iniciar Clase <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
