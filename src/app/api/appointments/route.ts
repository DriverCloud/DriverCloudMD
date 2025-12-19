import { NextRequest, NextResponse } from 'next/server';
import { getAppointments } from '@/app/(auth)/dashboard/classes/actions';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start') || '';
    const end = searchParams.get('end') || '';
    const studentId = searchParams.get('student_id') || undefined;

    const result = await getAppointments(start, end, studentId);

    if (result.success) {
        return NextResponse.json({ data: result.data });
    } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }
}
