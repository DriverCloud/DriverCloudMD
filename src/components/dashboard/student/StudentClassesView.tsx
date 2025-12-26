'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, AlertCircle, XCircle, Car } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StudentClassesViewProps {
    appointments: any[];
    loading: boolean;
}

export function StudentClassesView({ appointments, loading }: StudentClassesViewProps) {
    const router = useRouter();
    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Cargando tus clases...</div>;
    }

    const now = new Date();

    // Sort appointments: Upcoming first, then Past (reverse chronological)
    const upcoming = appointments.filter(a => new Date(a.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = appointments.filter(a => new Date(a.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Mis Clases</h1>
                <p className="text-muted-foreground">
                    Gestiona tus próximas clases prácticas y revisa tu historial.
                </p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
                    <TabsTrigger value="history">Historial ({past.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6 flex flex-col gap-4">
                    {upcoming.length > 0 ? (
                        upcoming.map((apt) => (
                            <ClassCard key={apt.id} appointment={apt} isUpcoming={true} router={router} />
                        ))
                    ) : (
                        <EmptyState message="No tienes clases agendadas próximamente." />
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-6 flex flex-col gap-4">
                    {past.length > 0 ? (
                        past.map((apt) => (
                            <ClassCard key={apt.id} appointment={apt} isUpcoming={false} router={router} />
                        ))
                    ) : (
                        <EmptyState message="No tienes clases pasadas." />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}


function ClassCard({ appointment, isUpcoming, router }: { appointment: any, isUpcoming: boolean, router: any }) {
    const [cancelLoading, setCancelLoading] = useState(false);

    async function handleCancel() {
        setCancelLoading(true);
        try {
            const { cancelAppointment } = await import('@/app/(auth)/dashboard/classes/actions');
            const result = await cancelAppointment(appointment.id);

            if (result.success) {
                router.refresh();
            } else {
                alert(result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error al conectar con el servidor");
        } finally {
            setCancelLoading(false);
        }
    }

    // Determine status color/text
    const statusMap: any = {
        'scheduled': { label: 'Confirmada', className: 'bg-emerald-100 text-emerald-800' },
        'completed': { label: 'Completada', className: 'bg-blue-100 text-blue-800' },
        'cancelled': { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
        'noshow': { label: 'No Asistió', className: 'bg-orange-100 text-orange-800' },
    };

    // Fallback
    const status = statusMap[appointment.status] || { label: appointment.status, className: 'bg-gray-100 text-gray-800' };

    const dateObj = new Date(appointment.date);
    const dateStr = dateObj.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <Card>
            <CardContent className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold capitalize">{dateStr}</h3>
                            <Badge variant="secondary" className={status.className}>{status.label}</Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{appointment.location?.name || 'Sede Principal'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-foreground">Instructor:</span>
                                <span>{appointment.instructor?.first_name} {appointment.instructor?.last_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Car className="h-4 w-4" />
                                <span>{appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model}` : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isUpcoming && appointment.status === 'scheduled' && (
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full md:w-auto">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Si cancelas con menos de 24hs de anticipación, es posible que pierdas tus créditos según la política de la escuela.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={cancelLoading}>Volver</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleCancel();
                                        }}
                                        disabled={cancelLoading}
                                    >
                                        {cancelLoading ? "Cancelando..." : "Sí, Cancelar Clase"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed text-center">
            <div className="bg-muted p-4 rounded-full mb-3">
                <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}
