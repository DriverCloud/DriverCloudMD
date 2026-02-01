'use server';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminStats() {
    const supabase = await createClient();

    // 1. Count Schools
    const { count: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });

    if (schoolsError) {
        console.error('Error fetching schools count:', schoolsError);
    }

    // 2. Count Students (Global)
    const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

    if (studentsError) {
        console.error('Error fetching students count:', studentsError);
    }

    // 3. Estimate Revenue (Mock logic for now)
    return {
        schoolsCount: schoolsCount || 0,
        studentsCount: studentsCount || 0,
        mmm: 0 // Monthly Recurring Revenue
    };
}

export async function getSchoolsList() {
    const supabase = await createClient();

    // Ideally we would join, but for now simple query is safer to avoid type issues until we verify relation names
    const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching schools:', error);
        return [];
    }

    return data;
}

export async function createSchool(data: {
    schoolName: string;
    ownerName: string;
    ownerEmail: string;
    planType: string;
}) {
    const supabaseAdmin = createAdminClient();
    let tempPassword = "";
    let userId = "";

    // 1. Check if user exists or create new one
    // We try to find the user first to avoid "already registered" error error in logs if possible, 
    // but the most robust way with Admin API is just to try creating, or listing.

    // Attempt creation with explicit random password
    tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.ownerEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            full_name: data.ownerName,
        }
    });

    if (createError) {
        if (createError.message.includes("already registered") || createError.status === 422) {
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
            const found = users.find(u => u.email === data.ownerEmail);
            if (found) {
                userId = found.id;
                tempPassword = "(Usuario ya existía)";
            } else {
                return { success: false, message: "Error: El usuario existe pero no pude obtener su ID." };
            }
        } else {
            console.error("Error creating user:", createError);
            return { success: false, message: `Error creando usuario: ${createError.message}` };
        }
    } else {
        userId = newUser.user.id;
    }

    // 2. Create School
    const { data: school, error: schoolError } = await supabaseAdmin
        .from('schools')
        .insert({
            name: data.schoolName,
            plan_type: data.planType,
            status: 'active',
            owner_id: userId
        })
        .select()
        .single();

    if (schoolError) {
        console.error("Error creating school:", schoolError);
        return { success: false, message: `Error creando escuela: ${schoolError.message}` };
    }

    // 3. Link Membership (Owner Role)
    const { error: memberError } = await supabaseAdmin
        .from('memberships')
        .insert({
            user_id: userId,
            school_id: school.id,
            role: 'owner',
            owner_id: userId
        });

    if (memberError) {
        console.error("Error linking membership:", memberError);
        return { success: false, message: `Escuela creada, pero error en membresía: ${memberError.message}` };
    }

    return {
        success: true,
        message: "Escuela creada correctamente",
        tempPassword
    };
}
