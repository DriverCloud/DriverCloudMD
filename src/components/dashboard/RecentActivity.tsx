"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { paymentsService, Payment } from "@/features/finance/services/payments.service";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function RecentActivity() {
    const [activities, setActivities] = useState<Payment[]>([]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const payments = await paymentsService.getRecentPayments();
                setActivities(payments);
            } catch (error) {
                console.error(error);
            }
        };
        fetchActivity();
    }, []);

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                    Últimas transacciones registradas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No hay actividad reciente.
                        </p>
                    ) : (
                        activities.map((payment) => (
                            <div key={payment.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                        {payment.student?.first_name?.[0]}
                                        {payment.student?.last_name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {payment.student?.first_name} {payment.student?.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Pago registrado con {payment.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    +${Number(payment.amount).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
