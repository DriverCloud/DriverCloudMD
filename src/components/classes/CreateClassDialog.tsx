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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createAppointment } from '@/app/(auth)/(dashboard)/classes/actions';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';

interface CreateClassDialogProps {
    resources: {
        students: any[];
        instructors: any[];
        vehicles: any[];
        classTypes: any[];
    };
}

export function CreateClassDialog({ resources }: CreateClassDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createAppointment(formData);

        if (result.success) {
            setOpen(false);
            router.refresh(); // Refresh server component
        } else {
            setError(result.error || 'Error desconocido');
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agendar Clase
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Agendar Nueva Clase</DialogTitle>
                        <DialogDescription>
                            Programa un turno para un estudiante.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="student_id">Estudiante *</Label>
                            <Select name="student_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estudiante" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resources.students.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.first_name} {s.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Fecha *</Label>
                                <Input type="date" name="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Hora *</Label>
                                <Input type="time" name="start_time" step="900" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class_type_id">Tipo de Clase *</Label>
                            <Select name="class_type_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resources.classTypes.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name} ({t.duration_minutes} min)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instructor_id">Instructor *</Label>
                            <Select name="instructor_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar instructor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resources.instructors.map((i: any) => (
                                        <SelectItem key={i.id} value={i.id}>
                                            {i.first_name} {i.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vehicle_id">Vehículo *</Label>
                            <Select name="vehicle_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar vehículo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resources.vehicles.map((v: any) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            {v.brand} {v.model} ({v.license_plate})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            Agendar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
