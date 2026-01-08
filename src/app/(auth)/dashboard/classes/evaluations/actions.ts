'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEvaluation(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const appointmentId = formData.get('appointment_id') as string;
    const instructorId = formData.get('instructor_id') as string;
    const studentId = formData.get('student_id') as string;
    const rating = parseInt(formData.get('rating') as string);
    const publicComment = formData.get('public_comment') as string;
    const privateNotes = formData.get('private_notes') as string || null;

    // Validate Rating
    if (isNaN(rating) || rating < 1 || rating > 5) {
        return { success: false, error: 'Calificación inválida' };
    }

    // Authorization check: Ensure user is the instructor of the appointment
    if (user.id !== instructorId) {
        // Double check if user is admin/owner if necessary, strict match for now
        return { success: false, error: 'No tienes permiso para evaluar esta clase' };
    }

    const { data, error } = await supabase.from('class_evaluations').insert({
        appointment_id: appointmentId,
        instructor_id: instructorId,
        student_id: studentId,
        rating: rating,
        public_comment: publicComment,
        private_notes: privateNotes
    }).select().single();

    if (error) {
        console.error('Error creating evaluation:', error);
        return { success: false, error: 'Error al guardar la evaluación' };
    }

    revalidatePath(`/dashboard/classes`);
    return { success: true, data };
}

export async function getEvaluation(appointmentId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    const { data: evaluation, error } = await supabase
        .from('class_evaluations')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

    if (error) {
        return { success: false, error: 'Evaluación no encontrada' };
    }

    // Role check to filter private notes
    // We need to know if the user is a student or instructor/admin.
    // Fetch user role mainly.
    // Optimization: Just check student table.

    const { data: student } = await supabase.from('students').select('id').eq('user_id', user.id).single();

    if (student && student.id === evaluation.student_id) {
        // User is the student, remove private notes
        const safeEvaluation = { ...evaluation };
        delete safeEvaluation.private_notes;
        return { success: true, data: safeEvaluation, isStudent: true };
    }

    return { success: true, data: evaluation, isStudent: false };
}
