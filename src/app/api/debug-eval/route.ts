import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    const { data: appointment, error: appError } = await supabase
        .from('appointments')
        .select(`
            id, 
            status, 
            class_type_id, 
            instructor_id, 
            student_id,
            scheduled_date,
            evaluation:class_evaluations(*)
        `)
        .eq('student_id', 'ded20ce1-b743-44e6-856a-cbf6fffbbbc8') // Hardcoded for debugging Jose Demo
        .order('scheduled_date', { ascending: false })
        .limit(5); // Get last 5

    if (appError) {
        return NextResponse.json({ error: 'Failed to fetch appointment', details: appError });
    }

    if (!appointment || appointment.length === 0) {
        return NextResponse.json({ error: 'No completed appointments found' });
    }

    const firstApp = appointment[0];

    // 2. Inspect Instructor
    const { data: instructor, error: instError } = await supabase
        .from('instructors')
        .select('*')
        .eq('id', firstApp.instructor_id)
        .single();

    // 3. Inspect Membership/User check (simulate action logic)
    let instructorUser = null;
    let membership = null;

    if (instructor && instructor.user_id) {
        // Check membership
        const m = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', instructor.user_id)
            .single();
        membership = m.data;
        instructorUser = instructor.user_id;
    }

    // 4. Check Current User
    const { data: { user } } = await supabase.auth.getUser();
    let currentUserMembership = null;
    if (user) {
        const { data } = await supabase.from('memberships').select('role').eq('user_id', user.id).single();
        currentUserMembership = data;
    }

    return NextResponse.json({
        appointments: appointment,
        instructor_query: {
            input_id: firstApp.instructor_id,
            found: !!instructor,
            data: instructor,
            error: instError
        },
        user_check: {
            instructor_user_id: instructorUser,
            membership
        },
        current_user: {
            id: user?.id,
            email: user?.email,
            membership: currentUserMembership,
            is_authorized_action: user && (
                user.id === instructorUser ||
                (currentUserMembership && ['admin', 'owner'].includes(currentUserMembership.role))
            )
        },
        action_simulation: {
            would_succeed_fetch: !!instructorUser,
            message: !instructorUser ? 'No se encontró el usuario del instructor asociado.' : 'Inspector User Found'
        }
    });
}
