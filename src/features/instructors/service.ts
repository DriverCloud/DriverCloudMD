import { createClient } from "@/lib/supabase/client";

export interface Instructor {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    cuil?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    license_number: string;
    license_expiry?: string;
    status: 'active' | 'inactive';
}

export const instructorsService = {
    async getInstructors(): Promise<Instructor[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('instructors')
            .select('*')
            .eq('status', 'active');

        if (error) {
            console.error("Error fetching instructors:", error);
            throw error;
        }

        return data.map((i: any) => ({
            id: i.id,
            first_name: i.first_name,
            last_name: i.last_name,
            email: i.email,
            phone: i.phone,
            birth_date: i.birth_date,
            cuil: i.cuil,
            address: i.address,
            emergency_contact_name: i.emergency_contact_name,
            emergency_contact_phone: i.emergency_contact_phone,
            license_number: i.license_number,
            license_expiry: i.license_expiry,
            status: i.status || 'active',
        }));
    },

    async createInstructor(instructor: Omit<Instructor, "id" | "status">) {
        const supabase = createClient();

        // 1. Get current user's school_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data: membership } = await supabase
            .from('memberships')
            .select('school_id, owner_id')
            .eq('user_id', user.id)
            .single();

        if (!membership) throw new Error("Membership not found");

        // 2. Insert instructor linked to school
        const { data, error } = await supabase
            .from('instructors')
            .insert({
                first_name: instructor.first_name,
                last_name: instructor.last_name,
                email: instructor.email,
                phone: instructor.phone,
                birth_date: instructor.birth_date,
                cuil: instructor.cuil,
                address: instructor.address,
                emergency_contact_name: instructor.emergency_contact_name,
                emergency_contact_phone: instructor.emergency_contact_phone,
                license_number: instructor.license_number,
                license_expiry: instructor.license_expiry,
                school_id: membership.school_id,
                owner_id: membership.owner_id,
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
