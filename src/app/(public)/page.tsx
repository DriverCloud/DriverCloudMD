import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background text-foreground">
            <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
                <div className="flex max-w-[980px] flex-col items-start gap-2">
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                        Gestión Integral para Escuelas de Manejo <br className="hidden sm:inline" />
                        Simplifica tu administración.
                    </h1>
                    <p className="max-w-[700px] text-lg text-muted-foreground">
                        DriverCloudMD es la plataforma todo-en-uno que conecta estudiantes, instructores y administrativos. Agenda clases, gestiona pagos y monitorea tu flota en un solo lugar.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/login">
                        <Button size="lg">Comenzar Ahora</Button>
                    </Link>
                    <Button variant="outline" size="lg">
                        Ver Demo
                    </Button>
                </div>
            </section>
        </div>
    );
}
