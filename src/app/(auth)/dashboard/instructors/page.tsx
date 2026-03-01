"use client"; // Note: Next.js metadata doesn't work directly in 'use client' files.
// We should set it in a layout.tsx for instructors if it exists, or change the component to a Server Component.
// Since it uses useState/useEffect, we'll use a standard document.title effect.

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

    useEffect(() => {
        document.title = "Instructores | DriverCloudMD";
    }, []);

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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-card/60 rounded-2xl shadow-sm p-6 space-y-4 opacity-50">
                            <div className="flex gap-4"><div className="h-12 w-12 rounded-full bg-muted animate-pulse" /><div className="space-y-2 flex-1"><div className="h-5 bg-muted rounded animate-pulse w-3/4" /><div className="h-4 bg-muted rounded animate-pulse w-1/2" /></div></div>
                        </div>
                    ))}
                </div>
            ) : instructors.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-card/60 rounded-2xl border border-dashed border-border/60 shadow-sm">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <BadgeInfo className="h-10 w-10 text-primary/50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Sin instructores registrados</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Agrega tu primer instructor para comenzar a asignar clases y gestionar sus horarios.
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="lg">
                                    <Plus className="mr-2 h-5 w-5" /> Agregar Instructor
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
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {instructors.map((instructor) => (
                        <Card key={instructor.id} className="relative group transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md border-0 rounded-2xl">
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

                                <div className="mt-4 pt-4 flex gap-2">
                                    <InstructorDetailsDialog instructor={instructor}>
                                        <Button variant="outline" className="w-full shadow-sm">
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
