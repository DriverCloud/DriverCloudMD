"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    GraduationCap, // Estudiantes
    Users, // Instructores
    Car, // Vehiculos
    DollarSign, // Finanzas
    Settings, // Configuracion
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuGroups = [
    {
        title: "Principal",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Clases",
                href: "/classes",
                icon: Calendar,
            },
        ],
    },
    {
        title: "Recursos",
        items: [
            {
                title: "Estudiantes",
                href: "/students",
                icon: GraduationCap,
            },
            {
                title: "Instructores",
                href: "/instructors",
                icon: Users,
            },
            {
                title: "Vehículos",
                href: "/vehicles",
                icon: Car,
            },
        ],
    },
    {
        title: "Administración",
        items: [
            {
                title: "Finanzas",
                href: "/finance",
                icon: DollarSign,
            },
            {
                title: "Configuración",
                href: "/settings",
                icon: Settings,
            },
        ],
    }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex flex-col w-72 h-full bg-background border-r border-border flex-shrink-0 transition-all duration-300">
            {/* Logo Area */}
            <div className="flex items-center gap-3 px-6 h-16 border-b border-border/50">
                <div className="flex items-center justify-center h-8 w-8 bg-primary rounded-lg text-primary-foreground">
                    <Car className="h-5 w-5" />
                </div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">DriverCloudMD</h1>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {group.title}
                        </h3>
                        <div className="flex flex-col gap-1">
                            {group.items.map((item, itemIndex) => {
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                return (
                                    <Link
                                        key={itemIndex}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                        <span className="text-sm">{item.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer: User & Logout */}
            <div className="border-t border-border p-4">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 mb-2">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 flex-shrink-0"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB4dmGbXMOsUvYf4_qY56FnlnpxBQQdLSD2L8rTOizctCsJ6lCyxsWD9osnC3zbIz2JGciSpFABvemOVUQ7guCCck4dZ-b2VB9D4VZRDKmSl58UF97y2j9W9YMGt7dAYpPcJ4PAStEzTTcyjC2wZRDbbjUL1AvjsZWuMUMJCos9xZ7S_FRQ2vRspedwgcWWhm5e36IoOOfFR1wNrk747oQ40WOPRRQVGGcqkPrSXO6AaJFhU7kIjtsPXJUiVw_Zu6UctmAs_As7QDum")' }}
                    />
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-semibold text-foreground truncate">Roberto G.</p>
                        <p className="text-xs text-muted-foreground truncate">Administrador</p>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        const { createClient } = await import("@/lib/supabase/client");
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.href = "/login";
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors text-sm font-medium"
                >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
