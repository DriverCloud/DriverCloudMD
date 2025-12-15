import { createClient } from '@/lib/supabase/server';

export default async function DebugPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let membership = null;
    let counts = { students: 0, instructors: 0, vehicles: 0 };
    let error = null;

    if (user) {
        try {
            const { data, error: memError } = await supabase
                .from('memberships')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (memError) error = memError;
            membership = data;

            // Check counts visible to this user
            const { count: sCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
            const { count: iCount } = await supabase.from('instructors').select('*', { count: 'exact', head: true });
            const { count: vCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });

            counts = { students: sCount || 0, instructors: iCount || 0, vehicles: vCount || 0 };
        } catch (e) {
            error = e;
        }
    }

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Diagnóstico de Sistema</h1>

            <div className="space-y-4">
                <div className="p-4 bg-slate-100 rounded border">
                    <h2 className="font-bold">Usuario</h2>
                    <p>ID: {user?.id || 'No logueado'}</p>
                    <p>Email: {user?.email}</p>
                </div>

                <div className="p-4 bg-slate-100 rounded border">
                    <h2 className="font-bold">Membresía</h2>
                    {membership ? (
                        <ul className="list-disc ml-4">
                            <li>School ID: {membership.school_id}</li>
                            <li>Role: {membership.role}</li>
                        </ul>
                    ) : (
                        <p className="text-red-600">No se encontró membresía (Error: {JSON.stringify(error)})</p>
                    )}
                </div>

                <div className="p-4 bg-slate-100 rounded border">
                    <h2 className="font-bold">Datos en Base de Datos (Visibles por RLS)</h2>
                    <ul className="list-disc ml-4">
                        <li>Estudiantes: {counts.students}</li>
                        <li>Instructores: {counts.instructors}</li>
                        <li>Vehículos: {counts.vehicles}</li>
                    </ul>
                </div>
            </div>

            <div className="mt-8">
                <p className="text-muted-foreground">Si Membresía es null, no puedes crear ni ver datos.</p>
                <p className="text-muted-foreground">Si Counts es 0, el seed falló o RLS oculta todo.</p>
            </div>
        </div>
    );
}
