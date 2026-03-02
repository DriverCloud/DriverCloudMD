import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, DollarSign, Activity, TrendingUp, ShieldCheck } from "lucide-react";
import { getAdminStats } from "./actions";
import { DashboardChart } from "@/components/admin/DashboardChart";

export default async function AdminDashboardPage() {
    const stats = await getAdminStats();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Resumen Global</h2>
                <p className="text-muted-foreground">Monitorea el crecimiento y estado de todas las autoescuelas.</p>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Building2 className="h-16 w-16" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">Escuelas Activas</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.schoolsCount}</div>
                        <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            +2 este mes
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="h-16 w-16" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">Alumnos Totales</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Users className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.studentsCount}</div>
                        <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            +12% en 30 días
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign className="h-16 w-16" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">MRR Estimado</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">$4,250</div>
                        <p className="mt-1 text-xs text-muted-foreground flex items-center">
                            Suscripciones activas
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="h-16 w-16 text-white" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-300">Estado del Sistema</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-400">Óptimo</div>
                        <p className="mt-1 text-xs text-slate-400 flex items-center">
                            Todos los servicios operacionales
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart Section */}
                <div className="lg:col-span-4">
                    <DashboardChart />
                </div>

                {/* Recent Activity / Tenants */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-slate-200 shadow-sm h-full">
                        <CardHeader>
                            <CardTitle>Nuevas Autoescuelas</CardTitle>
                            <CardDescription>
                                Últimas suscripciones a la plataforma SaaS.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Dummy data for now, ideally fetched from DB */}
                                {[
                                    { name: "Autoescuela Rápida", plan: "Pro", date: "Hoy, 10:23 AM" },
                                    { name: "Manejo Seguro S.A.", plan: "Básico", date: "Ayer, 16:45 PM" },
                                    { name: "Conducir Plus", plan: "Enterprise", date: "Hace 3 días" },
                                    { name: "Escuela del Sol", plan: "Básico", date: "Hace 5 días" },
                                ].map((school, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 text-sm font-bold bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center">
                                                {school.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900">{school.name}</span>
                                                <span className="text-xs text-muted-foreground">{school.date}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                                            {school.plan}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
