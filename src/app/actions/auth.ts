'use server'

import { createClient } from '@/lib/supabase/server';

export async function getUserRole() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', user.id)
        .single();

    return data?.role || null;
}
