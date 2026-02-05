import { Quote } from "lucide-react";

const testimonials = [
    {
        quote:
            "DriverCloudMD transformó la administración de mi autoescuela. Ahora tengo control total sobre los pagos y las clases.",
        author: "Carlos Rodriguez",
        role: "Director, Autoescuela San Martín",
    },
    {
        quote:
            "La agenda inteligente es una maravilla. Hemos reducido los conflictos de horarios a cero desde que empezamos a usarla.",
        author: "Ana Martinez",
        role: "Coordinadora, Manejo Seguro",
    },
    {
        quote:
            "A mis alumnos les encanta poder ver su progreso online. Es una gran ventaja competitiva para nosotros.",
        author: "Luis Gonzalez",
        role: "Instructor Jefe, Vía Rápida",
    },
];

export function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
            <div className="container relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Confían en nosotros
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Descubre lo que dicen directores e instructores sobre DriverCloudMD.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-secondary/10 p-8 rounded-2xl border border-border/50 relative"
                        >
                            <Quote className="h-8 w-8 text-blue-500/20 absolute top-6 left-6" />
                            <p className="tex-lg italic text-muted-foreground mb-6 relative z-10">
                                "{testimonial.quote}"
                            </p>
                            <div>
                                <p className="font-semibold text-foreground">{testimonial.author}</p>
                                <p className="text-sm text-blue-500">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
