import { Calendar, Users, Car, CreditCard, Bell, BarChart3 } from "lucide-react";

const features = [
    {
        name: "Agenda Inteligente",
        description: "Organiza clases prácticas y teóricas sin conflictos. Sincronización en tiempo real para instructores y alumnos.",
        icon: Calendar,
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        name: "Gestión de Estudiantes",
        description: "Expedientes completos, seguimiento de progreso y documentación digitalizada en un solo lugar.",
        icon: Users,
        gradient: "from-purple-500 to-pink-500",
    },
    {
        name: "Control de Flota",
        description: "Monitorea el estado de tus vehículos, mantenimientos preventivos y asignación por instructor.",
        icon: Car,
        gradient: "from-orange-500 to-red-500",
    },
    {
        name: "Pagos y Finanzas",
        description: "Registra pagos, genera recibos automáticos y visualiza el flujo de caja de tu escuela.",
        icon: CreditCard,
        gradient: "from-green-500 to-emerald-500",
    },
    {
        name: "Notificaciones Automáticas",
        description: "Recordatorios de clases y pagos por WhatsApp y Email para reducir el ausentismo.",
        icon: Bell,
        gradient: "from-yellow-500 to-orange-500",
    },
    {
        name: "Reportes Avanzados",
        description: "Toma decisiones basadas en datos. Analiza el rendimiento de instructores y la rentabilidad.",
        icon: BarChart3,
        gradient: "from-indigo-500 to-blue-500",
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-background relative overflow-hidden">
            <div className="container relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Todo lo que necesitas para tu <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                            Escuela de Manejo
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Herramientas potentes diseñadas específicamente para modernizar y optimizar la gestión educativa vial.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.name}
                            className="group relative p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300 overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 text-white mb-6 shadow-lg`}>
                                <feature.icon className="h-6 w-6" />
                            </div>

                            <h3 className="text-xl font-semibold mb-3">{feature.name}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
