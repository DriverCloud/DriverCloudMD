'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Loader2, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getClassTypes, upsertClassType, deleteClassType } from '@/app/(auth)/dashboard/settings/actions';

export function ClassTypesSettings() {
    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadTypes();
    }, []);

    async function loadTypes() {
        setLoading(true);
        const res = await getClassTypes();
        if (res.success) {
            setTypes(res.data || []);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const res = await upsertClassType(formData);

        if (res.success) {
            toast.success(selectedType ? 'Tipo de clase actualizado' : 'Tipo de clase creado');
            setOpen(false);
            setSelectedType(null);
            loadTypes();
        } else {
            toast.error(res.error);
        }
        setIsSubmitting(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de que deseas eliminar este tipo de clase?')) return;

        const res = await deleteClassType(id);
        if (res.success) {
            toast.success('Tipo de clase eliminado');
            loadTypes();
        } else {
            toast.error(res.error);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Tipos de Clase</CardTitle>
                    <CardDescription>
                        Define los nombres y duraciones de las clases que ofreces.
                    </CardDescription>
                </div>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) setSelectedType(null);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo Tipo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{selectedType ? 'Editar Tipo' : 'Nuevo Tipo de Clase'}</DialogTitle>
                                <DialogDescription>
                                    Configura el nombre y la duración predeterminada.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <input type="hidden" name="id" value={selectedType?.id || ''} />
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre de la Clase</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Ej: Clase Práctica 60m"
                                        defaultValue={selectedType?.name || ''}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="duration_minutes">Duración (minutos)</Label>
                                        <Input
                                            id="duration_minutes"
                                            name="duration_minutes"
                                            type="number"
                                            defaultValue={selectedType?.duration_minutes || 60}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="max_students">Alumnos Máx.</Label>
                                        <Input
                                            id="max_students"
                                            name="max_students"
                                            type="number"
                                            defaultValue={selectedType?.max_students || 1}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="is_practical"
                                        name="is_practical"
                                        defaultChecked={selectedType?.is_practical !== false}
                                    />
                                    <Label htmlFor="is_practical" className="font-normal cursor-pointer text-sm">
                                        Es una clase práctica (requiere vehículo)
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {selectedType ? 'Guardar Cambios' : 'Crear Tipo'}
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
                                <TableHead>Duración</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Capacidad</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {types.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground p-8">
                                        No hay tipos de clase definidos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                types.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-medium">{type.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                {type.duration_minutes} min
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {type.is_practical ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Práctica</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Teórica</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                {type.max_students}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedType(type);
                                                        setOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(type.id)}
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
