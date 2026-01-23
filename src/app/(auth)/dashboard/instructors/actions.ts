'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { ActionState } from "@/types";

export async function createInstructor(formData: FormData): Promise<ActionState> {
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
    const birthDate = formData.get('birth_date') as string;
    const cuil = formData.get('cuil') as string;
    const address = formData.get('address') as string;
    const emergencyContactName = formData.get('emergency_contact_name') as string;
    const emergencyContactPhone = formData.get('emergency_contact_phone') as string;
    const licenseNumber = formData.get('license_number') as string;
    const licenseExpiry = formData.get('license_expiry') as string;
    const salaryType = formData.get('salary_type') as string;
    const baseSalary = parseFloat(formData.get('base_salary') as string) || 0;
    const pricePerClass = parseFloat(formData.get('price_per_class') as string) || 0;

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
            birth_date: birthDate || null,
            cuil: cuil || null,
            address: address || null,
            emergency_contact_name: emergencyContactName || null,
            emergency_contact_phone: emergencyContactPhone || null,
            license_number: licenseNumber || null,
            license_expiry: licenseExpiry || null,
            salary_type: salaryType || 'per_class',
            base_salary: baseSalary,
            price_per_class: pricePerClass,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating instructor:', error);
        return { success: false, error: 'Error al crear el instructor' };
    }

    // Revalidate the instructors page to show the new instructor
    revalidatePath('/dashboard/instructors');

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
    const birthDate = formData.get('birth_date') as string;
    const cuil = formData.get('cuil') as string;
    const address = formData.get('address') as string;
    const emergencyContactName = formData.get('emergency_contact_name') as string;
    const emergencyContactPhone = formData.get('emergency_contact_phone') as string;
    const licenseNumber = formData.get('license_number') as string;
    const licenseExpiry = formData.get('license_expiry') as string;
    const salaryType = formData.get('salary_type') as string;
    const baseSalary = parseFloat(formData.get('base_salary') as string) || 0;
    const pricePerClass = parseFloat(formData.get('price_per_class') as string) || 0;

    // Handle Rates
    const ratesJson = formData.get('rates') as string;

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
            birth_date: birthDate || null,
            cuil: cuil || null,
            address: address || null,
            emergency_contact_name: emergencyContactName || null,
            emergency_contact_phone: emergencyContactPhone || null,
            license_number: licenseNumber || null,
            license_expiry: licenseExpiry || null,
            salary_type: salaryType || 'per_class',
            base_salary: baseSalary,
            price_per_class: pricePerClass,
        })
        .eq('id', instructorId)
        .select()
        .single();

    if (error) {
        console.error('Error updating instructor:', error);
        return { success: false, error: 'Error al actualizar el instructor' };
    }

    // Update Rates if provided
    if (ratesJson) {
        try {
            const rates = JSON.parse(ratesJson);

            // Delete existing rates for this instructor to avoid stale data (simple strategy)
            // Or upsert. Upsert is better but ensuring we delete removed ones is tricky with upsert only.
            // Let's go with: Delete all and re-insert (replace). 
            // Since we're sending the FULL state of rates from the frontend.

            await supabase.from('instructor_rates').delete().eq('instructor_id', instructorId);

            if (rates.length > 0) {
                const ratesToInsert = rates.map((r: any) => ({
                    instructor_id: instructorId,
                    class_type_id: r.class_type_id,
                    amount: r.amount
                }));

                const { error: ratesError } = await supabase
                    .from('instructor_rates')
                    .insert(ratesToInsert);

                if (ratesError) {
                    console.error('Error updating rates:', ratesError);
                    // Not returning failure since main update succeeded, but logging it.
                }
            }
        } catch (e) {
            console.error('Error processing rates:', e);
        }
    }

    revalidatePath('/dashboard/instructors');

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

    revalidatePath('/dashboard/instructors');

    return { success: true };
}

export async function getClassTypes() {
    const supabase = await createClient();
    const { data } = await supabase.from('class_types').select('*').order('name');
    return data || [];
}

export async function getInstructorRates(instructorId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('instructor_rates')
        .select('*')
        .eq('instructor_id', instructorId);
    return data || [];
}
