"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
                {/* Breadcrumbs placeholder - in a real app this would be dynamic */}
                <div className="hidden md:flex items-center text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Dashboard</span>
                    <span className="mx-2">/</span>
                    <span>Inicio</span>
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar estudiante..."
                            className="w-[200px] pl-8 md:w-[300px]"
                        />
                    </div>
                    <Button size="icon" variant="ghost" className="relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-white"></span>
                        <span className="sr-only">Notificaciones</span>
                    </Button>
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium text-sm">
                        JD
                    </div>
                </div>
            </div>
        </div>
    )
}
