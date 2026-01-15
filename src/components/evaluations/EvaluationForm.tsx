'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createEvaluation } from '@/app/(auth)/dashboard/classes/evaluations/actions';
import { toast } from 'sonner';

interface EvaluationFormProps {
    appointmentId: string;
    studentId: string;
    instructorId: string;
    studentName: string;
}

export function EvaluationForm({ appointmentId, studentId, instructorId, studentName }: EvaluationFormProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('appointment_id', appointmentId);
        formData.append('student_id', studentId);
        formData.append('instructor_id', instructorId);
        formData.append('rating', rating.toString());

        const result = await createEvaluation(formData);

        if (result.success) {
            toast.success('Evaluación guardada correctamente');
            setOpen(false);
        } else {
            toast.error(result.error as string);
        }
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button">Evaluar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Evaluar a {studentName}</DialogTitle>
                    <DialogDescription>
                        Califica el desempeño del alumno en esta clase.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="rating">Calificación (1-5)</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="public_comment">Comentario Público</Label>
                        <Textarea
                            id="public_comment"
                            name="public_comment"
                            placeholder="Comentario visible para el alumno..."
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="private_notes">Notas Privadas (Opcional)</Label>
                        <Textarea
                            id="private_notes"
                            name="private_notes"
                            placeholder="Solo visible para instructores y staff..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Evaluación'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
