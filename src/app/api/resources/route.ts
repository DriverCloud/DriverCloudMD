import { NextResponse } from 'next/server';
import { getResources } from '@/app/(auth)/dashboard/classes/actions';

export async function GET() {
    const resources = await getResources();
    return NextResponse.json(resources);
}
