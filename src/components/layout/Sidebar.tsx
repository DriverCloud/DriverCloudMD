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
    BarChart3, // Reportes
    Settings, // Configuracion
    LogOut,
    TrendingUp, // Progreso
    CreditCard // Pagos
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
                href: "/dashboard/classes",
                icon: Calendar,
            },
        ],
    },
    {
        title: "Recursos",
        items: [
            {
                title: "Estudiantes",
                href: "/dashboard/students",
                icon: GraduationCap,
            },
            {
                title: "Instructores",
                href: "/dashboard/instructors",
                icon: Users,
            },
            {
                title: "Vehículos",
                href: "/dashboard/vehicles",
                icon: Car,
            },
        ],
    },
    {
        title: "Administración",
        items: [
            {
                title: "Finanzas",
                href: "/dashboard/finance",
                icon: DollarSign,
            },
            {
                title: "Reportes",
                href: "/dashboard/reports",
                icon: BarChart3,
            },
            {
                title: "Configuración",
                href: "/dashboard/settings",
                icon: Settings,
            },
        ],
    },
];



interface SidebarProps {
    role?: string | null;
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    // Define restricted view: Instructors only see simplified menu
    // We filter the GROUPS and ITEMS
    const filteredGroups = menuGroups.map(group => {
        if (role === 'instructor') {
            // Instructor Filter Logic
            if (group.title === "Administración") {
                const allowedAdminItems = ['Configuración'];
                const newItems = group.items.filter(i => allowedAdminItems.includes(i.title));
                if (newItems.length === 0) return null;
                return { ...group, items: newItems };
            }
            if (group.title === "Principal") {
                return group;
            }
            if (group.title === "Recursos") {
                const allowedResourceItems = ['Estudiantes', 'Instructores'];
                const newItems = group.items.filter(i => allowedResourceItems.includes(i.title));
                if (newItems.length === 0) return null;
                return { ...group, items: newItems };
            }
            return group;
        }

        if (role === 'student') {
            // Student Filter Logic
            if (group.title === "Principal") {
                // Return generic items but with mapped URLs/Icons if needed? 
                // Or construct a specific Student Group?
                // It's cleaner to return a custom group or filter existing ones if they match.
                // Our current nav structure is Admin-centric.
                // Let's create a custom list for students by overriding the items.

                // If we want "Mis Clases", we can map to /dashboard/classes (which we will adapt view for)
                return {
                    title: "Mi Aprendizaje",
                    items: [
                        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
                        { title: "Mis Clases", href: "/dashboard/classes", icon: Calendar },
                        { title: "Mi Progreso", href: "/dashboard/progress", icon: TrendingUp },
                    ]
                };
            }
            if (group.title === "Administración") {
                // Students see Payments/Profile
                return {
                    title: "Mi Cuenta",
                    items: [
                        { title: "Pagos", href: "/dashboard/payments", icon: CreditCard },
                        { title: "Configuración", href: "/dashboard/settings", icon: Settings },
                    ]
                };
            }
            // Hide Resources
            return null;
        }

        // Default (Admin/Owner/Secretary): Show everything
        return group;
    }).filter(group => group !== null);


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
                {filteredGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {group!.title}
                        </h3>
                        <div className="flex flex-col gap-1">
                            {group!.items.map((item, itemIndex) => {
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
                        <p className="text-sm font-semibold text-foreground truncate">Usuario</p>
                        <p className="text-xs text-muted-foreground truncate capitalize">{role || 'Cargando...'}</p>
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

