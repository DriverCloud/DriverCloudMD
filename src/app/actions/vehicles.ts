'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserRole } from './auth';

export async function deleteVehicleDocument(documentId: string, vehicleId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'No autenticado' };

        // 1. Obtener membresía y rol
        const { data: membership } = await supabase.from('memberships').select('school_id, role').eq('user_id', user.id).single();
        if (!membership || !['admin', 'director', 'owner'].includes(membership.role)) {
            return { error: 'No autorizado para realizar esta acción' };
        }

        // 2. Verificar que el vehículo pertenezca a la escuela
        const { data: vehicle } = await supabase.from('vehicles').select('id').eq('id', vehicleId).eq('school_id', membership.school_id).single();
        if (!vehicle) return { error: 'Vehículo no encontrado o sin permisos' };

        // 3. Eliminar el documento asegurando el origin vehicle_id
        const { error } = await supabase
            .from('vehicle_documents')
            .delete()
            .eq('id', documentId)
            .eq('vehicle_id', vehicleId);

        if (error) {
            console.error('Error deleting document:', error);
            return { error: 'Error al eliminar el documento' };
        }

        revalidatePath(`/dashboard/vehicles/${vehicleId}`);
        return { success: true };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { error: 'Ocurrió un error inesperado' };
    }
}
