'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCoursePackages() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id')
        .eq('user_id', user.id)
        .single();
    if (!membership) return { success: false, error: 'Sin membresía' };

    const { data, error } = await supabase
        .from('course_packages')
        .select('*')
        .eq('school_id', membership.school_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching course packages:', error);
        return { success: false, error: 'Error al cargar paquetes' };
    }

    return { success: true, data };
}

export async function upsertCoursePackage(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id')
        .eq('user_id', user.id)
        .single();
    if (!membership) return { success: false, error: 'Sin membresía' };

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const class_count = parseInt(formData.get('class_count') as string) || 1;
    const price = parseFloat(formData.get('price') as string) || 0;
    const active = formData.get('active') === 'on';

    const packageData = {
        name,
        class_count,
        price,
        active,
        school_id: membership.school_id,
        owner_id: membership.owner_id,
        updated_at: new Date().toISOString()
    };

    let result;
    if (id && id !== 'undefined' && id !== '') {
        result = await supabase
            .from('course_packages')
            .update(packageData)
            .eq('id', id);
    } else {
        result = await supabase
            .from('course_packages')
            .insert({ ...packageData, created_at: new Date().toISOString() });
    }

    if (result.error) {
        console.error('Error upserting course package:', result.error);
        return { success: false, error: 'Error al guardar el paquete' };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}

export async function deleteCoursePackage(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { error } = await supabase
        .from('course_packages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Error deleting course package:', error);
        return { success: false, error: 'Error al eliminar el paquete' };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}
