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
        // Fetch user role
        // NOTE: In production, consider a more efficient way (e.g. metadata) to avoid DB hit on every request
        // But for this scale, it is acceptable.
        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .single();

        const role = membership?.role;
        const url = request.nextUrl.clone();

        // SCENARIO 1: Student trying to access Dashboard or Login
        if (role === 'student' && (path.startsWith('/dashboard') || path === '/login' || path === '/')) {
            url.pathname = '/portal' // Correct path for student portal
            return NextResponse.redirect(url)
        }

        // SCENARIO 2: Admin/Staff trying to access Portal or Login
        if ((role === 'admin' || role === 'director' || role === 'owner') && (path.startsWith('/portal') || path === '/login' || path === '/')) {
            // Allow viewing portal if explicitly needed? usually not. Keep separation strict for now.
            // Actually, admins might want to see portal? Let's restrict for now to avoid confusion.
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // SCENARIO 3: Accessing generic root '/'
        if (path === '/') {
            if (role === 'student') {
                url.pathname = '/portal'
                return NextResponse.redirect(url)
            } else {
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
