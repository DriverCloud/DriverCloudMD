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
import { Textarea } from '@/components/ui/textarea';
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
import { updateAppointment, cancelAppointment, updateAppointmentStatus } from '@/app/(auth)/dashboard/classes/actions';
import { EvaluationForm } from '@/components/evaluations/EvaluationForm';
import { EvaluationView } from '@/components/evaluations/EvaluationView';
import { cn } from '@/lib/utils';

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

                    {/* Status Badge / Quick Action - Only visible when NOT editing, or just show ID when editing */}
                    {!isEditing && (
                        <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-medium">Estado:</Label>
                                <Select
                                    defaultValue={appointment.status}
                                    onValueChange={async (val) => {
                                        setLoading(true);
                                        const res = await updateAppointmentStatus(appointment.id, val);
                                        if (res.success) {
                                            router.refresh();
                                        } else {
                                            setError(res.error || 'Error al actualizar estado');
                                        }
                                        setLoading(false);
                                    }}
                                    disabled={loading}
                                >
                                    <SelectTrigger className={cn(
                                        "w-[140px] h-8 text-xs font-medium border-0 focus:ring-0 focus:ring-offset-0",
                                        appointment.status === 'scheduled' ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                                            appointment.status === 'completed' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" :
                                                appointment.status === 'cancelled' ? "bg-red-100 text-red-800 hover:bg-red-200" :
                                                    "bg-gray-100 text-gray-800"
                                    )}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Agendado</SelectItem>
                                        <SelectItem value="completed">Completado</SelectItem>
                                        <SelectItem value="cancelled">Cancelado</SelectItem>
                                        <SelectItem value="rescheduled" disabled>Reprogramado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">
                                ID: {appointment.id.slice(0, 8)}
                            </span>
                        </div>
                    )}

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

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    name="notes"
                                    defaultValue={appointment.notes || ''}
                                    placeholder="Detalles sobre la clase..."
                                    readOnly={isInstructor}
                                    className={cn("resize-none", isInstructor && "bg-muted text-muted-foreground")}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* View Mode - Display Info */}
                            <div className="space-y-5">
                                {/* Student Card */}
                                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 shadow-sm">
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-primary/70 font-semibold uppercase tracking-wider mb-0.5">Estudiante</p>
                                        <h3 className="text-lg font-bold text-foreground truncate">
                                            {appointment.student?.first_name} {appointment.student?.last_name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Date & Time Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg border bg-card flex flex-col justify-center space-y-1 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Fecha</span>
                                        </div>
                                        <p className="font-semibold text-sm">{appointment.scheduled_date}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-card flex flex-col justify-center space-y-1 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Horario</span>
                                        </div>
                                        <p className="font-semibold text-sm">
                                            {appointment.start_time.slice(0, 5)} - {appointment.end_time?.slice(0, 5)}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="my-2" />

                                {/* Resources Section */}
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Recursos Asignados</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                                            <div className="bg-background p-2 rounded-full border shadow-sm">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Instructor</p>
                                                <p className="text-sm font-medium truncate">
                                                    {appointment.instructor?.first_name} {appointment.instructor?.last_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                                            <div className="bg-background p-2 rounded-full border shadow-sm">
                                                <Car className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Vehículo</p>
                                                <p className="text-sm font-medium truncate">
                                                    {appointment.vehicle?.brand} {appointment.vehicle?.model}
                                                    <span className="text-xs text-muted-foreground ml-1">({appointment.vehicle?.license_plate})</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {appointment.notes && (
                                    <div className="bg-yellow-50/50 border border-yellow-100 p-3 rounded-lg text-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Edit className="h-3 w-3 text-yellow-600" />
                                            <span className="font-bold text-yellow-700 text-xs uppercase">Notas</span>
                                        </div>
                                        <p className="text-yellow-900/80 leading-relaxed pl-5">
                                            {appointment.notes}
                                        </p>
                                    </div>
                                )}
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
        </Dialog >
    );
}
