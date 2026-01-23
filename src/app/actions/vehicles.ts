'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserRole } from './auth';

export async function deleteVehicleDocument(documentId: string, vehicleId: string) {
    try {
        const supabase = await createClient();
        const role = await getUserRole();
        if (role !== 'admin' && role !== 'director' && role !== 'owner') {
            return { error: 'No autorizado para realizar esta acción' };
        }

        const { error } = await supabase
            .from('vehicle_documents')
            .delete()
            .eq('id', documentId);

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
