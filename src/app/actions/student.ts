'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function rateClass(appointmentId: string, rating: number) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Usuario no autenticado." };
    }

    // 2. Validate rating
    if (rating < 1 || rating > 5) {
        return { success: false, error: "La calificación debe estar entre 1 y 5 estrellas." };
    }

    // 3. Update Appointment
    const { error: appError } = await supabase
        .from('appointments')
        .update({
            status: 'rated',
            student_rating: rating
        })
        .eq('id', appointmentId);

    if (appError) {
        console.error("Error rating class:", appError);
        return { success: false, error: "No se pudo guardar la calificación." };
    }

    revalidatePath('/student');
    return { success: true };
}
