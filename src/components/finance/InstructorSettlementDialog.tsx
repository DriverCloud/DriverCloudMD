'use client';

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
import { Label } from '@/components/ui/label';
import { calculateSettlement, registerInstructorPayment, SettlementCalculation } from '@/app/(auth)/dashboard/finance/instructors/actions';
import { Loader2, Calculator, CheckCircle2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface InstructorSettlementDialogProps {
    instructor: {
        id: string;
        first_name: string;
        last_name: string;
    };
    children?: React.ReactNode;
}

export function InstructorSettlementDialog({ instructor, children }: InstructorSettlementDialogProps) {
    const [open, setOpen] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);
    const [notes, setNotes] = useState('');

    const [calculation, setCalculation] = useState<SettlementCalculation | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const handleCalculate = async () => {
        setCalculating(true);
        const result = await calculateSettlement(instructor.id, startDate, endDate);
        setCalculating(false);

        if (result.success && result.data) {
            setCalculation(result.data);
        } else {
            toast.error(result.error || 'Error al calcular');
        }
    };

    const handlePayment = async () => {
        if (!calculation) return;

        setSubmitting(true);
        const result = await registerInstructorPayment({
            instructor_id: instructor.id,
            period_start: startDate,
            period_end: endDate,
            total_classes: calculation.stats.completed_classes,
            base_amount: calculation.amounts.base,
            vars_amount: calculation.amounts.variable,
            total_amount: calculation.amounts.total,
            notes: notes
        });
        setSubmitting(false);

        if (result.success) {
            toast.success('Pago registrado correctamente');
            setOpen(false);
        } else {
            toast.error(result.error || 'Error al registrar pago');
        }
    };

    // Reset when opening
    useEffect(() => {
        if (open) {
            setCalculation(null);
            setNotes('');
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button size="sm">Liquidar Sueldo</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Liquidar Sueldo - {instructor.first_name} {instructor.last_name}</DialogTitle>
                    <DialogDescription>
                        Selecciona el periodo para calcular las clases y el monto a pagar.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Desde</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hasta</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleCalculate}
                        disabled={calculating}
                        variant="secondary"
                        className="w-full"
                    >
                        {calculating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            <>
                                <Calculator className="mr-2 h-4 w-4" />
                                Calcular Liquidación
                            </>
                        )}
                    </Button>

                    {calculation && (
                        <div className="bg-muted p-4 rounded-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Modalidad:</span>
                                    <p className="font-medium capitalize">
                                        {calculation.instructor.salary_type.replace('_', ' ')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Clases Completadas:</span>
                                    <p className="font-medium">{calculation.stats.completed_classes} clases</p>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Básico Mensual:</span>
                                    <span>{formatCurrency(calculation.amounts.base)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Variable ({calculation.stats.completed_classes} x ${calculation.instructor.price_per_class}):
                                    </span>
                                    <span>{formatCurrency(calculation.amounts.variable)}</span>
                                </div>
                            </div>

                            {/* Breakdown Section */}
                            {calculation.breakdown && calculation.breakdown.length > 0 && (
                                <div className="mt-2 pl-4 text-xs text-muted-foreground space-y-1 bg-background/50 p-2 rounded border border-border/50">
                                    <p className="font-semibold uppercase tracking-wider mb-1 text-[10px]">Detalle por Valor</p>
                                    {calculation.breakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span>{item.count} clases x {formatCurrency(item.rate)}</span>
                                            <span className="font-mono">{formatCurrency(item.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-dashed">
                                <span>Total a Pagar:</span>
                                <span className="text-emerald-600">{formatCurrency(calculation.amounts.total)}</span>
                            </div>

                            <div className="pt-2">
                                <Label className="text-xs mb-1.5 block">Notas / Observaciones</Label>
                                <Input
                                    placeholder="Ej: Pago mes de Enero..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="bg-background"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handlePayment}
                        disabled={!calculation || submitting}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <DollarSign className="mr-2 h-4 w-4" />
                        Registrar Pago
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
