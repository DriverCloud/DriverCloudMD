import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        🚗 DriverCloudMD
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link href="/login">
                            <Button>Iniciar Sesión</Button>
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © 2025 DriverCloud. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
