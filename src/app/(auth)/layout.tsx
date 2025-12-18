import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SessionRefresh } from "@/components/auth/SessionRefresh";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-muted/40">
            <SessionRefresh />
            <Sidebar />
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

