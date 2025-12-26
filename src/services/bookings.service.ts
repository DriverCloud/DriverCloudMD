import { createClient } from "@/lib/supabase/client";
import { generateDailySlots, TimeSlot } from "@/features/scheduling/utils/slots";

export interface Booking {
    id: string;
    student_id: string;
    appointment_id: string;
    status: 'confirmed' | 'cancelled';
}

export const bookingsService = {
    async getAvailability(date: Date, instructorId?: string): Promise<TimeSlot[]> {
        const supabase = createClient();

        // 1. Generate base slots for the day
        const allSlots = generateDailySlots(8, 20, 60);

        // 2. Fetch existing appointments for that day
        // Assuming 'appointments' table stores the schedule
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        let query = supabase
            .from('appointments') // Table name inferred from appointment_enrollments
            .select('*')
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString());

        if (instructorId) {
            query = query.eq('instructor_id', instructorId);
        }

        const { data: appointments, error } = await query;

        if (error) {
            console.error("Error fetching appointments:", error);
            // Return empty or base slots depending on error handling strategy. 
            // For now, returning all slots but marking unavailable?
            return allSlots;
        }

        // 3. Mark slots as unavailable if they overlap with existing appointments
        // Mapping simple logic: if an appointment starts at X, slot X is taken.
        const bookedStartTimes = new Set(appointments?.map(app =>
            new Date(app.start_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        ));

        return allSlots.map(slot => ({
            ...slot,
            available: !bookedStartTimes.has(slot.startTime)
        }));
    },

    async createBooking(studentId: string, appointmentId: string) {
        const supabase = createClient();

        // Using the known table 'appointment_enrollments'
        const { data, error } = await supabase
            .from('appointment_enrollments')
            .insert({
                student_id: studentId,
                appointment_id: appointmentId,
                enrolled_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
