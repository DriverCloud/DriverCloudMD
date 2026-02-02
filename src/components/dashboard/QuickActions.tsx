"use client";

import { CreateStudentDialog } from "@/components/students/CreateStudentDialog";
import { CreateClassDialog } from "@/components/classes/CreateClassDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, UserPlus, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
    resources: {
        students: any[];
        instructors: any[];
        vehicles: any[];
        classTypes: any[];
    };
    isInstructor?: boolean;
}

export function QuickActions({ resources, isInstructor }: QuickActionsProps) {
    if (isInstructor) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Accesos Rápidos</CardTitle>
                <CardDescription className="text-xs">
                    Gestión común.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                <div className="flex flex-col gap-2">
                    <CreateStudentDialog trigger={
                        <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-muted/50">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <UserPlus className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <span className="font-semibold text-sm">Nuevo Alumno</span>
                                <span className="text-xs text-muted-foreground">Registrar inscripción</span>
                            </div>
                        </Button>
                    } />

                    <CreateClassDialog resources={resources} trigger={
                        <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 hover:bg-muted/50">
                            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center mr-3">
                                <CalendarPlus className="h-4 w-4 text-violet-600" />
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <span className="font-semibold text-sm">Agendar Clase</span>
                                <span className="text-xs text-muted-foreground">Programar nuevo turno</span>
                            </div>
                        </Button>
                    } />
                </div>
            </CardContent>
        </Card>
    );
}
