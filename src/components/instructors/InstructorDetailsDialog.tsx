'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, User, Phone, Mail, Calendar, MapPin, ShieldAlert, BadgeInfo } from 'lucide-react';
import { EditInstructorDialog } from './EditInstructorDialog';
import { useState } from 'react';

interface InstructorDetailsDialogProps {
    instructor: {
        id: string;
        first_name: string;
        last_name: string;
        email?: string;
        phone?: string;
        birth_date?: string;
        cuil?: string;
        address?: string;
        emergency_contact_name?: string;
        emergency_contact_phone?: string;
        license_number?: string;
        license_expiry?: string;
    };
    children?: React.ReactNode;
}

export function InstructorDetailsDialog({ instructor, children }: InstructorDetailsDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" />
                            {instructor.first_name} {instructor.last_name}
                        </DialogTitle>
                        <EditInstructorDialog instructor={instructor}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Pencil className="h-4 w-4" />
                                Editar
                            </Button>
                        </EditInstructorDialog>
                    </div>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Información de contacto */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Contacto
                        </h3>
                        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                            <div>
                                <p className="text-xs text-muted-foreground lowercase">Email</p>
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    {instructor.email || 'No especificado'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground lowercase">Teléfono</p>
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    {instructor.phone || 'No especificado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Datos Personales */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <BadgeInfo className="h-4 w-4" /> Datos Personales
                        </h3>
                        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                            <div>
                                <p className="text-xs text-muted-foreground lowercase">CUIL</p>
                                <p className="text-sm font-medium">{instructor.cuil || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground lowercase">Fecha de Nacimiento</p>
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    {instructor.birth_date || '-'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground lowercase">Dirección</p>
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    {instructor.address || 'No especificada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Licencia */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" /> Licencia de Conducir
                        </h3>
                        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                            <div>
                                <p className="text-xs text-muted-foreground lowercase">Número</p>
                                <p className="text-sm font-bold">{instructor.license_number || 'No cargada'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground lowercase">Vencimiento</p>
                                <p className="text-sm font-medium">{instructor.license_expiry || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Emergencia */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" /> Contacto de Emergencia
                        </h3>
                        <div className="grid grid-cols-2 gap-4 bg-destructive/5 p-4 rounded-lg border-l-4 border-destructive">
                            <div>
                                <p className="text-xs text-muted-foreground lowercase">Nombre</p>
                                <p className="text-sm font-medium">{instructor.emergency_contact_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground lowercase">Teléfono</p>
                                <p className="text-sm font-medium">{instructor.emergency_contact_phone || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
