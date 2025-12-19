"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function DashboardBreadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // Map segment names to readable labels if necessary
    const segmentLabels: Record<string, string> = {
        dashboard: "Dashboard",
        classes: "Clases",
        students: "Estudiantes",
        instructors: "Instructors",
        vehicles: "Vehículos",
        finance: "Finanzas",
        reports: "Reportes",
        settings: "Configuración",
    };

    return (
        <nav className="hidden md:flex items-center text-sm text-muted-foreground">
            <Link
                href="/dashboard"
                className="flex items-center hover:text-primary transition-colors"
                title="Ir al inicio"
            >
                <Home className="h-4 w-4" />
            </Link>

            {segments.map((segment, index) => {
                // Skip 'dashboard' in the list if it's the first segment (already handled by Home icon)
                // but if we are AT /dashboard, segments is just ['dashboard'].
                // If we are deep, e.g. /dashboard/students, segments are ['dashboard', 'students']

                if (segment === 'dashboard' && index === 0 && segments.length > 1) return null;

                const href = `/${segments.slice(0, index + 1).join('/')}`;
                const isLast = index === segments.length - 1;
                const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

                return (
                    <div key={href} className="flex items-center">
                        <ChevronRight className="h-4 w-4 mx-1 text-border" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-primary transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
