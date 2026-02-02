"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, BadgeInfo, Mail, Phone, MoreVertical, Eye } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorForm } from "@/features/instructors/components/InstructorForm";
import { Instructor, instructorsService } from "@/features/instructors/service";
import { InstructorDetailsDialog } from "@/components/instructors/InstructorDetailsDialog";
import { EditInstructorDialog } from '@/components/instructors/EditInstructorDialog';

export default function InstructorsPage() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInstructors = async () => {
        try {
            const data = await instructorsService.getInstructors();
            setInstructors(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Instructores</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Instructor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Instructor</DialogTitle>
                        </DialogHeader>
                        <InstructorForm onSuccess={fetchInstructors} />
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div>Cargando...</div>
            ) : instructors.length === 0 ? (
                <div className="rounded-md border p-8 text-center text-muted-foreground">
                    <p>No se encontraron instructores. ¡Agrega el primero!</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {instructors.map((instructor) => (
                        <Card key={instructor.id} className="relative group transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md border-muted">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {instructor.first_name[0]}{instructor.last_name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg font-bold truncate">
                                        {instructor.first_name} {instructor.last_name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border truncate max-w-[120px]">
                                            {instructor.license_number}
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <InstructorDetailsDialog instructor={instructor}>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                            </DropdownMenuItem>
                                        </InstructorDetailsDialog>
                                        <EditInstructorDialog instructor={instructor}>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                        </EditInstructorDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="bg-primary/5 p-1.5 rounded-full">
                                            <Mail className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="truncate flex-1">{instructor.email || 'Sin email'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="bg-primary/5 p-1.5 rounded-full">
                                            <Phone className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="truncate flex-1">{instructor.phone || 'Sin teléfono'}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t flex gap-2">
                                    <InstructorDetailsDialog instructor={instructor}>
                                        <Button variant="outline" className="w-full">
                                            Ver Perfil
                                        </Button>
                                    </InstructorDetailsDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
