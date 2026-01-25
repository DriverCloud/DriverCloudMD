'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SellPackageDialog } from './SellPackageDialog';
import { EditStudentDialog } from './EditStudentDialog';

import { CreateClassDialog } from '../classes/CreateClassDialog';
import { Progress } from "@/components/ui/progress";

interface StudentProfileHeaderProps {
    student: any;
    balance: any;
    userRole?: string | null;
    resources?: any; // For CreateClassDialog
    packages?: any[]; // For progress calculation
}

export function StudentProfileHeader({ student, balance, userRole, resources, packages }: StudentProfileHeaderProps) {
    const router = useRouter();
    const isInstructor = userRole === 'instructor';

    // Calculate Progress
    const totalCredits = packages?.reduce((sum, pkg) => sum + (pkg.total_credits || 0), 0) || 0;
    const remainingCredits = packages?.reduce((sum, pkg) => sum + (pkg.remaining_credits || 0), 0) || 0;
    const usedCredits = totalCredits - remainingCredits;
    const progressPercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

    return (
        <div className="space-y-4">
            <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a Estudiantes
            </Button>

            {/* Main Info Card */}
            <Card className="flex-1 w-full">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">
                                {student.first_name} {student.last_name}
                            </h1>
                            <div className="flex gap-2 mb-4">
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                    {student.status === 'active' ? 'Activo' : student.status}
                                </Badge>

                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {student.email || 'Sin email'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {student.phone || 'Sin teléfono'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Registrado: {new Date(student.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {!isInstructor && (
                            <div className="flex flex-col gap-2 items-end">
                                <div className="flex gap-2">
                                    {resources && (
                                        <CreateClassDialog
                                            resources={resources}
                                            defaultStudentId={student.id}
                                            trigger={
                                                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    Agendar Clase
                                                </Button>
                                            }
                                        />
                                    )}
                                    <EditStudentDialog student={student} />
                                    <SellPackageDialog studentId={student.id} studentName={`${student.first_name} ${student.last_name}`} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar (Upselling Context) */}
                    {totalCredits > 0 && (
                        <div className="mt-4 mb-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-muted-foreground">Progreso del Curso</span>
                                <span className="font-bold text-primary">{usedCredits} / {totalCredits} Clases Completadas</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2.5" />
                            {usedCredits >= totalCredits && (
                                <p className="text-xs text-amber-600 mt-1 font-medium">
                                    ¡Curso completado! Sugiere un paquete de refuerzo o trámite de licencia.
                                </p>
                            )}
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
