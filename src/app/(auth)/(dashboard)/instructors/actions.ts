'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createInstructor(formData: FormData) {
    const supabase = await createClient();

    // Get the current user to determine school/owner context
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'No autenticado' };
    }

    // Get user's membership to determine school/owner
    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id, location_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        return { success: false, error: 'No se encontró la membresía del usuario' };
    }

    // Extract form data
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const licenseNumber = formData.get('license_number') as string;
    const licenseExpiry = formData.get('license_expiry') as string;

    // Validate required fields
    if (!firstName || !lastName) {
        return { success: false, error: 'Nombre y apellido son requeridos' };
    }

    // Insert instructor
    const { data, error } = await supabase
        .from('instructors')
        .insert({
            school_id: membership.school_id,
            owner_id: membership.owner_id,
            location_id: membership.location_id,
            first_name: firstName,
            last_name: lastName,
            email: email || null,
            phone: phone || null,
            license_number: licenseNumber || null,
            license_expiry: licenseExpiry || null,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating instructor:', error);
        return { success: false, error: 'Error al crear el instructor' };
    }

    // Revalidate the instructors page to show the new instructor
    revalidatePath('/instructors');

    return { success: true, data };
}

export async function updateInstructor(instructorId: string, formData: FormData) {
    const supabase = await createClient();

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'No autenticado' };
    }

    // Extract form data
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const licenseNumber = formData.get('license_number') as string;
    const licenseExpiry = formData.get('license_expiry') as string;

    // Validate required fields
    if (!firstName || !lastName) {
        return { success: false, error: 'Nombre y apellido son requeridos' };
    }

    // Update instructor
    const { data, error } = await supabase
        .from('instructors')
        .update({
            first_name: firstName,
            last_name: lastName,
            email: email || null,
            phone: phone || null,
            license_number: licenseNumber || null,
            license_expiry: licenseExpiry || null,
        })
        .eq('id', instructorId)
        .select()
        .single();

    if (error) {
        console.error('Error updating instructor:', error);
        return { success: false, error: 'Error al actualizar el instructor' };
    }

    revalidatePath('/instructors');

    return { success: true, data };
}

export async function deleteInstructor(instructorId: string) {
    const supabase = await createClient();

    // Soft delete by setting deleted_at
    const { error } = await supabase
        .from('instructors')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', instructorId);

    if (error) {
        console.error('Error deleting instructor:', error);
        return { success: false, error: 'Error al eliminar el instructor' };
    }

    revalidatePath('/instructors');

    return { success: true };
}
