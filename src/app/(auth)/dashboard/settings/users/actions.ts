'use server'

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function inviteUser(formData: FormData) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Check Permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id, location_id, role')
        .eq('user_id', user.id)
        .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return { success: false, error: 'No tienes permisos para invitar usuarios' };
    }

    // 2. Extract Data
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;

    if (!email || !role || !firstName || !lastName) {
        return { success: false, error: 'Todos los campos son requeridos' };
    }

    try {
        // 3. Invite User via Supabase Admin
        const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
            data: { first_name: firstName, last_name: lastName } // Metadata for user
        });

        if (inviteError) {
            console.error('Error inviting user:', inviteError);
            return { success: false, error: 'Error al enviar invitación: ' + inviteError.message };
        }

        const newUserId = inviteData.user.id;

        // 4. Create Membership
        const { error: memError } = await adminSupabase // Use admin client to bypass RLS if needed for creating other users' memberships/roles
            .from('memberships')
            .insert({
                user_id: newUserId,
                school_id: membership.school_id,
                owner_id: membership.owner_id,
                location_id: membership.location_id,
                role: role,
                status: 'pending_invite'
            });

        if (memError) {
            console.error('Error creating membership:', memError);
            // Optionally delete the user content if membership fails?
            return { success: false, error: 'Error al asignar permisos' };
        }

        // 5. Special handling for Instructors
        if (role === 'instructor') {
            const { error: instError } = await adminSupabase
                .from('instructors')
                .insert({
                    user_id: newUserId,
                    school_id: membership.school_id,
                    owner_id: membership.owner_id,
                    location_id: membership.location_id,
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    status: 'active'
                });

            if (instError) {
                console.error('Error linking instructor profile:', instError);
                // Non-fatal, but they won't appear in instructor list until fixed
            }
        }

        revalidatePath('/dashboard/settings');
        return { success: true };

    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: 'Error inesperado al procesar la invitación' };
    }
}

export async function removeUser(membershipId: string) {
    // Basic soft-delete implementation
    const supabase = await createClient();
    const { error } = await supabase
        .from('memberships')
        .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
        .eq('id', membershipId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}
