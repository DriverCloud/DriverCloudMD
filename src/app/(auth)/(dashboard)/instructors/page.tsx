import { createClient } from '@/lib/supabase/server';
import { UserCheck, Mail, Phone, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateInstructorDialog } from '@/components/instructors/CreateInstructorDialog';
import { EditInstructorDialog } from '@/components/instructors/EditInstructorDialog';
import { DeleteInstructorButton } from '@/components/instructors/DeleteInstructorButton';

export default async function InstructorsPage() {
    const supabase = await createClient();

    // Fetch all active instructors
    const { data: instructors, error } = await supabase
        .from('instructors')
        .select('*')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching instructors:', error);
    }

    const totalInstructors = instructors?.length || 0;

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Instructores</h1>
                    <p className="text-muted-foreground mt-1">{totalInstructors} instructores activos</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        Exportar Lista
                    </Button>
                    <CreateInstructorDialog />
                </div>
            </div>

            {/* Instructors Table */}
            <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold text-sm">Nombre</th>
                                <th className="text-left p-4 font-semibold text-sm">Email</th>
                                <th className="text-left p-4 font-semibold text-sm">Teléfono</th>
                                <th className="text-left p-4 font-semibold text-sm">Licencia</th>
                                <th className="text-left p-4 font-semibold text-sm">Estado</th>
                                <th className="text-right p-4 font-semibold text-sm">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {instructors && instructors.length > 0 ? (
                                instructors.map((instructor) => {
                                    const expiryDate = instructor.license_expiry ? new Date(instructor.license_expiry) : null;
                                    const formattedExpiry = expiryDate
                                        ? `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`
                                        : 'N/A';

                                    return (
                                        <tr key={instructor.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                                        <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{instructor.first_name} {instructor.last_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{instructor.email || 'No especificado'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{instructor.phone || 'No especificado'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Award className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{instructor.license_number || 'N/A'}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">Vence: {formattedExpiry}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                    {instructor.status === 'active' ? 'Activo' : instructor.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <EditInstructorDialog instructor={instructor} />
                                                    <DeleteInstructorButton instructorId={instructor.id} instructorName={`${instructor.first_name} ${instructor.last_name}`} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                        <p className="text-muted-foreground font-medium">No hay instructores registrados</p>
                                        <p className="text-sm text-muted-foreground mt-1">Agrega tu primer instructor para comenzar</p>
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
