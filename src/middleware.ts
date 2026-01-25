import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Queries:
    // 1. Check if user is logged in
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected Routes Logic
    const path = request.nextUrl.pathname

    // If user is NOT logged in and tries to access protected routes
    if (!user && (path.startsWith('/dashboard') || path.startsWith('/portal'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user IS logged in
    if (user) {
        // 1. Check User Metadata first (faster, and used for students)
        let role = user.user_metadata?.role;

        // 2. If no metadata role, fallback to memberships (for legacy/admins)
        if (!role) {
            const { data: membership } = await supabase
                .from('memberships')
                .select('role')
                .eq('user_id', user.id)
                .single();
            role = membership?.role;
        }

        const url = request.nextUrl.clone();
        const path = request.nextUrl.pathname;

        // SCENARIO 1: Student trying to access Dashboard or Login
        // Note: Students live at /student
        if (role === 'student') {
            if (path.startsWith('/dashboard') || path === '/login' || path === '/') {
                url.pathname = '/student'
                return NextResponse.redirect(url)
            }
        }

        // SCENARIO 2: Instructor trying to access Dashboard (Should go to /instructor)
        if (role === 'instructor') {
            if (path.startsWith('/dashboard') || path === '/login' || path === '/') {
                url.pathname = '/instructor'
                return NextResponse.redirect(url)
            }
        }

        // SCENARIO 3: Admin/Staff trying to access Student/Instructor areas or Login
        if (['admin', 'director', 'owner', 'secretary'].includes(role)) {
            if (path === '/login' || path === '/') {
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
