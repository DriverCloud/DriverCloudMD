'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { ActionState } from "@/types";

export async function createVehicle(formData: FormData): Promise<ActionState> {
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
    const status = formData.get('status') as string || 'active';

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
            status: status
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating vehicle:', error);
        return { success: false, error: 'Error al crear el vehículo' };
    }

    // Revalidate the vehicles page to show the new vehicle
    revalidatePath('/dashboard/vehicles');

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
    const status = formData.get('status') as string;

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
            status: status || undefined,
        })
        .eq('id', vehicleId)
        .select()
        .single();

    if (error) {
        console.error('Error updating vehicle:', error);
        return { success: false, error: 'Error al actualizar el vehículo' };
    }

    revalidatePath('/dashboard/vehicles');
    revalidatePath(`/dashboard/vehicles/${vehicleId}`);

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

    revalidatePath('/dashboard/vehicles');

    return { success: true };
}

// Maintenance Actions

export async function addMaintenanceRecord(vehicleId: string, formData: FormData) {
    const supabase = await createClient();

    // Get auth user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Get membership for ownership context
    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Sin membresía' };

    const date = formData.get('date') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const mileage = formData.get('mileage') as string;
    const costStr = formData.get('cost') as string;
    const provider = formData.get('provider') as string;

    if (!date || !type) {
        return { success: false, error: 'Fecha y tipo son requeridos' };
    }

    const cost = costStr ? parseFloat(costStr) : null;

    const { error } = await supabase
        .from('vehicle_service_records')
        .insert({
            vehicle_id: vehicleId,
            date,
            type,
            description,
            mileage: mileage ? parseInt(mileage) : null,
            cost: cost,
            provider
        });

    if (error) {
        console.error('Error adding maintenance:', error);
        return { success: false, error: 'Error al agregar mantenimiento' };
    }

    // --- INTEGRATION: CREATE EXPENSE IF COST > 0 ---
    if (cost && cost > 0) {
        // Fetch vehicle info for better description
        const { data: vehicle } = await supabase
            .from('vehicles')
            .select('brand, model, license_plate')
            .eq('id', vehicleId)
            .single();

        const expenseDescription = vehicle
            ? `Mantenimiento: ${type} - ${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`
            : `Mantenimiento: ${type}`; // Fallback if vehicle not found (unlikely)

        const { error: expenseError } = await supabase
            .from('expenses')
            .insert({
                school_id: membership.school_id,
                owner_id: membership.owner_id,
                date: date,
                category: 'Mantenimiento',
                description: expenseDescription,
                amount: cost,
                payment_method: 'Otros' // Default as not specified in form
            });

        if (expenseError) {
            console.error('Error auto-creating expense from maintenance:', expenseError);
            // We do NOT return false here, as the primary action (Maintenance) succeeded.
            // Just log it.
        } else {
            revalidatePath('/dashboard/finance'); // Update finance page
        }
    }

    revalidatePath(`/dashboard/vehicles/${vehicleId}`);
    return { success: true };
}

export async function deleteMaintenanceRecord(id: string, vehicleId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('vehicle_service_records')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting maintenance:', error);
        return { success: false, error: 'Error al eliminar registro' };
    }

    revalidatePath(`/dashboard/vehicles/${vehicleId}`);
    return { success: true };
}

// Document Actions

export async function addDocument(vehicleId: string, formData: FormData) {
    const supabase = await createClient();

    const type = formData.get('type') as string;
    const issue_date = formData.get('issue_date') as string;
    const expiry_date = formData.get('expiry_date') as string;
    const notes = formData.get('notes') as string;

    if (!type || !expiry_date) {
        return { success: false, error: 'Tipo y vencimiento son requeridos' };
    }

    const { error } = await supabase
        .from('vehicle_documents')
        .insert({
            vehicle_id: vehicleId,
            type,
            issue_date: issue_date || null,
            expiry_date,
            notes
        });

    if (error) {
        console.error('Error adding document:', error);
        return { success: false, error: 'Error al agregar documento' };
    }

    revalidatePath(`/dashboard/vehicles/${vehicleId}`);
    return { success: true };
}

export async function deleteDocument(id: string, vehicleId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('vehicle_documents')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: 'Error al eliminar documento' };
    }

    revalidatePath(`/dashboard/vehicles/${vehicleId}`);
    return { success: true };
}
