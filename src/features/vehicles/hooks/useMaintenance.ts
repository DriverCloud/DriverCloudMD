import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface MaintenanceLog {
    id: string;
    vehicle_id: string;
    description: string;
    start_date: string;
    end_date?: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    cost?: number;
}

export function useVehicleMaintenance(vehicleId: string) {
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [loading, setLoading] = useState(false);

    const markUnderMaintenance = async (description: string, expectedEndDate?: string) => {
        setLoading(true);
        // Mock API call
        console.log(`Marking vehicle ${vehicleId} as under maintenance: ${description}`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Optimistic update
        const newLog: MaintenanceLog = {
            id: Math.random().toString(),
            vehicle_id: vehicleId,
            description,
            start_date: new Date().toISOString(),
            status: 'in_progress',
            end_date: expectedEndDate
        };
        setLogs(prev => [newLog, ...prev]);
        setLoading(false);
        return newLog;
    };

    const completeMaintenance = async (logId: string, cost: number) => {
        setLoading(true);
        console.log(`Completing maintenance ${logId} with cost ${cost}`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setLogs(prev => prev.map(log =>
            log.id === logId ? { ...log, status: 'completed', cost } : log
        ));
        setLoading(false);
    };

    return {
        logs,
        loading,
        markUnderMaintenance,
        completeMaintenance
    };
}
