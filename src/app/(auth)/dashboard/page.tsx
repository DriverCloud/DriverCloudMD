import { KPICards } from "@/components/dashboard/KPICards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MaintenanceAlerts } from "@/components/dashboard/MaintenanceAlerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentModal } from "@/features/finance/components/PaymentModal";
import { getUserRole } from "@/app/actions/auth";

export default async function DashboardPage() {
    const role = await getUserRole();
    const isInstructor = role === 'instructor';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    {!isInstructor && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Registrar Pago
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                                </DialogHeader>
                                <PaymentModal />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <KPICards userRole={role} />

            {/* Maintenance Alerts Logic: Only visible if there are alerts (handled inside component) */}
            {!isInstructor && <MaintenanceAlerts />}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {!isInstructor && <ActivityChart />}
                <div className={isInstructor ? "col-span-7" : "col-span-3"}>
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
}
