import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Calendar, CreditCard, Car } from "lucide-react";

export function HeroSection() {
    return (
        <div className="relative overflow-hidden bg-background">
            {/* Background Gradients */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>

            <div className="container relative z-10 pt-20 pb-32 md:pt-32 md:pb-40">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div className="flex flex-col items-start text-left space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            v2.0 Disponible
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
                            Gestión Integral para <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                Escuelas de Manejo
                            </span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                            DriverCloudMD unifica estudiantes, instructores y vehículos en una sola plataforma.
                            Automatiza tu administración y escala tu negocio.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-blue-500/20">
                                    Comenzar Ahora
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                                Ver Demo
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Sin Tarjeta</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>14 días gratis</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Visual (CSS Glassmorphism) */}
                    <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none lg:h-[500px] flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-200">
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-cyan-400/20 rounded-full blur-[80px] translate-x-10 -translate-y-10" />

                        {/* Main Glass Card */}
                        <div className="relative w-full h-auto aspect-video lg:aspect-square bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                            {/* Inner Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="h-2 w-20 bg-muted/50 rounded-full" />
                            </div>

                            {/* Dashboard Mock Content */}
                            <div className="grid grid-cols-2 gap-4 h-full">
                                {/* Chart Area */}
                                <div className="col-span-2 h-32 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 flex items-end justify-between gap-2 border border-blue-200/50 dark:border-blue-700/30">
                                    {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                                        <div key={i} className="w-full bg-blue-500/80 rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>

                                {/* Mini Cards */}
                                <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 flex flex-col justify-center items-center gap-2 border border-white/20">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div className="text-xs font-medium">Clases Hoy</div>
                                    <div className="text-xl font-bold">12</div>
                                </div>

                                <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 flex flex-col justify-center items-center gap-2 border border-white/20">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div className="text-xs font-medium">Ingresos</div>
                                    <div className="text-xl font-bold">$4.2k</div>
                                </div>
                            </div>

                            {/* Floating Element 1 */}
                            <div className="absolute top-20 -right-6 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl flex items-center gap-3 border border-border animate-bounce duration-[3000ms]">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Car className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold">Nueva Reserva</div>
                                    <div className="text-[10px] text-muted-foreground">Hace 2m</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                <div
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>
        </div>
    );
}
