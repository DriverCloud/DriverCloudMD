import { SessionRefresh } from "@/components/auth/SessionRefresh";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <SessionRefresh />
            {children}
        </div>
    );
}
