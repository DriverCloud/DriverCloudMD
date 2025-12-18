'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    // Get membership to identify school
    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Sin membresía' };

    // Fetch School Profile
    const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', membership.school_id)
        .single();

    if (schoolError) {
        console.error('Error fetching school:', schoolError);
        return { success: false, error: 'Error al cargar perfil de escuela' };
    }

    // Fetch Settings or Create if missing
    let { data: settings, error: settingsError } = await supabase
        .from('school_settings')
        .select('*')
        .eq('school_id', membership.school_id)
        .single();

    if (!settings && !settingsError) {
        // Create default settings if not found
        const { data: newSettings, error: createError } = await supabase
            .from('school_settings')
            .insert({
                school_id: membership.school_id,
                owner_id: membership.owner_id,
                cancellation_policy_hours: 24,
                default_buffer_minutes: 15,
                allow_policy_exceptions: false
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating default settings:', createError);
        } else {
            settings = newSettings;
        }
    }

    return {
        success: true,
        data: {
            school,
            settings
        }
    };
}

export async function updateSchoolProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Sin membresía' };

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;

    const { error } = await supabase
        .from('schools')
        .update({
            name,
            phone,
            email,
            address
        })
        .eq('id', membership.school_id);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Error al actualizar perfil' };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}

export async function updateBookingPolicies(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Sin membresía' };

    const cancellation_hours = formData.get('cancellation_policy_hours');
    const buffer_minutes = formData.get('default_buffer_minutes');
    const allow_exceptions = formData.get('allow_policy_exceptions') === 'on';

    console.log('Updating policies:', { cancellation_hours, buffer_minutes, allow_exceptions });

    const { data, error } = await supabase
        .from('school_settings')
        .update({
            cancellation_policy_hours: cancellation_hours ? parseInt(cancellation_hours as string) : 24,
            default_buffer_minutes: buffer_minutes ? parseInt(buffer_minutes as string) : 15,
            allow_policy_exceptions: allow_exceptions
        })
        .eq('school_id', membership.school_id)
        .select();

    if (error) {
        console.error('Error updating policies:', error);
        return { success: false, error: 'Error al actualizar políticas' };
    }

    if (!data || data.length === 0) {
        console.error('Policy update returned 0 rows. Possible RLS issue for user:', user.id);
        return { success: false, error: 'No se pudo guardar. Verifica tus permisos.' };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}
