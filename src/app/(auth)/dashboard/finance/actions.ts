'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPayments(options?: { startDate?: string, endDate?: string }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    let query = supabase
        .from('payments')
        .select(`
            *,
            student:students(first_name, last_name),
            creator_name
        `)
        .order('payment_date', { ascending: false });

    if (options?.startDate) {
        query = query.gte('payment_date', options.startDate);
    }
    if (options?.endDate) {
        // We assume endDate is the "next boundary" (e.g., start of next month), so we use strictly less strictly (lt)
        query = query.lt('payment_date', options.endDate);
    }

    const { data, error } = await query;

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

    revalidatePath('/dashboard/finance');
    return { success: true, data };
}

// EXPENSES ACTIONS

export async function getExpenses(options?: { startDate?: string, endDate?: string }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    let query = supabase
        .from('expenses')
        .select('*, creator_name')
        .order('date', { ascending: false });

    if (options?.startDate) {
        query = query.gte('date', options.startDate);
    }
    if (options?.endDate) {
        // We assume endDate is the "next boundary" (e.g., start of next month), so we use strictly less strictly (lt)
        query = query.lt('date', options.endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching expenses:', error);
        return { success: false, error: 'Error al cargar gastos' };
    }

    return { success: true, data };
}

export async function createExpense(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Sin membresía' };

    const date = formData.get('date') as string;
    const type = formData.get('type') as string; // Will map to category
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const method = formData.get('method') as string;

    const { error } = await supabase.from('expenses').insert({
        school_id: membership.school_id,
        owner_id: membership.owner_id,
        date: date,
        category: type,
        description: description,
        amount: amount,
        payment_method: method,
        created_by: user.id
    });

    if (error) {
        console.error('Error creating expense:', error);
        return { success: false, error: 'Error al registrar gasto' };
    }

    revalidatePath('/dashboard/finance');
    return { success: true };
}

export async function deleteExpense(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
        return { success: false, error: 'Error borrando gasto' };
    }

    revalidatePath('/dashboard/finance');
    return { success: true };
}
