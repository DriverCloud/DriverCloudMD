"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { paymentsService, Payment } from "@/features/finance/services/payments.service";
import { Calendar, User } from "lucide-react";

const MOCK_CLASSES = [
    {
        id: 1,
        student: "Ana Martínez",
        instructor: "Carlos Pérez",
        time: "10:00 AM",
        status: "Confirmada",
        date: "Hoy"
    },
    {
        id: 2,
        student: "Luis Rodríguez",
        instructor: "Maria García",
        time: "11:30 AM",
        status: "Pendiente",
        date: "Hoy"
    },
    {
        id: 3,
        student: "Elena Torres",
        instructor: "Carlos Pérez",
        time: "14:00 PM",
        status: "Confirmada",
        date: "Hoy"
    }
];

export function RecentActivity() {
    const [payments, setPayments] = useState<Payment[]>([]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const recentPayments = await paymentsService.getRecentPayments();
                setPayments(recentPayments);
            } catch (error) {
                console.error(error);
            }
        };
        fetchActivity();
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
                        {MOCK_CLASSES.map((clase) => (
                            <div key={clase.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                        <Calendar className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{clase.time} - {clase.student}</p>
                                        <p className="text-xs text-muted-foreground">{clase.instructor} • {clase.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No hay pagos recientes.
                            </p>
                        ) : (
                            payments.slice(0, 3).map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
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
