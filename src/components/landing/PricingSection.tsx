import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
    {
        name: "Básico",
        price: "$29",
        description: "Para escuelas pequeñas que inician su digitalización.",
        features: [
            "Hasta 50 estudiantes activos",
            "Agenda básica",
            "Gestión de pagos simple",
            "Soporte por email",
        ],
        cta: "Comenzar Gratis",
        mostPopular: false,
    },
    {
        name: "Pro",
        price: "$79",
        description: "La opción favorita para escuelas en crecimiento.",
        features: [
            "Estudiantes ilimitados",
            "Agenda con recordatorios WhatsApp",
            "Portal de estudiantes",
            "Reportes financieros",
            "Soporte prioritario",
        ],
        cta: "Prueba de 14 días",
        mostPopular: true,
    },
    {
        name: "Enterprise",
        price: "Consultar",
        description: "Soluciones a medida para grandes academias o franquicias.",
        features: [
            "Múltiples sucursales",
            "API personalizada",
            "Gestor de cuenta dedicado",
            "SLA de disponibilidad",
            "Capacitación presencial",
        ],
        cta: "Contactar Ventas",
        mostPopular: false,
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-secondary/20 relative">
            <div className="container relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Planes simples y transparentes
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Elige el plan que mejor se adapte al tamaño de tu flota y número de alumnos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative flex flex-col p-8 rounded-3xl border ${tier.mostPopular
                                    ? "bg-background border-blue-500 shadow-2xl shadow-blue-500/20 scale-105 z-10"
                                    : "bg-background/50 border-border opacity-90 hover:opacity-100 transition-opacity"
                                }`}
                        >
                            {tier.mostPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                    Más Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    {tier.price !== "Consultar" && <span className="text-muted-foreground">/mes</span>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                                    {tier.description}
                                </p>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <Check className={`h-5 w-5 shrink-0 ${tier.mostPopular ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={tier.mostPopular ? "default" : "outline"}
                                className={`w-full ${tier.mostPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                            >
                                {tier.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
