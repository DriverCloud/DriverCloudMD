'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EvaluationData {
    rating: number;
    public_comment: string;
    private_notes?: string;
}

interface EvaluationViewProps {
    evaluation: EvaluationData;
    studentName: string;
    isInstructorOrAdmin: boolean;
}

export function EvaluationView({ evaluation, studentName, isInstructorOrAdmin }: EvaluationViewProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-yellow-600">
                    ★ {evaluation.rating}/5
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Evaluación de {studentName}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Calificación:</span>
                        <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                    {star <= evaluation.rating ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-1">Comentario:</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                            {evaluation.public_comment}
                        </p>
                    </div>
                    {isInstructorOrAdmin && evaluation.private_notes && (
                        <div>
                            <h4 className="font-bold mb-1 text-red-600">Notas Privadas:</h4>
                            <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-md border border-red-100">
                                {evaluation.private_notes}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
