"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    LogOut,
    ShieldAlert,
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const links = [
        {
            href: "/admin",
            label: "Dashboard Global",
            icon: LayoutDashboard,
        },
        {
            href: "/admin/schools",
            label: "Autoescuelas",
            icon: Building2,
        },
        {
            href: "/admin/settings",
            label: "Configuración",
            icon: Settings,
        },
    ];

    return (
        <div className="hidden border-r border-slate-800 bg-slate-950 text-slate-100 lg:flex lg:w-64 flex-col h-full shadow-xl">
            <div className="flex h-16 items-center border-b border-slate-800/80 px-6 font-bold tracking-tight bg-slate-900/50">
                <div className="flex items-center justify-center p-1.5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 mr-3 shadow-sm shadow-indigo-500/20">
                    <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Super Admin</span>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all group relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-slate-800/80 shadow-sm border border-slate-700/50"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                                )}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-md"></div>
                                )}
                                <Icon className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-indigo-400" : "group-hover:text-slate-300")} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-900/30">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all rounded-md"
                    onClick={handleLogout}
                >
                    <LogOut className="h-[18px] w-[18px]" />
                    <span className="font-medium">Cerrar Sesión</span>
                </Button>
            </div>
        </div>
    );
}
