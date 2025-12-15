import { createClient } from '@/lib/supabase/server';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateStudentDialog } from '@/components/students/CreateStudentDialog';
import { EditStudentDialog } from '@/components/students/EditStudentDialog';
import { DeleteStudentButton } from '@/components/students/DeleteStudentButton';
import { SellPackageDialog } from '@/components/students/SellPackageDialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default async function StudentsPage() {
    const supabase = await createClient();

    // Fetch students
    const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'active')
        .is('deleted_at', null)
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
                    <p className="text-muted-foreground mt-1">{totalStudents} estudiantes activos</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        Exportar Lista
                    </Button>
                    <CreateStudentDialog />
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold text-sm">Nombre</th>
                                <th className="text-left p-4 font-semibold text-sm">Email</th>
                                <th className="text-left p-4 font-semibold text-sm">Teléfono</th>
                                <th className="text-left p-4 font-semibold text-sm">Estado</th>
                                <th className="text-left p-4 font-semibold text-sm">Saldo</th>
                                <th className="text-left p-4 font-semibold text-sm">Fecha de Registro</th>
                                <th className="text-right p-4 font-semibold text-sm">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {students && students.length > 0 ? (
                                students.map((student) => {
                                    const registrationDate = new Date(student.created_at);
                                    const formattedDate = `${registrationDate.getDate()}/${registrationDate.getMonth() + 1}/${registrationDate.getFullYear()}`;
                                    const balance = balanceMap.get(student.id) || 0;

                                    return (
                                        <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <Link href={`/students/${student.id}`} className="font-semibold hover:underline decoration-primary">
                                                            {student.first_name} {student.last_name}
                                                        </Link>
                                                        {student.license_number && (
                                                            <p className="text-xs text-muted-foreground">Lic: {student.license_number}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{student.email || 'No especificado'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{student.phone || 'No especificado'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                    {student.status === 'active' ? 'Activo' : student.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className={cn("font-bold text-sm",
                                                    balance < 0 ? "text-rose-600" : "text-emerald-600"
                                                )}>
                                                    ${balance.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formattedDate}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <SellPackageDialog studentId={student.id} studentName={`${student.first_name} ${student.last_name}`} />
                                                    <EditStudentDialog student={student} />
                                                    <DeleteStudentButton studentId={student.id} studentName={`${student.first_name} ${student.last_name}`} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                        <p className="text-muted-foreground font-medium">No hay estudiantes registrados</p>
                                        <p className="text-sm text-muted-foreground mt-1">Agrega tu primer estudiante para comenzar</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
