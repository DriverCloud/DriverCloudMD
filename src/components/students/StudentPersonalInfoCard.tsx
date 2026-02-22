'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Heart, AlertCircle } from 'lucide-react';

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Info */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">DNI / Identificación</p>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{student.dni || 'No registrado'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Licencia de Conducir</p>
                                <div className="mt-1">
                                    {student.has_license ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors">SÍ POSEE</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-400 border-slate-200 font-medium">NO POSEE</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Dirección de Residencia</p>
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{student.address || 'No registrada'}</p>
                            </div>
                        </div>

                        {student.disability_observation && (
                            <div className="mt-4 bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-500">
                                        Observaciones y Salud
                                    </p>
                                </div>
                                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed italic">
                                    "{student.disability_observation}"
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
