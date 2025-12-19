'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getAppointments(startDate: string, endDate: string, studentId?: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    let query = supabase
        .from('appointments')
        .select(`
            *,
            student:students(first_name, last_name),
            instructor:instructors(first_name, last_name),
            vehicle:vehicles(brand, model, license_plate),
            class_type:class_types(name, duration_minutes)
        `)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

    // Optional Filter by Student
    if (studentId) {
        query = query.eq('student_id', studentId);
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
        created_by: user.id
    }).select().single();

    if (error) {
        console.error('Error creating appointment:', error);
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

    const studentId = formData.get('student_id') as string;
    const instructorId = formData.get('instructor_id') as string;
    const vehicleId = formData.get('vehicle_id') as string;
    const classTypeId = formData.get('class_type_id') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('start_time') as string;

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
            status: formData.get('status') as string,
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

