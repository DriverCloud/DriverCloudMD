import { createClient } from "@/lib/supabase/client";

export interface Payment {
    id: string;
    amount: number;
    payment_method: string;
    payment_status: string;
    payment_date: string;
    student_id: string;
    created_at: string;
    student?: {
        first_name: string;
        last_name: string;
    }
}

export const paymentsService = {
    async getIncomeStats() {
        const supabase = createClient();

        // Sum all successful payments
        const { data, error } = await supabase
            .from('payments')
            .select('amount')
            .eq('payment_status', 'completed'); // Assuming 'completed' is the status for paid

        if (error) {
            console.error('Error fetching income:', error);
            return 0;
        }

        const totalIncome = data?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
        return totalIncome;
    },

    async getRecentPayments(limit = 5): Promise<Payment[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                student:students(first_name, last_name)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as unknown as Payment[];
    },

    async createPayment(payment: {
        student_id: string;
        amount: number;
        payment_method: string;
        notes?: string;
    }) {
        const supabase = createClient();

        // Get school_id and owner_id from session/membership
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data: membership } = await supabase
            .from('memberships')
            .select('school_id, owner_id')
            .eq('user_id', user.id)
            .single();

        if (!membership) throw new Error("Membership not found");

        const { data, error } = await supabase
            .from('payments')
            .insert({
                ...payment,
                school_id: membership.school_id,
                owner_id: membership.owner_id,
                payment_status: 'completed', // Default to completed for manual entry
                payment_date: new Date().toISOString(),
                created_by: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
