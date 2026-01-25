import Link from "next/link";
import { User, LogOut, BookOpen, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-lg text-emerald-600">
                    <BookOpen className="h-6 w-6" />
                    <span>Mi Autoescuela</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                        <Link href="/login">
                            <LogOut className="mr-2 h-4 w-4" /> Salir
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container max-w-3xl py-8 mx-auto">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 z-30 w-full bg-background border-t h-16 flex items-center justify-around md:hidden">
                <Link href="/student" className="flex flex-col items-center gap-1 text-xs font-medium text-emerald-600">
                    <BookOpen className="h-5 w-5" />
                    <span>Mis Clases</span>
                </Link>
                {/* Future: Finances */}
                <span className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground opacity-50">
                    <CreditCard className="h-5 w-5" />
                    <span>Pagos</span>
                </span>
                <Link href="/login" className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground">
                    <LogOut className="h-5 w-5" />
                    <span>Salir</span>
                </Link>
            </nav>
        </div>
    );
}
