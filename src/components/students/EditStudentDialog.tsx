'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateStudent } from '@/app/(auth)/dashboard/students/actions';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil } from 'lucide-react';

interface EditStudentDialogProps {
    student: {
        id: string;
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
        dni: string | null;
        address: string | null;
        date_of_birth: string | null;
        referral_source: string | null;
        has_license: boolean | null;
        gender: string | null;
        status: string | null;
        disability_observation: string | null;
        emergency_contact_name?: string | null;
        emergency_contact_phone?: string | null;
        emergency_contact_relation?: string | null;
    };
}

export function EditStudentDialog({ student }: EditStudentDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateStudent(student.id, formData);

        if (result.success) {
            setOpen(false);
            router.refresh();
        } else {
            setError(result.error || 'Error desconocido');
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Estudiante</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del estudiante. Los campos marcados con * son obligatorios.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">Nombre *</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    defaultValue={student.first_name}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Apellido *</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    defaultValue={student.last_name}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={student.email || ''}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Género</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    defaultValue={student.gender || 'other'}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={loading}
                                >
                                    <option value="other">Otro</option>
                                    <option value="male">Hombre</option>
                                    <option value="female">Mujer</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dni">DNI / Identificación</Label>
                                <Input
                                    id="dni"
                                    name="dni"
                                    defaultValue={student.dni || ''}
                                    placeholder="Ingrese DNI"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={student.status || 'active'}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={loading}
                                >
                                    <option value="active">Activo (En Curso)</option>
                                    <option value="paused">En Pausa (Suspendido)</option>
                                    <option value="finished">Finalizado (Sin Examen)</option>
                                    <option value="graduated">Graduado (Licencia Obtenida)</option>
                                    <option value="failed">Reprobado / Requiere Refuerzo</option>
                                    <option value="abandoned">Abandono</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={student.phone || ''}
                                    placeholder="+54 11 ..."
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={student.address || ''}
                                    placeholder="Calle, Número, Localidad"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                                <Input
                                    id="date_of_birth"
                                    name="date_of_birth"
                                    type="date"
                                    defaultValue={student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : ''}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="referral_source">¿Cómo nos conoció?</Label>
                                <select
                                    id="referral_source"
                                    name="referral_source"
                                    defaultValue={student.referral_source || ''}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={loading}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Meta">Meta (Facebook/Instagram)</option>
                                    <option value="Google Maps">Google Maps</option>
                                    <option value="Conocidos">Conocidos</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="checkbox"
                                    id="has_license"
                                    name="has_license"
                                    value="true"
                                    defaultChecked={!!student.has_license}
                                    className="h-4 w-4 w-auto shadow-none border-slate-300"
                                />
                                <Label htmlFor="has_license">¿Posee Licencia de Conducir?</Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="disability_observation">Observaciones / Discapacidad</Label>
                            <Textarea
                                id="disability_observation"
                                name="disability_observation"
                                defaultValue={student.disability_observation || ''}
                                placeholder="Detalle cualquier condición relevante o incapacidad"
                                disabled={loading}
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="font-medium mb-3">Contacto de Emergencia</h3>
                            <div className="grid gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_name">Nombre Completo</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        name="emergency_contact_name"
                                        defaultValue={student.emergency_contact_name || ''}
                                        placeholder="María López"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact_relation">Parentesco</Label>
                                        <Input
                                            id="emergency_contact_relation"
                                            name="emergency_contact_relation"
                                            defaultValue={student.emergency_contact_relation || ''}
                                            placeholder="Madre"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                                        <Input
                                            id="emergency_contact_phone"
                                            name="emergency_contact_phone"
                                            defaultValue={student.emergency_contact_phone || ''}
                                            placeholder="+54 11 ..."
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent >
        </Dialog >
    );
}
