import { createClient } from '@/lib/supabase/server';
import { Users, Mail, Phone, Calendar, User, PauseCircle, CheckCircle, Award, XCircle, LogOut, LayoutGrid, Check, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateStudentDialog } from '@/components/students/CreateStudentDialog';
import { EditStudentDialog } from '@/components/students/EditStudentDialog';
import { DeleteStudentButton } from '@/components/students/DeleteStudentButton';
import { SellPackageDialog } from '@/components/students/SellPackageDialog';
import { ExportStudentsButton } from '@/components/students/ExportStudentsButton';
import { StudentSearch } from '@/components/students/StudentSearch';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function StudentsPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string; status?: string }>;
}) {
    const supabase = await createClient();
    const params = await searchParams;
    const searchQuery = params.search;
    const statusFilter = params.status || 'active';

    // Get User Role
    const { data: { user } } = await supabase.auth.getUser();
    let userRole = null;
    if (user) {
        const { data: membership } = await supabase.from('memberships').select('role').eq('user_id', user.id).single();
        userRole = membership?.role;
    }
    const isInstructor = userRole === 'instructor';

    // Fetch students
    let query = supabase
        .from('students')
        .select('*')
        .is('deleted_at', null);

    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
    }

    // Prepare queries
    const studentsQuery = query.order('created_at', { ascending: false });

    const statusCountsQuery = supabase
        .from('students')
        .select('status')
        .is('deleted_at', null);

    // Execute in parallel
    const [
        { data: students, error },
        { data: statusCountsData }
    ] = await Promise.all([
        studentsQuery,
        statusCountsQuery
    ]);

    const counts: Record<string, number> = {
        active: 0,
        paused: 0,
        finished: 0,
        graduated: 0,
        failed: 0,
        abandoned: 0,
        all: statusCountsData?.length || 0
    };

    statusCountsData?.forEach(s => {
        if (s.status in counts) {
            counts[s.status]++;
        }
    });

    if (error) {
        console.error('Error fetching students:', error);
    }

    const totalStudents = students?.length || 0;

    const statusMap: Record<string, string> = {
        active: 'Activo',
        paused: 'En Pausa',
        finished: 'Finalizado',
        graduated: 'Graduado',
        failed: 'Reprobado',
        abandoned: 'Abandono',
        all: 'Todos',
        inactive: 'Inactivo' // Legacy support
    };

    const filters = [
        { id: 'active', label: 'Activos', icon: User, color: 'text-emerald-500', bg: 'bg-emerald-500' },
        { id: 'paused', label: 'En Pausa', icon: PauseCircle, color: 'text-amber-500', bg: 'bg-amber-500' },
        { id: 'finished', label: 'Finalizados', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500' },
        { id: 'graduated', label: 'Graduados', icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-500' },
        { id: 'failed', label: 'Reprobados', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500' },
        { id: 'abandoned', label: 'Abandono', icon: LogOut, color: 'text-slate-500', bg: 'bg-slate-500' },
        { id: 'all', label: 'Todos', icon: LayoutGrid, color: 'text-primary', bg: 'bg-primary' }
    ];

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-muted-foreground">{totalStudents} estudiantes ({statusMap[statusFilter] || statusFilter})</p>
                        {(searchQuery || statusFilter !== 'active') && (
                            <>
                                <span className="text-muted-foreground">|</span>
                                {searchQuery && (
                                    <p className="text-primary font-medium tracking-tight">
                                        Resultados para "{searchQuery}"
                                    </p>
                                )}
                                <Link
                                    href="/dashboard/students"
                                    className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
                                >
                                    Limpiar filtros
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    {!isInstructor && (
                        <>
                            <ExportStudentsButton students={students || []} />
                            <CreateStudentDialog />
                        </>
                    )}
                </div>
            </div>

            {/* Filters and Search Toolbar */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-start w-full">
                    <StudentSearch />
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-card border rounded-xl p-1.5 shadow-sm overflow-x-auto">
                    {filters.map((f) => {
                        const Icon = f.icon;
                        const isActive = statusFilter === f.id;
                        const count = counts[f.id] || 0;

                        // Explicitly construct query to ensure clean navigation state
                        const query: Record<string, string> = { status: f.id };
                        if (params.search) {
                            query.search = params.search;
                        }

                        return (
                            <Link
                                key={f.id}
                                href={{ pathname: '/dashboard/students', query }}
                                scroll={false}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", !isActive && f.color)} />
                                <span>{f.label}</span>
                                <span className={cn(
                                    "flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[9px] font-bold",
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-muted-foreground/10 text-muted-foreground"
                                )}>
                                    {count}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Students Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Saldo</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                            {!isInstructor && <TableHead className="text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students && students.length > 0 ? (
                            students.map((student) => {
                                const registrationDate = new Date(student.created_at);
                                const formattedDate = `${registrationDate.getDate()}/${registrationDate.getMonth() + 1}/${registrationDate.getFullYear()}`;
                                const balance = student.balance || 0;

                                // Gender colors
                                const genderColorClass = student.gender === 'male'
                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                    : student.gender === 'female'
                                        ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                                        : "bg-primary/10 text-primary";

                                return (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", genderColorClass)}>
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <Link href={`/dashboard/students/${student.id}`} className="font-semibold hover:underline decoration-primary block">
                                                        {student.first_name} {student.last_name}
                                                    </Link>
                                                    {student.license_number && (
                                                        <p className="text-xs text-muted-foreground">Lic: {student.license_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="truncate max-w-[150px]">{student.email || 'No especificado'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{student.phone || 'No especificado'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                student.status === 'active' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                                                    student.status === 'paused' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                                                        student.status === 'finished' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                                                            student.status === 'graduated' ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" :
                                                                student.status === 'failed' ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" :
                                                                    "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                            )}>
                                                {statusMap[student.status] || student.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                {balance >= 0 ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Al día</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50">
                                                        <X className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Deuda</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formattedDate}</span>
                                            </div>
                                        </TableCell>
                                        {!isInstructor && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <SellPackageDialog studentId={student.id} studentName={`${student.first_name} ${student.last_name}`} />
                                                    <EditStudentDialog student={student} />
                                                    <DeleteStudentButton studentId={student.id} studentName={`${student.first_name} ${student.last_name}`} />
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={!isInstructor ? 7 : 6} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <Users className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                                        <p className="text-muted-foreground">No hay estudiantes registrados</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
