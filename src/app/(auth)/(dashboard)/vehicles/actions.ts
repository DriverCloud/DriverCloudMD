'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createVehicle(formData: FormData) {
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
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const year = formData.get('year') as string;
    const licensePlate = formData.get('license_plate') as string;
    const transmissionType = formData.get('transmission_type') as string;

    // Validate required fields
    if (!brand || !model || !year || !licensePlate || !transmissionType) {
        return { success: false, error: 'Todos los campos son requeridos' };
    }

    // Insert vehicle
    const { data, error } = await supabase
        .from('vehicles')
        .insert({
            school_id: membership.school_id,
            owner_id: membership.owner_id,
            location_id: membership.location_id,
            brand,
            model,
            year: parseInt(year),
            license_plate: licensePlate,
            transmission_type: transmissionType,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating vehicle:', error);
        return { success: false, error: 'Error al crear el vehículo' };
    }

    // Revalidate the vehicles page to show the new vehicle
    revalidatePath('/vehicles');

    return { success: true, data };
}

export async function updateVehicle(vehicleId: string, formData: FormData) {
    const supabase = await createClient();

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'No autenticado' };
    }

    // Extract form data
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const year = formData.get('year') as string;
    const licensePlate = formData.get('license_plate') as string;
    const transmissionType = formData.get('transmission_type') as string;

    // Validate required fields
    if (!brand || !model || !year || !licensePlate || !transmissionType) {
        return { success: false, error: 'Todos los campos son requeridos' };
    }

    // Update vehicle
    const { data, error } = await supabase
        .from('vehicles')
        .update({
            brand,
            model,
            year: parseInt(year),
            license_plate: licensePlate,
            transmission_type: transmissionType,
        })
        .eq('id', vehicleId)
        .select()
        .single();

    if (error) {
        console.error('Error updating vehicle:', error);
        return { success: false, error: 'Error al actualizar el vehículo' };
    }

    revalidatePath('/vehicles');

    return { success: true, data };
}

export async function deleteVehicle(vehicleId: string) {
    const supabase = await createClient();

    // Soft delete by setting deleted_at
    const { error } = await supabase
        .from('vehicles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', vehicleId);

    if (error) {
        console.error('Error deleting vehicle:', error);
        return { success: false, error: 'Error al eliminar el vehículo' };
    }

    revalidatePath('/vehicles');

    return { success: true };
}
