'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeClass(appointmentId: string, mileage: number, notes: string) {
    const supabase = await createClient();

    // 1. Get User for debugging
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        console.error("completeClass: No user found", userError);
        return { success: false, error: "User not authenticated" };
    }
    console.log(`completeClass: User ${user.id} attempting to complete appointment ${appointmentId}`);

    // 2. Update Appointment
    const { error: appError } = await supabase
        .from('appointments')
        .update({
            status: 'completed',
            end_mileage: mileage,
            notes: notes
        })
        .eq('id', appointmentId);

    if (appError) {
        console.error("Error completing class:", appError);
        console.error("Violated Policy details:", appError.details);
        console.error("Violated Policy hint:", appError.hint);
        return { success: false, error: appError.message || "Unknown DB Error" };
    }

    // 2. We depend on the DB Trigger for vehicle mileage update.
    // However, as a fallback (if trigger migration failed), we can try to update vehicle manually here too?
    // No, let's trust the DB or user resolving the migration. 
    // BUT, if the user is stuck, we can do a manual vehicle update here using the SERVICE ROLE if we had it, 
    // but standard `createClient` uses user auth.

    // So if RLS is the issue, this action will ALSO fail unless RLS is fixed.
    // So the migration IS critical.

    revalidatePath('/instructor');
    revalidatePath(`/instructor/${appointmentId}`);
    return { success: true };
}
