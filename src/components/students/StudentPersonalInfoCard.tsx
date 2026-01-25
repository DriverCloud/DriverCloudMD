'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Heart } from 'lucide-react';

interface StudentPersonalInfoCardProps {
    student: any;
}

export function StudentPersonalInfoCard({ student }: StudentPersonalInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información Personal
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
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
                    <div className="space-y-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
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
    );
}
