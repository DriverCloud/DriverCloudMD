'use server'

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

import { ActionState } from "@/types";

export async function createStudent(formData: FormData): Promise<ActionState> {
    const supabase = await createClient();

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'No autenticado' };
    }

    // Get user's membership to determine school/owner
    const { data: membership } = await supabase
        .from('memberships')
        .select('school_id, owner_id, location_id')
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        return { success: false, error: 'No se encontró la membresía del usuario' };
    }

    const dni = (formData.get("dni") as string || "").trim();

    // Check if DNI already exists for an active student in this school
    if (dni) {
        const { data: existingStudent } = await supabase
            .from("students")
            .select("id")
            .eq("school_id", membership.school_id)
            .eq("dni", dni)
            .is("deleted_at", null)
            .maybeSingle();

        if (existingStudent) {
            return { success: false, error: 'Este DNI ya está registrado para otro estudiante activo' };
        }
    }

    const data = {
        school_id: membership.school_id,
        owner_id: membership.owner_id,
        location_id: membership.location_id,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        dni: dni,
        address: formData.get("address") as string,
        date_of_birth: formData.get("date_of_birth") ? new Date(formData.get("date_of_birth") as string).toISOString() : null,
        referral_source: formData.get("referral_source") as string,
        has_license: formData.get("has_license") === 'true',
        disability_observation: formData.get("disability_observation") as string,
        emergency_contact_name: formData.get("emergency_contact_name") as string,
        emergency_contact_phone: formData.get("emergency_contact_phone") as string,
        emergency_contact_relation: formData.get("emergency_contact_relation") as string,
        gender: formData.get("gender") as string,
        status: (formData.get("status") as string) || 'active',
    };

    const { data: newStudent, error } = await supabase.from("students").insert(data).select().single();

    if (error) {
        logger.error({ err: error, action: 'createStudent', userId: user.id }, 'Error al insertar nuevo estudiante en BD');
        return { success: false, error: error.message };
    }

    logger.info({ studentId: newStudent?.id, userId: user.id }, 'Estudiante creado exitosamente');
    revalidatePath("/dashboard/students");
    return { success: true, data: newStudent };
}

export async function updateStudent(id: string, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();

    // 1. OBTENER MEMBRESÍA ACTUAL
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };
    const { data: membership } = await supabase.from('memberships').select('school_id').eq('user_id', user.id).single();
    if (!membership) return { success: false, error: 'Membresía no encontrada' };

    const dni = (formData.get("dni") as string || "").trim();

    // Check if DNI already exists for another active student in this school
    if (dni) {
        const { data: existingStudent } = await supabase
            .from("students")
            .select("id")
            .eq("school_id", (await supabase.from('students').select('school_id').eq('id', id).single()).data?.school_id)
            .eq("dni", dni)
            .is("deleted_at", null)
            .neq("id", id)
            .maybeSingle();

        if (existingStudent) {
            return { success: false, error: 'Este DNI ya está registrado para otro estudiante activo' };
        }
    }

    const data = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        dni: dni,
        address: formData.get("address") as string,
        date_of_birth: formData.get("date_of_birth") ? new Date(formData.get("date_of_birth") as string).toISOString() : null,
        referral_source: formData.get("referral_source") as string,
        has_license: formData.get("has_license") === 'true',
        disability_observation: formData.get("disability_observation") as string,
        emergency_contact_name: formData.get("emergency_contact_name") as string,
        emergency_contact_phone: formData.get("emergency_contact_phone") as string,
        emergency_contact_relation: formData.get("emergency_contact_relation") as string,
        gender: formData.get("gender") as string,
        status: formData.get("status") as string,
    };

    const { error } = await supabase.from("students").update(data).eq("id", id).eq("school_id", membership.school_id);

    if (error) {
        logger.error({ err: error, action: 'updateStudent', studentId: id, userId: user.id }, 'Error al actualizar estudiante en BD');
        return { success: false, error: error.message };
    }

    logger.info({ studentId: id, userId: user.id }, 'Estudiante actualizado exitosamente');
    revalidatePath("/dashboard/students");
    return { success: true };
}

export async function createPackage(formData: FormData): Promise<ActionState> {
    const supabase = await createClient();

    // 1. OBTENER MEMBRESÍA ACTUAL
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };
    const { data: membership } = await supabase.from('memberships').select('school_id, owner_id').eq('user_id', user.id).single();
    if (!membership) return { success: false, error: 'Membresía no encontrada' };

    const student_id = formData.get("student_id") as string;
    const name = formData.get("name") as string;
    const credits = parseInt(formData.get("credits") as string);
    const price = parseFloat(formData.get("price") as string);
    const paymentMethod = formData.get("payment_method") as string || null;

    if (isNaN(credits) || credits < 0) {
        return { success: false, error: 'La cantidad de clases debe ser un número válido mayor o igual a cero' };
    }

    if (isNaN(price) || price < 0) {
        return { success: false, error: 'El precio debe ser un número válido mayor o igual a cero' };
    }

    // Call atomic RPC
    const { data, error } = await supabase.rpc('sell_student_package_transactional', {
        p_student_id: student_id,
        p_school_id: membership.school_id,
        p_owner_id: membership.owner_id,
        p_name: name,
        p_credits: credits,
        p_price: price,
        p_payment_method: paymentMethod,
        p_created_by: user.id
    });

    if (error) {
        logger.error({ err: error, action: 'createPackage', studentId: student_id, userId: user.id }, "RPC Error selling package");
        return { success: false, error: error.message };
    }

    logger.info({ studentId: student_id, userId: user.id, credits, price }, 'Paquete vendido y agendado exitosamente');
    revalidatePath("/dashboard/students");
    return { success: true };
}

export async function deleteStudent(id: string): Promise<ActionState> {
    const supabase = await createClient();

    // 1. OBTENER MEMBRESÍA ACTUAL
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };
    const { data: membership } = await supabase.from('memberships').select('school_id').eq('user_id', user.id).single();
    if (!membership) return { success: false, error: 'Membresía no encontrada' };

    const { error } = await supabase.from("students").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("school_id", membership.school_id);

    if (error) {
        logger.error({ err: error, action: 'deleteStudent', studentId: id, userId: user.id }, 'Error al marcar estudiante como eliminado');
        return { success: false, error: error.message };
    }

    logger.info({ studentId: id, userId: user.id }, 'Estudiante eliminado (soft-delete) exitosamente');
    revalidatePath("/dashboard/students");
    return { success: true };
}
