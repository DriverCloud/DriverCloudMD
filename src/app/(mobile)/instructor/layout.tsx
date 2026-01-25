import Link from "next/link";
import { Car, CheckSquare, Home, LogOut } from "lucide-react";

export default function MobileInstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Mobile Header */}
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
                <Link className="flex items-center gap-2 font-semibold" href="/instructor">
                    <Car className="h-6 w-6 text-emerald-600" />
                    <span className="">DriverCloud Instructor</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-20">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 z-10 w-full bg-background border-t h-16 flex items-center justify-around lg:hidden">
                <Link href="/instructor" className="flex flex-col items-center gap-1 text-sm font-medium text-emerald-600">
                    <Home className="h-5 w-5" />
                    <span>Inicio</span>
                </Link>
                {/* Future: Service/Checklist */}
                <span className="flex flex-col items-center gap-1 text-sm font-medium text-muted-foreground opacity-50">
                    <CheckSquare className="h-5 w-5" />
                    <span>Reportes</span>
                </span>
                <Link href="/login" className="flex flex-col items-center gap-1 text-sm font-medium text-muted-foreground">
                    <LogOut className="h-5 w-5" />
                    <span>Salir</span>
                </Link>
            </nav>

            {/* Desktop Message (Hidden on mobile) */}
            <div className="hidden lg:flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Vista Móvil</h2>
                    <p className="text-slate-600">Esta sección está diseñada para ser accedida desde dispositivos móviles por los instructores.</p>
                </div>
            </div>
        </div>
    );
}
