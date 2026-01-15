'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Calendar, CreditCard, ChevronLeft, FileText, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SellPackageDialog } from './SellPackageDialog';
import { EditStudentDialog } from './EditStudentDialog';

interface StudentProfileHeaderProps {
    student: any;
    balance: any;
    userRole?: string | null;
}

export function StudentProfileHeader({ student, balance, userRole }: StudentProfileHeaderProps) {
    const router = useRouter();
    const isInstructor = userRole === 'instructor';

    return (
        <div className="space-y-4">
            <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a Estudiantes
            </Button>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Main Info Card */}
                <Card className="flex-1">
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
                                <div className="flex gap-2">
                                    <EditStudentDialog student={student} />
                                    <SellPackageDialog studentId={student.id} studentName={`${student.first_name} ${student.last_name}`} />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            {/* Personal Info */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Información Personal
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">DNI</p>
                                        <p className="font-medium">{student.dni || 'No registrado'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Dirección</p>
                                        <p className="font-medium">{student.address || 'No registrada'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">¿Tiene Licencia?</p>
                                        <p className="font-medium">
                                            {student.has_license ? (
                                                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">SÍ</Badge>
                                            ) : (
                                                <Badge variant="outline">NO</Badge>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {student.disability_observation && (
                                    <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded-md">
                                        <p className="text-xs uppercase tracking-wider text-yellow-700 dark:text-yellow-500 font-semibold mb-1">
                                            Observaciones / Incapacidad
                                        </p>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                            {student.disability_observation}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Emergency Contact */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    Contacto de Emergencia
                                </h3>
                                {student.emergency_contact_name ? (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="col-span-2">
                                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Nombre</p>
                                            <p className="font-medium">{student.emergency_contact_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Relación</p>
                                            <p className="font-medium">{student.emergency_contact_relation || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Teléfono</p>
                                            <p className="font-medium">{student.emergency_contact_phone || '-'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No hay contacto de emergencia registrado</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Balance Card */}
                <Card className="w-full md:w-80 h-fit">
                    <CardContent className="p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-medium">Cuenta Corriente</span>
                        </div>
                        <div className={cn("text-4xl font-bold",
                            balance.balance < 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                            ${balance.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Deuda Total: ${balance.total_debt?.toLocaleString() || 0}
                            <br />
                            Pagado: ${balance.total_paid?.toLocaleString() || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
