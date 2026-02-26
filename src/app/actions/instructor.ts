'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeClass(appointmentId: string, mileage: number, notes: string) {
    const supabase = await createClient();

    // 1. Get User for debugging
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        console.error("completeClass: No user found", userError);
        return { success: false, error: "User not authenticated" };
    }
    console.log(`completeClass: User ${user.id} attempting to complete appointment ${appointmentId}`);

    // 2. Fetch the appointment to get the vehicle_id
    const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('vehicle_id')
        .eq('id', appointmentId)
        .single();

    if (fetchError || !appointment?.vehicle_id) {
        return { success: false, error: "No se pudo encontrar la información del vehículo." };
    }

    // 3. Fetch the vehicle's current odometer
    const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('odometer')
        .eq('id', appointment.vehicle_id)
        .single();

    if (vehicleError) {
        return { success: false, error: "No se pudo verificar el kilometraje del vehículo." };
    }

    // 4. Validate mileage
    const currentOdometer = vehicle?.odometer ? Number(vehicle.odometer) : 0;
    if (mileage < currentOdometer) {
        return { success: false, error: `El kilometraje ingresado (${mileage.toLocaleString()} km) no puede ser menor al actual del vehículo (${currentOdometer.toLocaleString()} km).` };
    }

    // 5. Update Appointment
    const { error: appError } = await supabase
        .from('appointments')
        .update({
            status: 'completed',
            end_mileage: mileage,
            notes: notes
        })
        .eq('id', appointmentId);

    if (appError) {
        console.error("Error completing class:", appError);
        console.error("Violated Policy details:", appError.details);
        console.error("Violated Policy hint:", appError.hint);
        return { success: false, error: appError.message || "Unknown DB Error" };
    }

    // 2. We depend on the DB Trigger for vehicle mileage update.
    // However, as a fallback (if trigger migration failed), we can try to update vehicle manually here too?
    // No, let's trust the DB or user resolving the migration. 
    // BUT, if the user is stuck, we can do a manual vehicle update here using the SERVICE ROLE if we had it, 
    // but standard `createClient` uses user auth.

    // So if RLS is the issue, this action will ALSO fail unless RLS is fixed.
    // So the migration IS critical.

    revalidatePath('/instructor');
    revalidatePath(`/instructor/${appointmentId}`);
    return { success: true };
}
