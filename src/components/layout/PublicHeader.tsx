import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md supports-[backdrop-filter]:bg-white/5">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                        DriverCloudMD
                    </span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="#features" className="hover:text-foreground transition-colors">
                        Características
                    </Link>
                    <Link href="#pricing" className="hover:text-foreground transition-colors">
                        Precios
                    </Link>
                    <Link href="#testimonials" className="hover:text-foreground transition-colors">
                        Testimonios
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="hover:bg-blue-50 hover:text-blue-600">
                            Iniciar Sesión
                        </Button>
                    </Link>
                    <Link href="/register" className="hidden sm:block">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                            Registrarse
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
