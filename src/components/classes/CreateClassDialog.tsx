'use client'

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createAppointment } from '@/app/(auth)/dashboard/classes/actions';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';

interface CreateClassDialogProps {
    resources: {
        students: any[];
        instructors: any[];
        vehicles: any[];
        classTypes: any[];
    };
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultDate?: string; // YYYY-MM-DD
    defaultTime?: string; // HH:MM
    trigger?: React.ReactNode; // Custom trigger button
}

export function CreateClassDialog({
    resources,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    defaultDate,
    defaultTime,
    trigger
}: CreateClassDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    // Helper to close dialog safely
    const handleClose = (newOpen: boolean) => {
        if (setOpen) setOpen(newOpen);
        if (!newOpen) {
            setError(null);
            // Optional: reset form if needed, but HTML form resets on unmount usually
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createAppointment(formData);

        if (result.success) {
            handleClose(false);
            router.refresh();
        } else {
            setError(result.error || 'Error desconocido');
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            {/* Only render DialogTrigger if a trigger prop is passed OR if we are uncontrolled generic usage */}
            {(trigger || !isControlled) && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Agendar Clase
                        </Button>
                    )}
                </DialogTrigger>
            )}

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
                                <Input
                                    type="date"
                                    name="date"
                                    required
                                    defaultValue={defaultDate}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Hora *</Label>
                                <Input
                                    type="time"
                                    name="start_time"
                                    step="900"
                                    required
                                    defaultValue={defaultTime}
                                />
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

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas (Opcional)</Label>
                            <Textarea
                                name="notes"
                                placeholder="Detalles adicionales sobre la clase..."
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
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
