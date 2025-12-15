'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createStudent(formData: FormData) {
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

    // Validate required fields
    if (!firstName || !lastName) {
        return { success: false, error: 'Nombre y apellido son requeridos' };
    }

    // Insert student
    const { data, error } = await supabase
        .from('students')
        .insert({
            school_id: membership.school_id,
            owner_id: membership.owner_id,
            location_id: membership.location_id,
            first_name: firstName,
            last_name: lastName,
            email: email || null,
            phone: phone || null,
            license_number: licenseNumber || null,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating student:', error);
        return { success: false, error: 'Error al crear el estudiante' };
    }

    // Revalidate the students page to show the new student
    revalidatePath('/students');

    return { success: true, data };
}

export async function updateStudent(studentId: string, formData: FormData) {
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

    // Validate required fields
    if (!firstName || !lastName) {
        return { success: false, error: 'Nombre y apellido son requeridos' };
    }

    // Update student
    const { data, error } = await supabase
        .from('students')
        .update({
            first_name: firstName,
            last_name: lastName,
            email: email || null,
            phone: phone || null,
            license_number: licenseNumber || null,
        })
        .eq('id', studentId)
        .select()
        .single();

    if (error) {
        console.error('Error updating student:', error);
        return { success: false, error: 'Error al actualizar el estudiante' };
    }

    revalidatePath('/students');

    return { success: true, data };
}

export async function deleteStudent(studentId: string) {
    const supabase = await createClient();

    // Soft delete by setting deleted_at
    const { error } = await supabase
        .from('students')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', studentId);

    if (error) {
        console.error('Error deleting student:', error);
        return { success: false, error: 'Error al eliminar el estudiante' };
    }

    revalidatePath('/students');

    return { success: true };
}

export async function createPackage(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id')
        .eq('user_id', user.id)
        .single();
    if (!membership) return { success: false, error: 'Sin membresía' };

    const studentId = formData.get('student_id') as string;
    const name = formData.get('name') as string;
    const credits = Number(formData.get('credits'));
    const price = Number(formData.get('price'));

    if (!name || isNaN(credits) || isNaN(price)) {
        return { success: false, error: 'Datos inválidos' };
    }

    const { error } = await supabase.from('packages').insert({
        school_id: membership.school_id,
        owner_id: membership.owner_id,
        student_id: studentId,
        name,
        total_credits: credits,
        remaining_credits: credits,
        price,
        status: 'active',
        purchase_date: new Date().toISOString()
    });

    if (error) {
        console.error('Error creating package:', error);
        return { success: false, error: 'Error al asignar paquete' };
    }

    revalidatePath('/students');
    return { success: true };
}

export async function getStudentProfile(studentId: string) {
    const supabase = await createClient();

    const [
        { data: student, error: studentError },
        { data: balance },
        { data: appointments },
        { data: packages },
        { data: payments }
    ] = await Promise.all([
        supabase.from('students').select('*').eq('id', studentId).single(),
        supabase.from('view_student_balances').select('balance, total_paid, total_debt').eq('student_id', studentId).single(),
        supabase.from('appointments').select(`
            *,
            class_type:class_types(name),
            instructor:instructors(first_name, last_name),
            vehicle:vehicles(name, plate)
        `).eq('student_id', studentId).order('date', { ascending: false }),
        supabase.from('packages').select('*').eq('student_id', studentId).order('purchase_date', { ascending: false }),
        supabase.from('payments').select('*').eq('student_id', studentId).order('payment_date', { ascending: false })
    ]);

    if (studentError) {
        console.error('Error fetching profile:', studentError);
        return null;
    }

    return {
        student,
        balance: balance || { balance: 0, total_paid: 0, total_debt: 0 },
        appointments: appointments || [],
        packages: packages || [],
        payments: payments || []
    };
}
