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

    // Resolve Instructor User ID from the provided InstructorTable ID
    const { data: instructorData, error: instructorError } = await supabase
        .from('instructors')
        .select('user_id')
        .eq('id', instructorId)
        .single();

    if (instructorError || !instructorData || !instructorData.user_id) {
        return { success: false, error: 'No se encontró el usuario del instructor asociado.' };
    }

    const instructorUserId = instructorData.user_id;

    // Authorization check: Ensure user is the instructor of the appointment OR has admin/owner privileges
    const { data: membership } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', user.id)
        .single();

    const isAuthorized =
        user.id === instructorUserId ||
        (membership && ['admin', 'owner'].includes(membership.role));

    if (!isAuthorized) {
        return { success: false, error: 'No tienes permiso para evaluar esta clase' };
    }

    const { data, error } = await supabase.from('class_evaluations').upsert({
        appointment_id: appointmentId,
        instructor_id: instructorUserId, // Use the resolved User ID
        student_id: studentId,
        rating: rating,
        public_comment: publicComment,
        private_notes: privateNotes
    }, { onConflict: 'appointment_id' }).select().single();

    if (error) {
        console.error('Error creating evaluation:', error);
        return { success: false, error: 'Error al guardar la evaluación: ' + error.message };
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
