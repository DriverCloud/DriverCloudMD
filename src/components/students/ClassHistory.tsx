'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { EvaluationView } from '@/components/evaluations/EvaluationView';

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
                                <th className="p-3 text-center">Estado</th>
                                <th className="p-3 text-right">Acciones</th>
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

                                const evaluationData = Array.isArray(apt.evaluation) ? apt.evaluation[0] : apt.evaluation;
                                const hasEvaluation = evaluationData && Object.keys(evaluationData).length > 0;

                                return (
                                    <tr key={apt.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3 font-medium">{dateStr}</td>
                                        <td className="p-3">{timeStr}</td>
                                        <td className="p-3">
                                            {apt.instructor ? `${apt.instructor.first_name} ${apt.instructor.last_name}` : '-'}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {apt.vehicle ? `${apt.vehicle.brand} ${apt.vehicle.model}` : '-'}
                                        </td>
                                        <td className="p-3">
                                            {apt.class_type?.name || 'Clase Práctica'}
                                        </td>
                                        <td className="p-3 text-center">
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
                                        <td className="p-3 text-right">
                                            {apt.status === 'completed' && hasEvaluation && (
                                                <div className="flex justify-end">
                                                    <EvaluationView
                                                        evaluation={evaluationData}
                                                        studentName="Alumno" // Context is mostly clear in student profile
                                                        isInstructorOrAdmin={true}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-slate-900">Sin clases agendadas</p>
                                                <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
                                                    Este alumno aún no tiene turnos registrados en el sistema.
                                                </p>
                                            </div>
                                            <Button asChild variant="outline" size="sm" className="mt-2">
                                                <Link href={`/dashboard/classes?studentId=${appointments[0]?.student_id || ''}`}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Agendar Primera Clase
                                                </Link>
                                            </Button>
                                        </div>
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
