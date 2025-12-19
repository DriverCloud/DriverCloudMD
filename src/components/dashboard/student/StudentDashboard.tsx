import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditBalanceCard } from "./CreditBalanceCard";
import { WelcomeBanner } from "./WelcomeBanner";

interface StudentDashboardProps {
    studentName: string;
    credits: number;
    nextClass?: {
        date: string;
        time: string;
        instructor: string;
    } | null;
}

export function StudentDashboard({ studentName, credits, nextClass }: StudentDashboardProps) {
    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 lg:p-6">
            <WelcomeBanner name={studentName} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Credit Balance Card */}
                <CreditBalanceCard credits={credits} />

                {/* Next Class Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Próxima Clase
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {nextClass ? (
                            <div className="flex flex-col gap-1">
                                <div className="text-2xl font-bold">{nextClass.date}</div>
                                <p className="text-xs text-muted-foreground">
                                    {nextClass.time} con {nextClass.instructor}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="text-2xl font-bold text-muted-foreground">Sin agendar</div>
                                <p className="text-xs text-muted-foreground">
                                    No tienes clases confirmadas próximamente.
                                </p>
                                <Button size="sm" asChild className="w-full mt-2">
                                    <Link href="/dashboard/classes">Agendar Clase</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Progress Card */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tu Progreso
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">15%</div>
                        <p className="text-xs text-muted-foreground">
                            3 de 20 clases recomendadas
                        </p>
                        {/* ProgressBar placeholder */}
                        <div className="h-2 w-full bg-secondary mt-3 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[15%]" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <CreditCard className="h-4 w-4" />
                            Comprar Pack de Clases
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <Calendar className="h-4 w-4" />
                            Ver Historial de Clases
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
