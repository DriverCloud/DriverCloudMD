import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            id, 
            status,
            created_at,
            class_evaluations (*)
        `)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message });

    return NextResponse.json({
        count: appointments?.length,
        data: appointments
    });
}
