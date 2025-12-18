'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClassHistoryProps {
    appointments: any[];
}

export function ClassHistory({ appointments }: ClassHistoryProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Clases</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="p-3 text-left">Fecha</th>
                                <th className="p-3 text-left">Hora</th>
                                <th className="p-3 text-left">Instructor</th>
                                <th className="p-3 text-left">Vehículo</th>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((apt) => {
                                // Parse date: scheduled_date is YYYY-MM-DD
                                const [year, month, day] = apt.scheduled_date.split('-');
                                const date = new Date(year, month - 1, day);
                                const dateStr = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

                                // Time is already in HH:MM:SS format, generally we want HH:MM
                                const timeStr = apt.start_time.slice(0, 5);

                                return (
                                    <tr key={apt.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3 font-medium">{dateStr}</td>
                                        <td className="p-3">{timeStr}</td>
                                        <td className="p-3">
                                            {apt.instructor ? `${apt.instructor.first_name} ${apt.instructor.last_name}` : '-'}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {apt.vehicle?.name || '-'}
                                        </td>
                                        <td className="p-3">
                                            {apt.class_type?.name || 'Clase Práctica'}
                                        </td>
                                        <td className="p-3 text-right">
                                            <Badge variant="outline" className={
                                                apt.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    apt.status === 'canceled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                            }>
                                                {apt.status === 'confirmed' ? 'Confirmada' :
                                                    apt.status === 'completed' ? 'Realizada' :
                                                        apt.status === 'canceled' ? 'Cancelada' : apt.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No hay clases registradas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
