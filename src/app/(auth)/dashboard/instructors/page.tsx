"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, BadgeInfo, Mail, Phone } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorForm } from "@/features/instructors/components/InstructorForm";
import { Instructor, instructorsService } from "@/features/instructors/service";
import { InstructorDetailsDialog } from "@/components/instructors/InstructorDetailsDialog";

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
                        <InstructorDetailsDialog key={instructor.id} instructor={instructor}>
                            <Card className="relative group hover:border-primary transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold">
                                        {instructor.first_name} {instructor.last_name}
                                    </CardTitle>
                                    <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <BadgeInfo className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p className="text-muted-foreground uppercase text-[10px] tracking-tight">Licencia</p>
                                                <p className="font-medium truncate">{instructor.license_number}</p>
                                            </div>
                                            {instructor.cuil && (
                                                <div>
                                                    <p className="text-muted-foreground uppercase text-[10px] tracking-tight">CUIL</p>
                                                    <p className="font-medium truncate">{instructor.cuil}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t flex flex-col gap-1">
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {instructor.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {instructor.phone}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </InstructorDetailsDialog>
                    ))}
                </div>
            )}
        </div>
    );
}
