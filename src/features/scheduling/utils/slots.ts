import { addMinutes, format, parse, startOfDay } from "date-fns";

export interface TimeSlot {
    id: string;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    available: boolean;
}

/**
 * Generates time slots for a given day within specified working hours.
 * @param startHour Opening hour (e.g., 8 for 8:00 AM)
 * @param endHour Closing hour (e.g., 20 for 8:00 PM)
 * @param durationMinutes Length of each slot (default 60)
 * @returns Array of TimeSlot
 */
export function generateDailySlots(
    startHour: number = 8,
    endHour: number = 20,
    durationMinutes: number = 60
): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const baseDate = startOfDay(new Date()); // Date doesn't matter for just generating HH:mm strings

    let currentTime = addMinutes(baseDate, startHour * 60);
    const endTime = addMinutes(baseDate, endHour * 60);

    while (currentTime < endTime) {
        const nextTime = addMinutes(currentTime, durationMinutes);
        if (nextTime > endTime) break;

        const startStr = format(currentTime, "HH:mm");
        const endStr = format(nextTime, "HH:mm");

        slots.push({
            id: `${startStr}-${endStr}`,
            startTime: startStr,
            endTime: endStr,
            available: true, // Default to true, will be filtered later
        });

        currentTime = nextTime;
    }

    return slots;
}
