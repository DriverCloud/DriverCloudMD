"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { paymentsService, Payment } from "@/features/finance/services/payments.service";
import { Calendar, User, SearchX, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/client";


interface ClassActivity {
    id: string;
    student_name: string;
    instructor_name: string;
    start_time: string;
    status: string;
}

export function RecentActivity() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [classes, setClasses] = useState<ClassActivity[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // 1. Fetch Recent Payments
            try {
                const recentPayments = await paymentsService.getRecentPayments();
                setPayments(recentPayments);
            } catch (error) {
                console.error("Error fetching payments", error);
            }

            // 2. Fetch Today's Classes
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data: appointments } = await supabase
                    .from('appointments')
                    .select(`
                        id,
                        start_time,
                        status,
                        student:students(first_name, last_name),
                        instructor:instructors(first_name, last_name)
                    `)
                    .eq('scheduled_date', today)
                    .order('start_time', { ascending: true })
                    .limit(5);

                if (appointments) {
                    const mappedClasses = appointments.map((apt: any) => ({
                        id: apt.id,
                        student_name: `${apt.student?.first_name} ${apt.student?.last_name}`,
                        instructor_name: `${apt.instructor?.first_name} ${apt.instructor?.last_name}`,
                        start_time: apt.start_time.slice(0, 5), // HH:MM
                        status: apt.status === 'confirmed' ? 'Confirmada' :
                            apt.status === 'completed' ? 'Completada' :
                                apt.status === 'pending' ? 'Pendiente' : apt.status
                    }));
                    setClasses(mappedClasses);
                }
            } catch (error) {
                console.error("Error fetching classes", error);
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {/* Próximas Clases */}
            <Card>
                <CardHeader>
                    <CardTitle>Próximas Clases</CardTitle>
                    <CardDescription>
                        Agenda para hoy.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loadingClasses ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
                        ) : classes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <SearchX className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium text-foreground">Sin clases hoy</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    No hay clases programadas para esta fecha.
                                </p>
                            </div>
                        ) : (
                            classes.map((clase) => (
                                <div key={clase.id} className="flex items-center justify-between border-b py-3 hover:bg-muted/50 transition-colors rounded-md px-2 -mx-2 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{clase.start_time} - {clase.student_name}</p>
                                            <p className="text-xs text-muted-foreground">{clase.instructor_name} • {clase.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pagos Recientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Pagos Recientes</CardTitle>
                    <CardDescription>
                        Últimos ingresos registrados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {payments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Receipt className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium text-foreground">Sin pagos</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    No hay pagos recientes registrados.
                                </p>
                            </div>
                        ) : (
                            payments.slice(0, 3).map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between border-b py-3 hover:bg-muted/50 transition-colors rounded-md px-2 -mx-2 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                {payment.student?.first_name?.[0]}
                                                {payment.student?.last_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {payment.student?.first_name} {payment.student?.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {payment.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="font-medium text-emerald-600">
                                        +${Number(payment.amount).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
