import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white/50 backdrop-blur-md px-6 lg:h-16 shadow-sm z-10 sticky top-0">
                    <h1 className="font-semibold text-lg text-slate-800 tracking-tight">Panel de Control SaaS</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
