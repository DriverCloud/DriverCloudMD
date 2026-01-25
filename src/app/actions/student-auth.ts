'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function inviteStudent(studentId: string, email: string) {
    const supabase = await createClient(); // For auth check
    const supabaseAdmin = createAdminClient(); // For ops

    // 1. Security Check: Ensure caller is authenticated (and ideally is admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 2. Check if student already has a user
    // (Optional optimization: Check DB first)

    // 3. Create Auth User
    // Generate a secure temp password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm
        user_metadata: { role: 'student' }
    });

    if (createError) {
        // Handle "User already registered" case
        return { success: false, error: createError.message };
    }

    if (!newUser.user) {
        return { success: false, error: "Failed to create user" };
    }

    // 4. Link Student Record
    const { error: updateError } = await supabaseAdmin
        .from('students')
        .update({ user_id: newUser.user.id })
        .eq('id', studentId);

    if (updateError) {
        // Rollback? Or just error. For now, error.
        return { success: false, error: "User created but failed to link to student: " + updateError.message };
    }

    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true, password: tempPassword, email: email };
}

export async function resetStudentPassword(studentId: string, email: string) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Get the user_id from the student record
    const { data: student } = await supabaseAdmin
        .from('students')
        .select('user_id')
        .eq('id', studentId)
        .single();

    if (!student?.user_id) return { success: false, error: "Student has no user linked" };

    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        student.user_id,
        { password: tempPassword }
    );

    if (updateError) return { success: false, error: updateError.message };

    return { success: true, password: tempPassword, email: email };
}
