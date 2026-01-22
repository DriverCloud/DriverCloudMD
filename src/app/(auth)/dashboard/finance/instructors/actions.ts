'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SettlementCalculation = {
    instructor: {
        id: string;
        first_name: string;
        last_name: string;
        salary_type: 'fixed' | 'per_class' | 'mixed';
        base_salary: number;
        price_per_class: number;
    };
    period: {
        start: string;
        end: string;
    };
    stats: {
        total_classes: number;
        completed_classes: number;
    };
    amounts: {
        base: number;
        variable: number;
        total: number;
    };
};

export async function calculateSettlement(
    instructorId: string,
    startDate: string,
    endDate: string
): Promise<{ success: boolean; data?: SettlementCalculation; error?: string }> {
    const supabase = await createClient();

    // 1. Get Instructor details
    const { data: instructor, error: instError } = await supabase
        .from('instructors')
        .select('*')
        .eq('id', instructorId)
        .single();

    if (instError || !instructor) {
        return { success: false, error: 'Instructor no encontrado' };
    }

    // 2. Fetch completed classes in period
    const { data: appointments, error: appError } = await supabase
        .from('appointments')
        .select('*')
        .eq('instructor_id', instructorId)
        .eq('status', 'completed')
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

    if (appError) {
        console.error('Error fetching classes:', appError);
        return { success: false, error: 'Error al consultar clases' };
    }

    // 3. Fetch specific rates
    const { data: rates } = await supabase
        .from('instructor_rates')
        .select('*')
        .eq('instructor_id', instructorId);

    const completedClasses = appointments?.length || 0;

    // 4. Calculate Amounts
    const baseAmount = Number(instructor.base_salary) || 0;
    const defaultPricePerClass = Number(instructor.price_per_class) || 0;

    let variableAmount = 0;
    let finalBaseAmount = 0;

    if (instructor.salary_type === 'fixed') {
        finalBaseAmount = baseAmount;
        variableAmount = 0; // Fixed only
    } else {
        // per_class or mixed
        if (instructor.salary_type === 'mixed') {
            finalBaseAmount = baseAmount;
        }

        // Calculate variable part class by class
        variableAmount = appointments?.reduce((total, appointment) => {
            // Find specific rate for this class type
            const specificRate = rates?.find(r => r.class_type_id === appointment.class_type_id);
            const rate = specificRate ? Number(specificRate.amount) : defaultPricePerClass;
            return total + rate;
        }, 0) || 0;
    }

    const totalAmount = finalBaseAmount + variableAmount;

    return {
        success: true,
        data: {
            instructor: {
                id: instructor.id,
                first_name: instructor.first_name,
                last_name: instructor.last_name,
                salary_type: instructor.salary_type || 'per_class',
                base_salary: baseAmount,
                price_per_class: defaultPricePerClass,
            },
            period: {
                start: startDate,
                end: endDate
            },
            stats: {
                total_classes: completedClasses, // Just showing completed as total relevant
                completed_classes: completedClasses
            },
            amounts: {
                base: finalBaseAmount,
                variable: variableAmount,
                total: totalAmount
            }
        }
    };
}

export async function registerInstructorPayment(data: {
    instructor_id: string;
    period_start: string;
    period_end: string;
    total_classes: number;
    base_amount: number;
    vars_amount: number;
    total_amount: number;
    notes?: string;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Get school_id and owner_id context
    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Membresía no encontrada' };

    // Get instructor details for description
    const { data: instructor } = await supabase
        .from('instructors')
        .select('first_name, last_name')
        .eq('id', data.instructor_id)
        .single();

    const instructorName = instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Instructor';

    // 1. Register Payment
    const { error: paymentError } = await supabase
        .from('instructor_payments')
        .insert({
            ...data,
            school_id: membership.school_id,
            status: 'paid',
            payment_date: new Date().toISOString()
        });

    if (paymentError) {
        console.error(paymentError);
        return { success: false, error: paymentError.message };
    }

    // 2. Register Expense automatically
    const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
            school_id: membership.school_id,
            owner_id: membership.owner_id,
            date: new Date().toISOString(),
            category: 'Sueldos',
            description: `Liquidación ${instructorName} - Periodo ${data.period_start} al ${data.period_end}`,
            amount: data.total_amount,
            payment_method: 'cash' // Defaulting to cash for now
        });

    if (expenseError) {
        console.error("Error creating expense for instructor payment:", expenseError);
        // We don't fail the whole operation if expense creation fails, but we should log it. 
        // Or strictly we could, but the payment record is more important.
    }

    revalidatePath('/dashboard/finance/instructors');
    revalidatePath('/dashboard/finance'); // Revalidate finance dashboard too
    return { success: true };
}
