import { createClient } from '@/lib/supabase/server';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateStudentDialog } from '@/components/students/CreateStudentDialog';
import { EditStudentDialog } from '@/components/students/EditStudentDialog';
import { DeleteStudentButton } from '@/components/students/DeleteStudentButton';
import { SellPackageDialog } from '@/components/students/SellPackageDialog';
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
    searchParams: Promise<{ search?: string }>;
}) {
    const supabase = await createClient();
    const params = await searchParams;
    const searchQuery = params.search;

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
        .eq('status', 'active')
        .is('deleted_at', null);

    if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
    }

    const { data: students, error } = await query
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching students:', error);
    }

    // Fetch balances from view
    const { data: balances } = await supabase
        .from('view_student_balances')
        .select('student_id, balance');

    const balanceMap = new Map();
    if (balances) {
        balances.forEach((b: any) => {
            balanceMap.set(b.student_id, b.balance);
        });
    }

    const totalStudents = students?.length || 0;

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-muted-foreground">{totalStudents} estudiantes activos</p>
                        {searchQuery && (
                            <>
                                <span className="text-muted-foreground">|</span>
                                <p className="text-primary font-medium tracking-tight">
                                    Resultados para "{searchQuery}"
                                </p>
                                <Link
                                    href="/dashboard/students"
                                    className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
                                >
                                    Limpiar búsqueda
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    {!isInstructor && (
                        <>
                            <Button variant="outline">
                                Exportar Lista
                            </Button>
                            <CreateStudentDialog />
                        </>
                    )}
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
                                const balance = balanceMap.get(student.id) || 0;

                                return (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Users className="h-5 w-5 text-primary" />
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
                                                student.status === 'active'
                                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                            )}>
                                                {student.status === 'active' ? 'Activo' : student.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className={cn("font-bold text-sm",
                                                balance < 0 ? "text-rose-600" : "text-emerald-600"
                                            )}>
                                                ${balance.toLocaleString()}
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
