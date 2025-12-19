import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SessionRefresh } from "@/components/auth/SessionRefresh";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userRole = null;

    if (user) {
        // Fetch membership role
        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .single();

        userRole = membership?.role;
    }

    return (
        <div className="flex min-h-screen bg-muted/40">
            <SessionRefresh />
            <Sidebar role={userRole} />
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

