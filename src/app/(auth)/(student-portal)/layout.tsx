import { createClient } from "@/lib/supabase/server";
import { LogOut, Home, Calendar, History, User } from "lucide-react";
import Link from "next/link";

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Simplified Mobile-First Layout
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-20 md:pb-0">

            {/* Mobile/Desktop Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-6 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <span>DriverCloudMD</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden md:block">Estudiante</span>
                    {/* Avatar placeholder */}
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t bg-white">
                <div className="grid grid-cols-4 h-16">
                    <Link href="/portal" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-primary">
                        <Home className="h-6 w-6" />
                        <span className="text-xs">Inicio</span>
                    </Link>
                    <Link href="/portal/booking" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-primary">
                        <Calendar className="h-6 w-6" />
                        <span className="text-xs">Reservar</span>
                    </Link>
                    <Link href="/portal/history" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-primary">
                        <History className="h-6 w-6" />
                        <span className="text-xs">Historial</span>
                    </Link>
                    <Link href="/portal/profile" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-primary">
                        <User className="h-6 w-6" />
                        <span className="text-xs">Perfil</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
