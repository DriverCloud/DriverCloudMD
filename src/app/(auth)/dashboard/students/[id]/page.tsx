import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { StudentProfileHeader } from '@/components/students/StudentProfileHeader';
import { ClassHistory } from '@/components/students/ClassHistory';
import { FinancialHistory } from '@/components/students/FinancialHistory';
import { getUserRole } from '@/app/actions/auth';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch Student Details
    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

    if (studentError || !student) {
        notFound();
    }

    // 2. Fetch Balance (using view if available, or defaulting)
    const { data: balanceData } = await supabase
        .from('view_student_balances')
        .select('*')
        .eq('student_id', id)
        .single();

    // Default balance object if view returns nothing
    const balance = balanceData || { balance: 0, total_debt: 0, total_paid: 0 };

    // 3. Fetch Appointments (Classes)
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            *,
            instructor:instructors(first_name, last_name),
            vehicle:vehicles(brand, model, license_plate),
            class_type:class_types(name),
            evaluation:class_evaluations(*)
        `)
        .eq('student_id', id)
        .order('scheduled_date', { ascending: false })
        .order('start_time', { ascending: false });

    // 4. Fetch Packages
    const { data: packages } = await supabase
        .from('student_packages')
        .select('*')
        .eq('student_id', id)
        .order('purchase_date', { ascending: false });

    // 5. Fetch Payments
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', id)
        .order('payment_date', { ascending: false });

    // 6. Fetch User Role
    const userRole = await getUserRole();

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Profile Header */}
            <StudentProfileHeader student={student} balance={balance} userRole={userRole} />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Classes */}
                <div className="space-y-6 lg:col-span-2">
                    <ClassHistory appointments={appointments || []} />
                </div>

                {/* Right Column: Finance */}
                <div className="space-y-6">
                    <FinancialHistory packages={packages || []} payments={payments || []} />
                </div>
            </div>
        </div>
    );
}
