import { useState, useEffect } from "react";
import { bookingsService } from "@/services/bookings.service";
import { TimeSlot } from "@/features/scheduling/utils/slots";

export function useAvailability(date: Date | undefined, instructorId?: string) {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!date) {
            setSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoading(true);
            setError(null);
            try {
                const availableSlots = await bookingsService.getAvailability(date, instructorId);
                setSlots(availableSlots);
            } catch (err) {
                console.error(err);
                setError("Failed to load availability");
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [date, instructorId]);

    return { slots, loading, error };
}
