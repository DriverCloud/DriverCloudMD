import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // 0. Get Current User (Admin/Owner)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Uauthorized. Please log in.' }, { status: 401 });
    }

    // 1. Get all SCHEDULED or COMPLETED appointments
    // We don't strictly need relation to instructors now as we override ID
    const { data: appointments, error: fetchError } = await supabase
        .from('appointments')
        .select(`
            id, 
            student_id, 
            status,
            class_evaluations(id)
        `)
        .in('status', ['scheduled', 'completed']);

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!appointments || appointments.length === 0) {
        return NextResponse.json({ message: 'No appointments found.' });
    }

    // 2. Identify classes that need status update and/or evaluation
    const updates = [];
    const evaluationsToInsert = [];

    for (const apt of appointments) {
        // If status is scheduled, we need to update it
        if (apt.status === 'scheduled') {
            updates.push(apt.id);
        }

        // If no evaluation, we need to add one
        if (!apt.class_evaluations || apt.class_evaluations.length === 0) {
            evaluationsToInsert.push({
                appointment_id: apt.id,
                student_id: apt.student_id,
                // USE CURRENT ADMIN USER ID as the evaluator to avoid FK errors with non-existent instructors users
                instructor_id: user.id,
                rating: 5,
                public_comment: 'Clase completada exitosamente (Generado Automáticamente).',
                private_notes: 'Backfill de sistema realizado por Admin.',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    }

    // 3. Perform Updates (Mark as completed)
    if (updates.length > 0) {
        const { error: updateError } = await supabase
            .from('appointments')
            .update({ status: 'completed' })
            .in('id', updates);

        if (updateError) {
            return NextResponse.json({ error: 'Error updating statuses: ' + updateError.message }, { status: 500 });
        }
    }

    // 4. Perform Inserts (Create Evaluations)
    if (evaluationsToInsert.length > 0) {
        const { error: insertError } = await supabase
            .from('class_evaluations')
            .insert(evaluationsToInsert);

        if (insertError) {
            return NextResponse.json({ error: 'Error creating evaluations: ' + insertError.message }, { status: 500 });
        }
    }

    return NextResponse.json({
        success: true,
        message: `Updated ${updates.length} classes to completed. Created ${evaluationsToInsert.length} evaluations (assigned to Admin).`
    });
}
