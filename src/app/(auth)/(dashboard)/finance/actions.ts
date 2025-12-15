'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPayments() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            student:students(first_name, last_name)
        `)
        .order('created_at', { ascending: false }); // Fallback to created_at usually exists

    if (error) {
        console.error('Error fetching payments:', error);
        return { success: false, error: 'Error al cargar pagos' };
    }

    return { success: true, data };
}

export async function createPayment(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    // Get membership
    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id, location_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Sin membresía' };

    const studentId = formData.get('student_id') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const method = formData.get('method') as string;
    const notes = formData.get('notes') as string;
    const date = formData.get('date') as string; // YYYY-MM-DD

    const { data, error } = await supabase.from('payments').insert({
        school_id: membership.school_id,
        owner_id: membership.owner_id,
        student_id: studentId,
        amount: amount,
        payment_method: method,
        payment_date: date,
        payment_status: 'completed',
        notes: notes,
        created_by: user.id
    }).select().single();

    if (error) {
        console.error('Error creating payment:', error);
        return { success: false, error: 'Error al registrar pago' };
    }

    revalidatePath('/finance');
    return { success: true, data };
}
