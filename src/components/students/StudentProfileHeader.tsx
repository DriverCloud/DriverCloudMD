'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Calendar, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SellPackageDialog } from './SellPackageDialog';
import { EditStudentDialog } from './EditStudentDialog';
import { CreateClassDialog } from '../classes/CreateClassDialog';
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { inviteStudent, resetStudentPassword } from "@/app/actions/student-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Settings2, UserPlus, DollarSign, Wallet, ChevronDown, ShoppingBag, Pencil } from 'lucide-react';
import { PaymentModal } from '@/features/finance/components/PaymentModal';

import { cancelFutureAppointments } from '@/app/(auth)/dashboard/classes/actions';
import { XCircle as XCircleIcon } from 'lucide-react';

interface StudentProfileHeaderProps {
    student: any;
    balance: any;
    userRole?: string | null;
    resources?: any;
    packages?: any[];
}

export function StudentProfileHeader({ student, balance, userRole, resources, packages }: StudentProfileHeaderProps) {
    const router = useRouter();
    const isInstructor = userRole === 'instructor';

    // Invite Logic State
    const [inviteOpen, setInviteOpen] = useState(false);
    const [credentials, setCredentials] = useState<{ email: string, password: string } | null>(null);
    const [isInviting, setIsInviting] = useState(false);

    const handleInvite = async (isReset = false) => {
        setIsInviting(true);
        const res = isReset
            ? await resetStudentPassword(student.id, student.email)
            : await inviteStudent(student.id, student.email);

        setIsInviting(false);

        if (res.success && res.password) {
            setCredentials({ email: res.email, password: res.password });
            toast.success(isReset ? "Contraseña restablecida" : "Usuario creado correctamente");
        } else {
            toast.error(res.error || "Error en la operación");
        }
    };

    // Calculate Progress
    const totalCredits = packages?.reduce((sum, pkg) => sum + (pkg.total_credits || 0), 0) || 0;
    const remainingCredits = packages?.reduce((sum, pkg) => sum + (pkg.remaining_credits || 0), 0) || 0;
    const usedCredits = totalCredits - remainingCredits;
    const progressPercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Volver a Estudiantes
                </Button>

                {/* Main Info Card */}
                <Card className="flex-1 w-full">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            {/* Left Side: Student Info */}
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">
                                    {student.first_name} {student.last_name}
                                </h1>
                                <div className="flex gap-2 mb-4">
                                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                        {student.status === 'active' ? 'Activo' : student.status}
                                    </Badge>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {student.email || 'Sin email'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        {student.phone || 'Sin teléfono'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Registrado: {new Date(student.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Actions */}
                            <div className="flex flex-col gap-3 md:items-end w-full md:w-auto">
                                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">

                                    {/* Financial Actions Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2 font-semibold">
                                                <DollarSign className="h-4 w-4" />
                                                Finanzas
                                                <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2">
                                                        <Wallet className="h-4 w-4 text-emerald-600" />
                                                        Registrar Pago
                                                    </DropdownMenuItem>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Registrar Pago</DialogTitle>
                                                    </DialogHeader>
                                                    <PaymentModal
                                                        defaultStudentId={student.id}
                                                        onSuccess={() => router.refresh()}
                                                    />
                                                </DialogContent>
                                            </Dialog>

                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} asChild>
                                                <div className="w-full">
                                                    <SellPackageDialog
                                                        studentId={student.id}
                                                        studentName={`${student.first_name} ${student.last_name}`}
                                                        trigger={
                                                            <div className="flex items-center gap-2 px-2 py-1.5 w-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm">
                                                                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                                                                <span className="text-sm">Vender Paquete</span>
                                                            </div>
                                                        }
                                                    />
                                                </div>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Dropdown for more actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="gap-2">
                                                <Settings2 className="h-4 w-4" />
                                                Gestión
                                                <MoreHorizontal className="h-4 w-4 ml-1 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <EditStudentDialog
                                                student={student}
                                                trigger={
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                                                        <Pencil className="h-4 w-4" />
                                                        Editar Perfil
                                                    </DropdownMenuItem>
                                                }
                                            />

                                            {!isInstructor && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() => setInviteOpen(true)}
                                                        className="gap-2"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                        {student.user_id ? "Resetear Acceso Portal" : "Invitar al Portal"}
                                                    </DropdownMenuItem>

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50 gap-2"
                                                                onSelect={(e) => {
                                                                    e.preventDefault(); // Prevent dropdown from closing immediately
                                                                }}
                                                            >
                                                                <XCircleIcon className="h-4 w-4" />
                                                                Cancelar Turnos Futuros
                                                            </DropdownMenuItem>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>¿Confirmar cancelación masiva?</DialogTitle>
                                                                <DialogDescription>
                                                                    Esta acción cancelará todos los turnos futuros del alumno y **devolverá los créditos correspondientes**. Úsalo si el alumno decide no continuar con el curso.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => { }}>Volver</Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={async () => {
                                                                        const res = await cancelFutureAppointments(student.id);
                                                                        if (res.success) {
                                                                            toast.success(res.message);
                                                                            router.refresh();
                                                                        } else {
                                                                            toast.error(res.error || "Error al cancelar turnos");
                                                                        }
                                                                    }}
                                                                >
                                                                    Confirmar Cancelación
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Invitations (Portal Access) moved to dropdown logic, but we kept the dialog here for simplicity */}
                                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {student.user_id ? "Restablecer Contraseña" : "Invitar al Portal de Alumnos"}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {student.user_id
                                                        ? "Generar una nueva contraseña temporal para este alumno."
                                                        : <span>Se creará un usuario para <strong>{student.first_name}</strong> usando su email <strong>{student.email}</strong>.</span>
                                                    }
                                                </DialogDescription>
                                            </DialogHeader>

                                            {credentials ? (
                                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md space-y-3">
                                                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        {student.user_id ? "Contraseña Actualizada" : "Usuario Creado"}
                                                    </div>
                                                    <p className="text-sm text-emerald-800">Copia estos datos y envíaselos al alumno:</p>
                                                    <div className="grid gap-2">
                                                        <div>
                                                            <Label className="text-xs">Email</Label>
                                                            <div className="bg-white p-2 rounded border font-mono text-sm select-all">{credentials.email}</div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Nueva Contraseña Temporal</Label>
                                                            <div className="bg-white p-2 rounded border font-mono text-sm select-all">{credentials.password}</div>
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => setInviteOpen(false)} className="w-full mt-2">Cerrar</Button>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800 mb-4 flex gap-2">
                                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                        Esta acción generará una contraseña temporal. Asegúrate de copiarla antes de cerrar.
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                                                        <Button onClick={() => handleInvite(!!student.user_id)} disabled={isInviting}>
                                                            {isInviting ? "Procesando..." : (student.user_id ? "Generar Nueva Clave" : "Crear Usuario")}
                                                        </Button>
                                                    </DialogFooter>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>

                        {/* Upselling Progress Bar */}
                        {totalCredits > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-muted-foreground">Progreso del Curso</span>
                                    <span className="font-bold text-primary">{usedCredits} / {totalCredits} Clases Completadas</span>
                                </div>
                                <Progress value={progressPercentage} className="h-2.5" />
                                {usedCredits >= totalCredits && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">
                                        ¡Curso completado! Sugiere un paquete de refuerzo o trámite de licencia.
                                    </p>
                                )}
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
}
