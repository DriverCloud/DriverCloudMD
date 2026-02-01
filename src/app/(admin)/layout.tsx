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
                <header className="flex h-14 items-center gap-4 border-b bg-white px-6 lg:h-[60px]">
                    <h1 className="font-semibold text-lg">Panel de Control SaaS</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
