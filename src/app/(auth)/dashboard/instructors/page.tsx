"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
                        <Card key={instructor.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">
                                    {instructor.first_name} {instructor.last_name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium mb-1">Licencia: {instructor.license_number}</div>
                                <p className="text-xs text-muted-foreground">
                                    {instructor.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {instructor.phone}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
