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
import { updateInstructor } from '@/app/(auth)/dashboard/instructors/actions';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil } from 'lucide-react';

interface EditInstructorDialogProps {
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

export function EditInstructorDialog({ instructor, children }: EditInstructorDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await updateInstructor(instructor.id, formData);

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
                {children || (
                    <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Instructor</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del instructor. Los campos marcados con * son obligatorios.
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
                                    defaultValue={instructor.first_name}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Apellido *</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    defaultValue={instructor.last_name}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={instructor.email || ''}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={instructor.phone || ''}
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                                <Input
                                    id="birth_date"
                                    name="birth_date"
                                    type="date"
                                    defaultValue={instructor.birth_date || ''}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cuil">CUIL</Label>
                                <Input
                                    id="cuil"
                                    name="cuil"
                                    placeholder="20-12345678-9"
                                    defaultValue={instructor.cuil || ''}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="Calle Falsa 123, Quilmes"
                                defaultValue={instructor.address || ''}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-primary">Contacto de Emergencia</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_name">Nombre</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        name="emergency_contact_name"
                                        placeholder="Nombre del contacto"
                                        defaultValue={instructor.emergency_contact_name || ''}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                                    <Input
                                        id="emergency_contact_phone"
                                        name="emergency_contact_phone"
                                        placeholder="Teléfono alternativo"
                                        defaultValue={instructor.emergency_contact_phone || ''}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-primary">Licencia de Conducir</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="license_number">Número</Label>
                                    <Input
                                        id="license_number"
                                        name="license_number"
                                        placeholder="B-12345678"
                                        defaultValue={instructor.license_number || ''}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="license_expiry">Vencimiento</Label>
                                    <Input
                                        id="license_expiry"
                                        name="license_expiry"
                                        type="date"
                                        defaultValue={instructor.license_expiry || ''}
                                        disabled={loading}
                                    />
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
            </DialogContent>
        </Dialog>
    );
}
