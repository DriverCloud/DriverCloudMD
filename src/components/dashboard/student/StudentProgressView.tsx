'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, Target } from "lucide-react";

interface StudentProgressViewProps {
    credits: {
        total: number;
        used: number; // Completed + Scheduled? Usually just Completed counts towards "Progress", but Scheduled counts towards "Usage".
        remaining: number;
    };
    attendance: {
        present: number;
        absent: number;
        total: number;
    };
    loading: boolean;
}

export function StudentProgressView({ credits, attendance, loading }: StudentProgressViewProps) {
    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Cargando progreso...</div>;
    }

    // Logic: Progress is based on "Completed" vs "Total Purchased". 
    // If user buys more packs, total increases, so percentage might drop or stay relative.

    // We assume 'used' here means 'completed' appointments.
    const progressPercentage = credits.total > 0 ? (credits.used / credits.total) * 100 : 0;

    // Attendance Rate
    const attendanceRate = attendance.total > 0 ? (attendance.present / attendance.total) * 100 : 100;

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Mi Progreso</h1>
                <p className="text-muted-foreground">
                    Sigue tu avance en el curso de manejo.
                </p>
            </div>

            {/* Main Progress Card */}
            <Card className="border-2 border-primary/10 bg-gradient-to-br from-background to-muted/20">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Avance General</span>
                        <span className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Progress value={progressPercentage} className="h-4" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{credits.used} clases completadas</span>
                        <span>Meta: {credits.total} clases</span>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Clases Restantes
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{credits.remaining}</div>
                        <p className="text-xs text-muted-foreground">
                            Disponibles para agendar/cursar
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Historial Completado
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{credits.used}</div>
                        <p className="text-xs text-muted-foreground">
                            Clases finalizadas exitosamente
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Asistencia
                        </CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(attendanceRate)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {attendance.present} asistencias, {attendance.absent} ausencias
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
