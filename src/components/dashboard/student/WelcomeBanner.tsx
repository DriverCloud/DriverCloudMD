import { Card, CardContent } from "@/components/ui/card";
import { Hand } from "lucide-react";

interface WelcomeBannerProps {
    name: string;
}

export function WelcomeBanner({ name }: WelcomeBannerProps) {
    return (
        <div className="bg-primary/10 text-primary border border-primary/20 rounded-xl p-6 flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
                <Hand className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">¡Hola, {name}!</h2>
                <p className="text-muted-foreground mt-1">
                    Bienvenido a tu portal. Aquí puedes gestionar tus clases y ver tu progreso.
                </p>
            </div>
        </div>
    );
}
