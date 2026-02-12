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
import { Label } from '@/components/ui/label';
import { createInstructor, getClassTypes } from '@/app/(auth)/dashboard/instructors/actions';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CreateInstructorDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [salaryType, setSalaryType] = useState<string>('per_class');

    // Rates State
    const [classTypes, setClassTypes] = useState<any[]>([]);
    const [rates, setRates] = useState<any[]>([]);
    const [newRateType, setNewRateType] = useState<string>('');
    const [newRateAmount, setNewRateAmount] = useState<string>('');

    const router = useRouter();

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                const types = await getClassTypes();
                setClassTypes(types || []);
            };
            fetchData();
        }
    }, [open]);

    const handleAddRate = () => {
        if (!newRateType || !newRateAmount) return;

        // Check if exists
        if (rates.some(r => r.class_type_id === newRateType)) {
            return; // Already exists
        }

        const type = classTypes.find(t => t.id === newRateType);

        setRates([...rates, {
            class_type_id: newRateType,
            amount: parseFloat(newRateAmount),
            // optimistically add name for display
            class_types: { name: type?.name }
        }]);
        setNewRateType('');
        setNewRateAmount('');
    };

    const handleRemoveRate = (classTypeId: string) => {
        setRates(rates.filter(r => r.class_type_id !== classTypeId));
    };

    // Helper to get name of class type
    const getTypeName = (rate: any) => {
        if (rate.class_types?.name) return rate.class_types.name;
        const type = classTypes.find(t => t.id === rate.class_type_id);
        return type ? type.name : 'Desconocido';
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Append Rates
        formData.append('rates', JSON.stringify(rates));

        const result = await createInstructor(formData);

        if (result.success) {
            setOpen(false);
            router.refresh();
            // Reset form
            (e.target as HTMLFormElement).reset();
            setSalaryType('per_class'); // Reset local state
            setRates([]); // Reset rates
            setNewRateType('');
            setNewRateAmount('');
        } else {
            setError(result.error || 'Error desconocido');
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Nuevo Instructor</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Instructor</DialogTitle>
                        <DialogDescription>
                            Completa los datos del nuevo instructor. Los campos marcados con * son obligatorios.
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
                                    placeholder="María"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Apellido *</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    placeholder="González"
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
                                placeholder="maria.gonzalez@example.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+54 11 1234-5678"
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
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cuil">CUIL</Label>
                                <Input
                                    id="cuil"
                                    name="cuil"
                                    placeholder="20-12345678-9"
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
                                disabled={loading}
                            />
                        </div>

                        {/* Configuración de Pago */}
                        <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                            <Label className="text-sm font-semibold text-primary flex items-center gap-2">
                                <span className="text-emerald-600">$</span> Acuerdo de Pago
                            </Label>
                            <div className="grid gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="salary_type">Modalidad de Cobro</Label>
                                    <select
                                        id="salary_type"
                                        name="salary_type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={salaryType}
                                        onChange={(e) => setSalaryType(e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="per_class">Por Clase (Comisión)</option>
                                        <option value="fixed">Sueldo Fijo Mensual</option>
                                        <option value="mixed">Mixto (Fijo + Comisión)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {(salaryType === 'fixed' || salaryType === 'mixed') && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <Label htmlFor="base_salary">Sueldo Base Mensual</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                <Input
                                                    id="base_salary"
                                                    name="base_salary"
                                                    type="number"
                                                    step="0.01"
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(salaryType === 'per_class' || salaryType === 'mixed') && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <Label htmlFor="price_per_class">Valor por Clase</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                <Input
                                                    id="price_per_class"
                                                    name="price_per_class"
                                                    type="number"
                                                    step="0.01"
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tarifas Específicas / Excepciones */}
                            {(salaryType === 'per_class' || salaryType === 'mixed') && (
                                <div className="pt-2 border-t space-y-3">
                                    <Label className="text-sm font-semibold">Tarifas por Tipo de Clase (Excepciones)</Label>

                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Tipo de Clase</Label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                                                value={newRateType}
                                                onChange={(e) => setNewRateType(e.target.value)}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {classTypes.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <Label className="text-xs">Monto</Label>
                                            <Input
                                                type="number"
                                                className="h-9"
                                                value={newRateAmount}
                                                onChange={(e) => setNewRateAmount(e.target.value)}
                                            />
                                        </div>
                                        <Button type="button" size="sm" onClick={handleAddRate} disabled={!newRateType || !newRateAmount}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {rates.length > 0 && (
                                        <div className="rounded-md border bg-background">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="h-8 hover:bg-transparent">
                                                        <TableHead className="h-8 text-xs">Tipo</TableHead>
                                                        <TableHead className="h-8 text-xs text-right">Monto</TableHead>
                                                        <TableHead className="h-8 w-[40px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {rates.map((rate) => (
                                                        <TableRow key={rate.class_type_id} className="h-9">
                                                            <TableCell className="py-1 text-sm font-medium">
                                                                {getTypeName(rate)}
                                                            </TableCell>
                                                            <TableCell className="py-1 text-sm text-right">
                                                                ${rate.amount}
                                                            </TableCell>
                                                            <TableCell className="py-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                    onClick={() => handleRemoveRate(rate.class_type_id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                                <Input
                                    id="emergency_contact_phone"
                                    name="emergency_contact_phone"
                                    placeholder="Teléfono alternativo"
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
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="license_expiry">Vencimiento</Label>
                                <Input
                                    id="license_expiry"
                                    name="license_expiry"
                                    type="date"
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
                        Crear Instructor
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
        </Dialog >
    );
}
