"use client";

import { Bell, Search } from "lucide-react";

export function Header() {
    return (
        <header className="flex items-center justify-between h-16 px-6 bg-background border-b border-border shrink-0 z-10">
            {/* Left: Breadcrumbs */}
            <div className="hidden md:flex items-center text-sm">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Principal</a>
                <span className="mx-2 text-border">/</span>
                <span className="font-medium text-foreground">Dashboard</span>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl px-4 md:px-12">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background sm:text-sm transition-all"
                        placeholder="Buscar estudiante..."
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
                </button>

                {/* User Menu Trigger (Avatar only for simplicity in this layout) */}
                <button className="relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-9 w-9"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAYophnEVpdLVr7ulXgwr65uXuBcaETherZcs__Sy0LTkuKGdFcJ45V1Fpx-1lCX0sLdmrF3O4NbOOSpAuYZwjCiY3351MS-IdjpqFmmaxYd2jt13eXxEohDZ0XY3Z6hmLaLyWPAqa4VO3D_M6xR9WF2N-lqQ22Wk97t61YOAiWBSmMjVQ49V97CRRNuUVFfd-KJL0_iBorSaWRycSs-PDb9RArPgEvrA8MjC7Usx-LJGVvKtZJXRQnQeJtHevSnCkRnnAcxAv--OjB")' }}
                    />
                </button>
            </div>
        </header>
    );
}
