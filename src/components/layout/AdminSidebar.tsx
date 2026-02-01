"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    LogOut,
    ShieldAlert
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
    ];

    return (
        <div className="hidden border-r bg-slate-950 text-slate-100 lg:block lg:w-64 flex-col h-full">
            <div className="flex h-14 items-center border-b border-slate-800 px-6 font-bold tracking-tight">
                <ShieldAlert className="mr-2 h-5 w-5 text-red-500" />
                <span>Super Admin</span>
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
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-white",
                                    isActive
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}
