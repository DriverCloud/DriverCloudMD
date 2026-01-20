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
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Calendar as CalendarIcon, Clock, User, Car, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { updateAppointment, cancelAppointment } from '@/app/(auth)/dashboard/classes/actions';
import { EvaluationForm } from '@/components/evaluations/EvaluationForm';
import { EvaluationView } from '@/components/evaluations/EvaluationView';

interface EditClassDialogProps {
    resources: {
        students: any[];
        instructors: any[];
        vehicles: any[];
        classTypes: any[];
    };
    appointment: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userRole: string;
}

export function EditClassDialog({
    resources,
    appointment,
    open,
    onOpenChange,
    userRole,
}: EditClassDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    const isInstructor = userRole === 'instructor';

    if (!appointment) return null;

    const handleCancel = async () => {
        if (!confirm('¿Estás seguro de cancelar esta clase?')) return;

        setLoading(true);
        setError(null);

        const result = await cancelAppointment(appointment.id);

        if (result.success) {
            onOpenChange(false);
            router.refresh();
        } else {
            setError(result.error || 'Error al cancelar');
        }

        setLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);
            const result = await updateAppointment(appointment.id, formData);

            if (result.success) {
                setIsEditing(false);
                onOpenChange(false);
                router.refresh();
            } else {
                setError(result.error || 'Error al actualizar');
            }
        } catch (err) {
            console.error('Error updating appointment:', err);
            setError('Error crítico al actualizar');
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            onOpenChange(newOpen);
            if (!newOpen) {
                setIsEditing(false);
                setError(null);
            }
        }}>
            <DialogContent
                className="sm:max-w-[500px]"
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onFocusOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Clase' : 'Detalles de la Clase'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modifica los datos del turno.' : 'Información del turno agendado.'}
                    </DialogDescription>
                </DialogHeader>

                <form id="edit-class-form" onSubmit={handleUpdate} className="grid gap-6 py-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex justify-between items-center">
                        <Badge
                            variant={
                                appointment.status === 'scheduled' ? 'secondary' :
                                    appointment.status === 'completed' ? 'default' : 'destructive'
                            }
                            className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm px-3 py-1"
                        >
                            {appointment.status === 'scheduled' ? 'Agendado' :
                                appointment.status === 'completed' ? 'Completado' : 'Cancelado'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            ID: {appointment.id.slice(0, 8)}
                        </span>
                    </div>

                    {isEditing ? (
                        <>
                            {/* Edit Mode - Form Fields */}
                            <div className="space-y-2">
                                <Label htmlFor="student_id">Estudiante *</Label>
                                <Select name="student_id" defaultValue={appointment.student_id} required disabled={isInstructor}>
                                    <SelectTrigger className={isInstructor ? "bg-muted text-muted-foreground" : ""}>
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
                                {isInstructor && <input type="hidden" name="student_id" value={appointment.student_id} />}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Fecha *</Label>
                                    <Input
                                        type="date"
                                        name="date"
                                        required
                                        defaultValue={appointment.scheduled_date}
                                        readOnly={isInstructor}
                                        className={isInstructor ? "bg-muted text-muted-foreground" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Hora *</Label>
                                    <Input
                                        type="time"
                                        name="start_time"
                                        step="900"
                                        required
                                        defaultValue={appointment.start_time.slice(0, 5)}
                                        readOnly={isInstructor}
                                        className={isInstructor ? "bg-muted text-muted-foreground" : ""}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="class_type_id">Tipo de Clase *</Label>
                                <Select name="class_type_id" defaultValue={appointment.class_type_id} required disabled={isInstructor}>
                                    <SelectTrigger className={isInstructor ? "bg-muted text-muted-foreground" : ""}>
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
                                {isInstructor && <input type="hidden" name="class_type_id" value={appointment.class_type_id} />}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instructor_id">Instructor *</Label>
                                <Select name="instructor_id" defaultValue={appointment.instructor_id} required disabled={isInstructor}>
                                    <SelectTrigger className={isInstructor ? "bg-muted text-muted-foreground" : ""}>
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
                                {isInstructor && <input type="hidden" name="instructor_id" value={appointment.instructor_id} />}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select name="status" defaultValue={appointment.status || 'scheduled'} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Agendado</SelectItem>
                                        <SelectItem value="rescheduled" disabled={isInstructor}>Reprogramado</SelectItem>
                                        <SelectItem value="completed">Completado</SelectItem>
                                        <SelectItem value="cancelled" disabled={isInstructor}>Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicle_id">Vehículo *</Label>
                                <Select name="vehicle_id" defaultValue={appointment.vehicle_id} required disabled={isInstructor}>

                                    <SelectTrigger className={isInstructor ? "bg-muted text-muted-foreground" : ""}>
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
                                {isInstructor && <input type="hidden" name="vehicle_id" value={appointment.vehicle_id} />}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* View Mode - Display Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Fecha</Label>
                                    <div className="flex items-center font-medium">
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {appointment.scheduled_date}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Hora</Label>
                                    <div className="flex items-center font-medium">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {appointment.start_time.slice(0, 5)} - {appointment.end_time?.slice(0, 5)}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs text-muted-foreground">Estudiante</Label>
                                    <div className="flex items-center text-lg font-semibold">
                                        <User className="mr-2 h-5 w-5 text-muted-foreground" />
                                        {appointment.student?.first_name} {appointment.student?.last_name}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1">
                                        <Label className="text-xs text-muted-foreground">Instructor</Label>
                                        <div className="font-medium">
                                            {appointment.instructor?.first_name} {appointment.instructor?.last_name}
                                        </div>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label className="text-xs text-muted-foreground">Vehículo</Label>
                                        <div className="font-medium flex items-center">
                                            <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {appointment.vehicle?.brand} {appointment.vehicle?.model}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                <DialogFooter className="sm:justify-between">
                    <div className="flex gap-2 ml-auto">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (isEditing) {
                                    setIsEditing(false);
                                    setError(null);
                                } else {
                                    onOpenChange(false);
                                }
                            }}
                        >
                            {isEditing ? 'Cancelar' : 'Cerrar'}
                        </Button>
                        {appointment.status === 'scheduled' && (
                            <>
                                {!isEditing ? (
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsEditing(true);
                                        }}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        form="edit-class-form"
                                        disabled={loading}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Evaluation Section */}
                    {!isEditing && appointment.status === 'completed' && (
                        <div className="flex justify-end gap-2 mt-2 w-full border-t pt-4">
                            {Array.isArray(appointment.evaluation) && appointment.evaluation.length > 0 ? (
                                <EvaluationView
                                    evaluation={appointment.evaluation[0]}
                                    studentName={`${appointment.student?.first_name} ${appointment.student?.last_name}`}
                                    isInstructorOrAdmin={true}
                                />
                            ) : (
                                <EvaluationForm
                                    appointmentId={appointment.id}
                                    studentId={appointment.student_id}
                                    instructorId={appointment.instructor_id}
                                    studentName={`${appointment.student?.first_name} ${appointment.student?.last_name}`}
                                />
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
