'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Loader2, Package, Tag, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { getCoursePackages, upsertCoursePackage, deleteCoursePackage } from '@/app/(auth)/dashboard/settings/packages-actions';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export function CoursePackagesSettings() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadPackages();
    }, []);

    async function loadPackages() {
        setLoading(true);
        const res = await getCoursePackages();
        if (res.success) {
            setPackages(res.data || []);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const res = await upsertCoursePackage(formData);

        if (res.success) {
            toast.success(selectedPkg ? 'Paquete actualizado' : 'Paquete creado');
            setOpen(false);
            setSelectedPkg(null);
            loadPackages();
        } else {
            toast.error(res.error);
        }
        setIsSubmitting(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de que deseas eliminar este paquete?')) return;

        const res = await deleteCoursePackage(id);
        if (res.success) {
            toast.success('Paquete eliminado');
            loadPackages();
        } else {
            toast.error(res.error);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Cursos y Paquetes</CardTitle>
                    <CardDescription>
                        Configura los paquetes de clases que vendes a tus alumnos (Ej: "Curso Básico - 10 Clases").
                    </CardDescription>
                </div>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) setSelectedPkg(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo Paquete
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{selectedPkg ? 'Editar Paquete' : 'Nuevo Paquete'}</DialogTitle>
                                <DialogDescription>
                                    Define el nombre, cantidad de clases y precio del paquete.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <input type="hidden" name="id" value={selectedPkg?.id || ''} />
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre del Paquete</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Ej: Curso Completo (20 Clases)"
                                        defaultValue={selectedPkg?.name || ''}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="class_count">Cantidad de Clases</Label>
                                        <Input
                                            id="class_count"
                                            name="class_count"
                                            type="number"
                                            min="1"
                                            defaultValue={selectedPkg?.class_count || 10}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Precio ($)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            defaultValue={selectedPkg?.price || ''}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="active"
                                        name="active"
                                        defaultChecked={selectedPkg?.active !== false}
                                    />
                                    <Label htmlFor="active" className="font-normal cursor-pointer text-sm">
                                        Paquete Activo (visible para ventas)
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {selectedPkg ? 'Guardar Cambios' : 'Crear Paquete'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Clases</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground p-8">
                                        No hay paquetes definidos. Crea uno para comenzar a vender.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                packages.map((pkg) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            {pkg.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Layers className="h-3 w-3 text-muted-foreground" />
                                                {pkg.class_count}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-medium text-emerald-600">
                                                $ {pkg.price}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {pkg.active ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Activo</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">Inactivo</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedPkg(pkg);
                                                        setOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(pkg.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
