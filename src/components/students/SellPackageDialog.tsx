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
import { createPackage } from '@/app/(auth)/(dashboard)/students/actions';
import { Loader2, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SellPackageDialogProps {
    studentId: string;
    studentName: string;
}

export function SellPackageDialog({ studentId, studentName }: SellPackageDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        formData.append('student_id', studentId);

        const result = await createPackage(formData);

        if (result.success) {
            setOpen(false);
            router.refresh();
        } else {
            setError(result.error || 'Error al crear el paquete');
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Vender Paquete">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Vender Paquete</DialogTitle>
                        <DialogDescription>
                            Asignar un nuevo paquete de clases a {studentName}.
                            Esto generará una deuda en su cuenta.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Paquete</Label>
                            <Input id="name" name="name" placeholder="Ej. Pack 10 Clases" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="credits">Créditos (Clases)</Label>
                                <Input id="credits" name="credits" type="number" min="1" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio ($)</Label>
                                <Input id="price" name="price" type="number" min="0" step="0.01" required />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Venta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
