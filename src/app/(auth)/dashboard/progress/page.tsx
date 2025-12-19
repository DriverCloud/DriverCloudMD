import { createClient } from "@/lib/supabase/server";
import { StudentProgressView } from "@/components/dashboard/student/StudentProgressView";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 1. Get Student ID from User
    const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!student) {
        // If not a student or not linked, redirect or show error
        // Or check if admin viewing a student? For now assume Student Role
        return <div className="p-8">No se encontró perfil de estudiante.</div>;
    }

    // 2. Get Total Credits Purchased (from Packages)
    // Assuming table 'student_packages' exists as per actions.ts
    const { data: packages, error: pkgError } = await supabase
        .from('student_packages')
        .select('credits')
        .eq('student_id', student.id);

    const totalCreditsPurchased = packages?.reduce((sum, pkg) => sum + (pkg.credits || 0), 0) || 0;

    // 3. Get Appointments Stats
    const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('status')
        .eq('student_id', student.id);

    const completedClasses = appointments?.filter(a => a.status === 'completed').length || 0;
    const scheduledClasses = appointments?.filter(a => a.status === 'scheduled').length || 0;

    // Attendance: 'completed' vs 'noshow'
    const noshowClasses = appointments?.filter(a => a.status === 'noshow').length || 0;
    const totalAttempted = completedClasses + noshowClasses;

    // Remaining (Simple Calc: Purchased - (Completed + Scheduled + NoShow?))
    // Depend on policy if NoShow deducts credit. Assume YES.
    const usedCredits = completedClasses + scheduledClasses + noshowClasses;
    // Or if we want "Available to Schedule", it is Total - Used.
    // If we want "Remaining to Complete Course", maybe different.

    // Let's interpret "Remaining" as "Credits Available to Book".
    // AND "Used" as "Completed".
    const remainingCredits = Math.max(0, totalCreditsPurchased - usedCredits);

    const creditsData = {
        total: totalCreditsPurchased,
        used: completedClasses, // For progress bar (Completed)
        remaining: remainingCredits
    };

    const attendanceData = {
        present: completedClasses,
        absent: noshowClasses,
        total: totalAttempted
    };

    return (
        <StudentProgressView
            credits={creditsData}
            attendance={attendanceData}
            loading={false}
        />
    );
}
