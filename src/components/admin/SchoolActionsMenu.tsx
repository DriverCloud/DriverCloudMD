"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldOff, ShieldCheck, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { toggleSchoolStatus } from "@/app/(admin)/admin/actions";
import { useRouter } from "next/navigation";

interface SchoolActionsMenuProps {
    schoolId: string;
    schoolName: string;
    currentStatus: string;
}

export function SchoolActionsMenu({ schoolId, schoolName, currentStatus }: SchoolActionsMenuProps) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleToggleStatus = async () => {
        setIsPending(true);
        try {
            const result = await toggleSchoolStatus(schoolId, currentStatus);
            if (result.success) {
                toast.success("Estado actualizado", {
                    description: result.message,
                });
                router.refresh();
            } else {
                toast.error("Error", {
                    description: result.message,
                });
            }
        } catch (error) {
            toast.error("Error", {
                description: "Ocurrió un error inesperado al cambiar estado.",
            });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50" disabled={isPending}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menú de Escuela</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-medium truncate" title={schoolName}>
                    {schoolName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push(`/admin/schools/${schoolId}`)}>
                    <Edit2 className="h-4 w-4 mr-2 text-slate-500" />
                    Editar Detalles
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleToggleStatus}
                    className={currentStatus === 'active' ? 'text-amber-600 focus:text-amber-700' : 'text-emerald-600 focus:text-emerald-700'}
                >
                    {currentStatus === 'active' ? (
                        <>
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Suspender Escuela
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Activar Escuela
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
