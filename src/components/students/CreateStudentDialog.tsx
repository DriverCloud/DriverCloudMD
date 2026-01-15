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
import { Textarea } from "@/components/ui/textarea"

import { createStudent } from '@/app/(auth)/dashboard/students/actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function CreateStudentDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createStudent(formData);

        if (result.success) {
            setOpen(false);
            router.refresh();
            // Reset form
            (e.target as HTMLFormElement).reset();
        } else {
            setError(result.error || 'Error desconocido');
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Nuevo Estudiante</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nuevo Estudiante</DialogTitle>
                        <DialogDescription>
                            Completa los datos del nuevo estudiante. Los campos marcados con * son obligatorios.
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
                                    placeholder="Juan"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Apellido *</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    placeholder="Pérez"
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
                                    placeholder="juan.perez@example.com"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Género</Label>
                                <select
                                    id="gender"
                                    name="gender"
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
                                    defaultValue="active"
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
                                    placeholder="+54 11 ..."
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder="Calle, Número, Localidad"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="checkbox"
                                    id="has_license"
                                    name="has_license"
                                    value="true"
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
                                placeholder="Detalle cualquier condición relevante o incapacidad (auditiva, motora, etc.)"
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
                                            placeholder="Madre"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                                        <Input
                                            id="emergency_contact_phone"
                                            name="emergency_contact_phone"
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
                            Crear Estudiante
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
