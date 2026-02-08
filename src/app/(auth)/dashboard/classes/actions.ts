'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getAppointments(startDate: string, endDate: string, studentId?: string, instructorId?: string, vehicleId?: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    let query = supabase
        .from('appointments')
        .select(`
            id,
            scheduled_date,
            start_time,
            end_time,
            status,
            notes,
            student_id,
            instructor_id,
            vehicle_id,
            class_type_id,
            student:students(first_name, last_name),
            instructor:instructors(first_name, last_name),
            vehicle:vehicles(brand, model, license_plate),
            class_type:class_types(name, duration_minutes),
            package:student_packages(id, total_credits),
            class_number,
            evaluation:class_evaluations(*)
        `)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

    // Optional Filters
    if (studentId) {
        query = query.eq('student_id', studentId);
    }
    if (instructorId) {
        query = query.eq('instructor_id', instructorId);
    }
    if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
    }

    const { data: appointments, error } = await query
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching appointments:', error);
        return { success: false, error: 'Error al cargar los turnos' };
    }

    return { success: true, data: appointments };
}

// Helper function to check for scheduling conflicts
async function checkConflicts(
    supabase: any,
    date: string,
    startTime: string,
    endTime: string,
    instructorId: string,
    vehicleId: string,
    studentId: string,
    excludeAppointmentId?: string
) {
    // Check for overlapping appointments
    // An appointment overlaps if:
    // 1. (new_start <= existing_start AND new_end > existing_start) OR
    // 2. (new_start < existing_end AND new_end >= existing_end) OR
    // 3. (new_start >= existing_start AND new_end <= existing_end)

    let query = supabase
        .from('appointments')
        .select('id, instructor_id, vehicle_id, student_id, start_time, end_time')
        .eq('scheduled_date', date)
        .eq('status', 'scheduled')
        .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`);

    if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
    }

    const { data: conflicts } = await query;

    if (!conflicts || conflicts.length === 0) {
        return { hasConflict: false };
    }

    // Check specific resource conflicts
    const instructorConflict = conflicts.find((c: any) => c.instructor_id === instructorId);
    const vehicleConflict = conflicts.find((c: any) => c.vehicle_id === vehicleId);
    const studentConflict = conflicts.find((c: any) => c.student_id === studentId);

    if (instructorConflict) {
        return {
            hasConflict: true,
            error: `El instructor ya tiene una clase agendada de ${instructorConflict.start_time.slice(0, 5)} a ${instructorConflict.end_time.slice(0, 5)}`
        };
    }

    if (vehicleConflict) {
        return {
            hasConflict: true,
            error: `El vehículo ya está asignado a otra clase de ${vehicleConflict.start_time.slice(0, 5)} a ${vehicleConflict.end_time.slice(0, 5)}`
        };
    }

    if (studentConflict) {
        return {
            hasConflict: true,
            error: `El estudiante ya tiene una clase agendada de ${studentConflict.start_time.slice(0, 5)} a ${studentConflict.end_time.slice(0, 5)}`
        };
    }

    return { hasConflict: false };
}

async function refundCredits(supabase: any, appointmentId: string) {
    // Fetch appointment details needed for refund
    const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
            package_id,
            class_type:class_types(duration_minutes)
        `)
        .eq('id', appointmentId)
        .single();

    if (error || !appointment || !appointment.package_id || !appointment.class_type) {
        console.error('Error fetching appointment for refund:', error);
        return; // Cannot refund if package or class type is missing
    }

    // Calculate credit to refund
    const creditAmount = appointment.class_type.duration_minutes >= 90 ? 2 : 1;

    // Get current package credits
    const { data: pkg, error: pkgError } = await supabase
        .from('student_packages')
        .select('credits')
        .eq('id', appointment.package_id)
        .single();

    if (pkgError || !pkg) {
        console.error('Error fetching package for refund:', pkgError);
        return;
    }

    // Refund credits
    const { error: updateError } = await supabase
        .from('student_packages')
        .update({ credits: pkg.credits + creditAmount })
        .eq('id', appointment.package_id);

    if (updateError) {
        console.error('Error refunding credits:', updateError);
    }
}


export async function createAppointment(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Get membership to link data
    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id, location_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Sin membresía' };

    const studentId = formData.get('student_id') as string;
    const instructorId = formData.get('instructor_id') as string;
    const vehicleId = formData.get('vehicle_id') as string;
    const classTypeId = formData.get('class_type_id') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('start_time') as string;
    const notes = formData.get('notes') as string;

    const { data: classType } = await supabase
        .from('class_types')
        .select('duration_minutes')
        .eq('id', classTypeId)
        .single();

    if (!classType) return { success: false, error: 'Tipo de clase inválido' };

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes + classType.duration_minutes);
    const endTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

    // VALIDATE AVAILABILITY - Check for conflicts
    const conflictCheck = await checkConflicts(
        supabase,
        date,
        startTime,
        endTime,
        instructorId,
        vehicleId,
        studentId
    );

    if (conflictCheck.hasConflict) {
        return { success: false, error: conflictCheck.error };
    }

    // PACKAGE VALIDATION - Check if student has credits
    const { data: activePackage, error: pkgError } = await supabase
        .from('student_packages')
        .select('id, credits, total_credits')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .gt('credits', 0)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (pkgError || !activePackage) {
        return { success: false, error: 'El estudiante no tiene créditos disponibles o paquetes activos.' };
    }

    // DEDUCT CREDITS
    // Calculate credit cost based on duration
    // If duration >= 90 minutes, it costs 2 credits. Otherwise 1.
    const creditCost = classType.duration_minutes >= 90 ? 2 : 1;

    // Check if enough credits
    if (activePackage.credits < creditCost) {
        return { success: false, error: `El estudiante no tiene suficientes créditos. Se requieren ${creditCost} créditos.` };
    }

    const { error: updateError } = await supabase
        .from('student_packages')
        .update({ credits: activePackage.credits - creditCost })
        .eq('id', activePackage.id);

    if (updateError) {
        console.error('Error updating credits:', updateError);
        return { success: false, error: 'Error al consumir los créditos del alumno.' };
    }


    // Calculate class number: (Total - Remaining) + 1
    // Example: Total 10, Remaining 10 -> Class 1 (Start)
    // If creditCost is 2:
    // Started with 10. Cost 2. Remaining becomes 8.
    // Class number: 10 - 8 + 1 = 3 ?? No wait.

    // If I have 10 credits.
    // 1. Single Class (Cost 1). Remaining 9.
    // Number = 10 - 9 = 1 ?? No.
    // Usually: Total - Remaining (after deduction) ?? 

    // Let's re-verify the formula.
    // Previous code: `(activePackage.total_credits || activePackage.credits) - activePackage.credits + 1`
    // Wait, activePackage.credits was utilizing the value *before* update.
    // If I have 10.
    // Old logic: 10 - 10 + 1 = 1.
    // New logic: 
    // If deduct 2. Remaining will be 8.
    // I want this class to be "Class #number".

    // If it's the first class ever.
    // Total 10. Remaining (before update) 10.
    // Formula: 10 - 10 + 1 = 1.
    // So class_number is 1.
    // If cost is 2. The next time:
    // Total 10. Remaining (before update) 8.
    // Formula: 10 - 8 + 1 = 3.

    // This seems correct for the "start" number.
    // First class (double): Class 1. (Takes 1 and 2).
    // Second class (single): 
    // Total 10. Remaining 8.
    // Formula: 10 - 8 + 1 = 3.

    // Wait, user said: "Por ejmplo a las 10 a.m jose demo tiene una clase doble pero deberia se clase 3 y 4 de 10. La clase siguiente que tiene a las 12 hs deberia seria ser la clase 5"
    // So if previous classes consumed 2 credits (Class 1, Class 2).
    // Current class is double.
    // It starts at 3.
    // It consumes 2 credits.
    // Next class starts at 5.

    // So the formula `Total - Remaining(current) + 1` works IF `Remaining` is the current available balance.
    // Let's verify.
    // Initial: 10.
    // 1. Class Single. Cost 1.
    //    Balance: 10. ClassNum: 10-10+1 = 1.
    //    Update balance to 9.
    // 2. Class Single. Cost 1.
    //    Balance: 9. ClassNum: 10-9+1 = 2.
    //    Update balance to 8.
    // 3. Class Double. Cost 2.
    //    Balance: 8. ClassNum: 10-8+1 = 3.
    //    Update balance to 6.
    // 4. Class Single. Cost 1.
    //    Balance: 6. ClassNum: 10-6+1 = 5.

    // This logic holds perfectly.

    const classNumber = (activePackage.total_credits || activePackage.credits) - activePackage.credits + 1;

    // Get instructor details for payment snapshot
    const { data: instructor } = await supabase
        .from('instructors')
        .select('price_per_class, salary_type') // We can use salary_type as a "code" or part of it if needed, but user mentioned codes like P1/P2. 
        // Assuming price_per_class is the amount. The user mentioned "code" (P1, P2) which implies a new field on instructor or just a convention. 
        // Since we didn't add a 'payment_code' to instructors table yet, let's assume we just store the amount for now, 
        // OR we can generate a code based on date or just leave it null if not explicit.
        // User said: "mis clases de manejo tienen un código... P1... ese valor se le va a pagar 5000".
        // It seems the "code" represents the "price tier".
        // For now, I'll store the amount. Defining the code might require more business logic or a separate table of 'PriceCodes'.
        // Given the prompt, I will just store the amount. If the user wants to store "P1", they'd need to define where "P1" comes from.
        // Wait, the user said "yo se que el valor... va a ser en referencia al código".
        // AND "como podria yo para poder identificar que clases tienen un valor...".
        // IF I store the amount, that solves the "identify value" part.
        // The "code" might be useful but if it's not in the instructor profile, I can't guess it.
        // I will snapshot the PRICE. That's the most critical part.
        // I'll also add a TODO or just leave code null for now unless I find a source for it.
        .eq('id', instructorId)
        .single();

    // NOTE: In a real scenario, we might want to fetch a specific 'ClassPrice' table. 
    // Here we use the instructor's current configured price.

    const { data, error } = await supabase.from('appointments').insert({
        school_id: membership.school_id,
        owner_id: membership.owner_id,
        location_id: membership.location_id,
        student_id: studentId,
        instructor_id: instructorId,
        vehicle_id: vehicleId,
        class_type_id: classTypeId,
        scheduled_date: date,
        start_time: startTime,
        end_time: endTime,
        status: 'scheduled',
        notes: notes || null,
        created_by: user.id,
        package_id: activePackage.id,
        class_number: classNumber,
        instructor_payment_amount: instructor?.price_per_class || 0, // Snapshot current price
        // instructor_payment_code: 'STD' // Placeholder or derived if needed
    }).select().single();

    if (error) {
        console.error('Error creating appointment:', error);
        // ROLLBACK CREDIT (Attempt to restore credit if appointment failed)
        await supabase
            .from('student_packages')
            .update({ credits: activePackage.credits })
            .eq('id', activePackage.id);

        return { success: false, error: 'Error al agendar el turno' };
    }

    revalidatePath('/dashboard/classes');
    return { success: true, data };
}


export async function getResources() {
    const supabase = await createClient();

    const [students, instructors, vehicles, classTypes] = await Promise.all([
        supabase.from('students').select('id, first_name, last_name').eq('status', 'active').is('deleted_at', null),
        supabase.from('instructors').select('id, first_name, last_name').eq('status', 'active').is('deleted_at', null),
        supabase.from('vehicles').select('id, brand, model, license_plate').eq('status', 'active').is('deleted_at', null),
        supabase.from('class_types').select('id, name, duration_minutes')
    ]);

    return {
        students: students.data || [],
        instructors: instructors.data || [],
        vehicles: vehicles.data || [],
        classTypes: classTypes.data || []
    };
}

export async function updateAppointment(appointmentId: string, formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Get membership to check role
    const { data: membership } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (!membership) return { success: false, error: 'Sin membresía' };

    // --- INSTRUCTOR LOGIC ---
    if (membership.role === 'instructor') {
        const status = formData.get('status') as string;

        // Instructors can only update status
        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .select()
            .single();

        if (error) {
            console.error('Error updating appointment (instructor):', error);
            return { success: false, error: 'Error al actualizar el estado del turno' };
        }

        revalidatePath('/dashboard/classes');
        return { success: true, data };
    }

    // --- ADMIN/SECRETARY LOGIC ---
    const studentId = formData.get('student_id') as string;
    const instructorId = formData.get('instructor_id') as string;
    const vehicleId = formData.get('vehicle_id') as string;
    const classTypeId = formData.get('class_type_id') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('start_time') as string;
    const notes = formData.get('notes') as string;

    // Fetch class type duration
    const { data: classType } = await supabase
        .from('class_types')
        .select('duration_minutes')
        .eq('id', classTypeId)
        .single();

    if (!classType) return { success: false, error: 'Tipo de clase inválido' };

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes + classType.duration_minutes);
    const endTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

    // VALIDATE AVAILABILITY - Check for conflicts (excluding current appointment)
    const conflictCheck = await checkConflicts(
        supabase,
        date,
        startTime,
        endTime,
        instructorId,
        vehicleId,
        studentId,
        appointmentId // Exclude this appointment from conflict check
    );

    if (conflictCheck.hasConflict) {
        return { success: false, error: conflictCheck.error };
    }

    // Check for status change to refund credits
    // This must be done BEFORE the update to get the correct current status
    const { data: currentAppointment } = await supabase
        .from('appointments')
        .select('status, instructor_id')
        .eq('id', appointmentId)
        .single();

    const newStatus = formData.get('status') as string;

    if (currentAppointment && currentAppointment.status === 'scheduled' && (newStatus === 'rescheduled' || newStatus === 'cancelled')) {
        await refundCredits(supabase, appointmentId);
    }

    // If instructor changed, we might want to update the payment snapshot to the NEW instructor's price.
    // Or keep the old one? Usually if you change instructor, the new one gets paid THEIR rate.
    // Let's assume we update it.

    let paymentUpdate = {};
    if (currentAppointment && currentAppointment.instructor_id !== instructorId) {
        const { data: newInstructor } = await supabase
            .from('instructors')
            .select('price_per_class')
            .eq('id', instructorId)
            .single();

        if (newInstructor) {
            paymentUpdate = { instructor_payment_amount: newInstructor.price_per_class };
        }
    }

    const { data, error } = await supabase
        .from('appointments')
        .update({
            student_id: studentId,
            instructor_id: instructorId,
            vehicle_id: vehicleId,
            class_type_id: classTypeId,
            scheduled_date: date,
            start_time: startTime,
            end_time: endTime,
            status: newStatus,
            notes: notes || null,
            ...paymentUpdate // Merging payment update if applicable
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: 'Error al actualizar el turno' };
    }

    revalidatePath('/dashboard/classes');
    return { success: true, data };
}


export async function cancelAppointment(appointmentId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Link user to role/person
    const { data: membership } = await supabase.from('memberships').select('role').eq('user_id', user.id).single();
    if (!membership) return { success: false, error: 'Sin membresía' };

    // Get appointment
    const { data: appointment } = await supabase.from('appointments').select('*').eq('id', appointmentId).single();
    if (!appointment) return { success: false, error: 'Turno no encontrado' };

    // Authorization Check
    if (membership.role === 'student') {
        const { data: student } = await supabase.from('students').select('id').eq('user_id', user.id).single();
        if (!student || student.id !== appointment.student_id) {
            return { success: false, error: 'No tienes permiso para cancelar este turno' };
        }
    }
    // Instructors/Admins can cancel mostly any (logic simplified for now)

    // REFUND LOGIC: If appointment was scheduled, refund credits
    if (appointment.status === 'scheduled') {
        await refundCredits(supabase, appointmentId);
    }

    const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) {
        console.error('Error cancelling appointment:', error);
        return { success: false, error: 'Error al cancelar el turno' };
    }

    revalidatePath('/dashboard/classes');
    return { success: true, data };
}


export async function updateAppointmentStatus(appointmentId: string, status: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Get membership
    const { data: membership } = await supabase.from('memberships').select('role').eq('user_id', user.id).single();
    if (!membership) return { success: false, error: 'Sin membresía' };

    // Get current appointment to check for refund necessity
    const { data: currentAppointment } = await supabase
        .from('appointments')
        .select('status, student_id, instructor_id')
        .eq('id', appointmentId)
        .single();

    if (!currentAppointment) return { success: false, error: 'Turno no encontrado' };

    // REFUND LOGIC: If appointment was scheduled and is being cancelled/rescheduled
    if (currentAppointment.status === 'scheduled' && (status === 'rescheduled' || status === 'cancelled')) {
        await refundCredits(supabase, appointmentId);
    }

    const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) {
        console.error('Error updating appointment status:', error);
        return { success: false, error: 'Error al actualizar el estado' };
    }

    revalidatePath('/dashboard/classes');
    return { success: true, data };
}

export async function searchClasses(query: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    if (!query || query.length < 2) return { success: true, data: [] };

    // Search for students matching the query
    // We use !inner to ensure we only get appointments for matching students
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            id,
            scheduled_date,
            start_time,
            class_number,
            student:students!inner(first_name, last_name)
        `)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`, { foreignTable: 'students' })
        // Removed date filter to include history
        .order('scheduled_date', { ascending: false }) // Newest (Future) to Oldest
        .limit(10);

    if (error) {
        console.error('Error searching classes:', error);
        return { success: false, error: 'Error al buscar clases' };
    }

    return { success: true, data: appointments };
}
