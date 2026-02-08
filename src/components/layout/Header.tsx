import { Bell, Search, LogOut, User, Settings } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { getNotifications } from "@/components/notifications/actions";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DashboardBreadcrumb } from "./DashboardBreadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
    const notifications = await getNotifications();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get user initials for fallback
    const email = user?.email || "U";
    const initials = email.substring(0, 2).toUpperCase();

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-background border-b border-border shrink-0 z-50">
            {/* Left: Breadcrumbs */}
            <DashboardBreadcrumb />

            {/* Center: Search */}
            <div className="flex-1 max-w-xl px-4 md:px-12">
                <SearchBar />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <NotificationBell notifications={notifications} />

                {/* User Menu Trigger */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-full cursor-pointer">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYophnEVpdLVr7ulXgwr65uXuBcaETherZcs__Sy0LTkuKGdFcJ45V1Fpx-1lCX0sLdmrF3O4NbOOSpAuYZwjCiY3351MS-IdjpqFmmaxYd2jt13eXxEohDZ0XY3Z6hmLaLyWPAqa4VO3D_M6xR9WF2N-lqQ22Wk97t61YOAiWBSmMjVQ49V97CRRNuUVFfd-KJL0_iBorSaWRycSs-PDb9RArPgEvrA8MjC7Usx-LJGVvKtZJXRQnQeJtHevSnCkRnnAcxAv--OjB" alt="User" />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Configuración</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <form action="/auth/signout" method="post">
                            <button type="submit" className="flex w-full items-center">
                                <DropdownMenuItem className="w-full cursor-pointer text-red-600 focus:text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Cerrar sesión</span>
                                </DropdownMenuItem>
                            </button>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

