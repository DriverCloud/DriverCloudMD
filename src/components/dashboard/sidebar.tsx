"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    BarChart3,
    Calendar,
    Car,
    CreditCard,
    LayoutDashboard,
    Settings,
    Users,
    GraduationCap,
    Command,
    LogOut
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn("pb-12 h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center px-4 mb-6">
                        <Command className="mr-2 h-6 w-6" />
                        <h2 className="text-lg font-semibold tracking-tight">DriverCloudMD</h2>
                    </div>

                    <div className="space-y-1">
                        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                            Principal
                        </h2>
                        <Button asChild variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start">
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                        <Button asChild variant={pathname === "/dashboard/calendar" ? "secondary" : "ghost"} className="w-full justify-start">
                            <Link href="/dashboard/calendar">
                                <Calendar className="mr-2 h-4 w-4" />
                                Calendario
                            </Link>
                        </Button>
                        <Button asChild variant={pathname === "/dashboard/classes" ? "secondary" : "ghost"} className="w-full justify-start">
                            <Link href="/dashboard/classes">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Clases
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                        Recursos
                    </h2>
                    <div className="space-y-1">
                        <Button asChild variant={pathname === "/dashboard/students" ? "secondary" : "ghost"} className="w-full justify-start">
                            <Link href="/dashboard/students">
                                <Users className="mr-2 h-4 w-4" />
                                Estudiantes
                            </Link>
                        </Button>
                        <Button asChild variant={pathname === "/dashboard/instructors" ? "secondary" : "ghost"} className="w-full justify-start">
                            <Link href="/dashboard/instructors">
                                <Users className="mr-2 h-4 w-4" />
                                Instructores
                            </Link>
                        </Button>
                        <Button asChild variant={pathname === "/dashboard/vehicles" ? "secondary" : "ghost"} className="w-full justify-start">
                            <Link href="/dashboard/vehicles">
                                <Car className="mr-2 h-4 w-4" />
                                Vehículos
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                        Administración
                    </h2>
                    <div className="space-y-1">
                        <Button asChild variant={pathname === "/dashboard/finance" ? "secondary" : "ghost"} className="w-full justify-start">
                            <Link href="/dashboard/finance">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Finanzas
                            </Link>
                        </Button>
                        <Button asChild variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"} className="w-full justify-start">
                            <Link href="/dashboard/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Configuración
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 w-full px-3">
                <div className="flex items-center gap-3 rounded-lg border p-3 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                        <span className="text-xs font-medium">JD</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium">Juan Dueño</span>
                        <span className="truncate text-xs text-muted-foreground">juan@autoescuela.com</span>
                    </div>
                    <Button size="icon" variant="ghost" className="ml-auto h-8 w-8">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
