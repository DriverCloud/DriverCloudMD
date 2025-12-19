import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { InviteUserDialog } from '@/components/settings/InviteUserDialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { UserCog, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function UsersPage() {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Get Current User's School
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <div>No autenticado</div>;

    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return <div>Sin escuela asignada</div>;

    // 2. Get All Memberships for this School
    let enrichedUsers = [];
    let fetchError = null;

    try {
        const { data: membershipsData, error: memberError } = await supabase
            .from('memberships')
            .select('*')
            .eq('school_id', membership.school_id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (memberError) throw memberError;

        // 3. Enrich with User Data (Email, Metadata) using Admin Client
        // We need to fetch user details for each membership because 'memberships' table doesn't have email/name directly (except partially)
        enrichedUsers = await Promise.all((membershipsData || []).map(async (m) => {
            try {
                const { data: { user: userData }, error } = await adminSupabase.auth.admin.getUserById(m.user_id);
                if (error) {
                    console.error(`Error fetching user ${m.user_id}:`, error);
                    return { ...m, email: 'Error loading', fullName: 'Unknown', lastSignIn: null };
                }

                return {
                    ...m,
                    email: userData?.email || 'Desconocido',
                    fullName: userData?.user_metadata?.first_name
                        ? `${userData.user_metadata.first_name} ${userData.user_metadata.last_name || ''}`
                        : 'Usuario',
                    lastSignIn: userData?.last_sign_in_at
                };
            } catch (innerError) {
                console.error(`Error processing user ${m.user_id}:`, innerError);
                return { ...m, email: 'Error', fullName: 'Error', lastSignIn: null };
            }

        }));
    } catch (e: any) {
        console.error("Error in UsersPage:", e);
        fetchError = e.message || "Error desconocido cargando usuarios";
    }

    if (fetchError) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                <h3 className="font-bold">Error cargando usuarios</h3>
                <p>{fetchError}</p>
                <p className="text-sm mt-2 opacity-80">Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurado en .env.local</p>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Usuarios y Permisos</h3>
                    <p className="text-sm text-muted-foreground">
                        Gestiona el acceso de tu equipo a la plataforma.
                    </p>
                </div>
                <InviteUserDialog />
            </div>

            <div className="border rounded-lg divide-y">
                {enrichedUsers.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{member.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{member.fullName}</p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {member.email}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="capitalize">
                                    {member.role === 'secretary' ? 'Secretario/a' : member.role}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {member.status === 'pending_invite' ? 'Invitación Pendiente' : 'Activo'}
                                </span>
                            </div>

                            {/* Actions - Prevent deleting yourself or other owners if not super admin (logic simplified for UI) */}
                            {member.user_id !== user.id && (
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {enrichedUsers.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No se encontraron usuarios.
                    </div>
                )}
            </div>
        </div>
    );
}
