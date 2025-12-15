'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getAppointments(startDate: string, endDate: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            *,
            student:students(first_name, last_name),
            instructor:instructors(first_name, last_name),
            vehicle:vehicles(brand, model, license_plate),
            class_type:class_types(name, duration_minutes)
        `)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching appointments:', error);
        return { success: false, error: 'Error al cargar los turnos' };
    }

    return { success: true, data: appointments };
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
    // Calculate end time based on duration (simplified for now, ideally fetch class type duration)
    // For MVP, letting user pick start, assuming fixed duration or passed in.
    // Let's fetch duration from class_type

    const { data: classType } = await supabase
        .from('class_types')
        .select('duration_minutes')
        .eq('id', classTypeId)
        .single();

    if (!classType) return { success: false, error: 'Tipo de clase inválido' };

    // Simple time calculation (startTime is HH:MM)
    const [hours, minutes] = startTime.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes + classType.duration_minutes);
    const endTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

    // TODO: VALIDATE AVAILABILITY (Collision detection)

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

    revalidatePath('/classes');
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
