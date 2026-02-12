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
import { createPackage } from '@/app/(auth)/dashboard/students/actions';
import { Loader2, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SellPackageDialogProps {
    studentId: string;
    studentName: string;
    trigger?: React.ReactNode;
}

export function SellPackageDialog({ studentId, studentName, trigger }: SellPackageDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPkgId, setSelectedPkgId] = useState<string>('');
    const [isManual, setIsManual] = useState(false);

    // Form states for manual override
    const [pkgName, setPkgName] = useState('');
    const [pkgCredits, setPkgCredits] = useState(10);
    const [pkgPrice, setPkgPrice] = useState(0);

    // Initial load
    useEffect(() => {
        if (open) {
            import('@/app/(auth)/dashboard/settings/packages-actions').then(mod => {
                mod.getCoursePackages().then(res => {
                    if (res.success) setPackages(res.data || []);
                });
            });
        }
    }, [open]);

    const handlePackageSelect = (pkgId: string) => {
        setSelectedPkgId(pkgId);
        setIsManual(false); // Reset manual mode when selecting a new package
        const pkg = packages.find(p => p.id === pkgId);
        if (pkg) {
            setPkgName(pkg.name);
            setPkgCredits(pkg.class_count);
            setPkgPrice(pkg.price);
        } else {
            // Reset if cleared
            setPkgName('');
            setPkgCredits(1);
            setPkgPrice(0);
        }
    };

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
                {trigger || (
                    <Button variant="ghost" size="icon" title="Vender Paquete">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Vender Paquete</DialogTitle>
                        <DialogDescription>
                            Asignar un nuevo paquete de clases a {studentName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        {/* Package Template Selector */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Seleccionar Cursos / Paquete</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-blue-600 hover:text-blue-700"
                                    onClick={() => {
                                        setIsManual(!isManual);
                                        if (!isManual) setSelectedPkgId(''); // clear selection if going fully manual
                                    }}
                                >
                                    {isManual ? 'Cancelar edición manual' : 'Editar manualmente'}
                                </Button>
                            </div>
                            <div className="grid gap-2">
                                {packages.length > 0 ? (
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedPkgId}
                                        onChange={(e) => handlePackageSelect(e.target.value)}
                                        disabled={isManual && !selectedPkgId}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {packages.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.class_count} clases) - ${p.price}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No hay paquetes configurados.</p>
                                )}
                            </div>
                        </div>

                        {/* Details Section - Only show if Manual Mode OR a package is selected */}
                        {(isManual || selectedPkgId) && (
                            <div className="space-y-4 border-t pt-4 bg-slate-50 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Paquete</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Ej. Pack 10 Clases"
                                        value={pkgName}
                                        onChange={(e) => setPkgName(e.target.value)}
                                        readOnly={!isManual}
                                        className={!isManual ? "bg-muted text-muted-foreground" : ""}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="credits">Créditos (Clases)</Label>
                                        <Input
                                            id="credits"
                                            name="credits"
                                            type="number"
                                            min="1"
                                            value={pkgCredits}
                                            onChange={(e) => setPkgCredits(parseInt(e.target.value))}
                                            readOnly={!isManual}
                                            className={!isManual ? "bg-muted text-muted-foreground" : ""}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio ($)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={pkgPrice}
                                            onChange={(e) => setPkgPrice(parseFloat(e.target.value))}
                                            readOnly={!isManual}
                                            className={!isManual ? "bg-muted text-muted-foreground" : ""}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
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
