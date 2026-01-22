import { createClient } from '@/lib/supabase/server';
import { InstructorSettlementDialog } from '@/components/finance/InstructorSettlementDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, History, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function InstructorFinancePage() {
    const supabase = await createClient();

    // Fetch Instructors
    const { data: instructors } = await supabase
        .from('instructors')
        .select('*')
        .eq('status', 'active')
        .order('last_name');

    // Fetch Payment History
    const { data: payments } = await supabase
        .from('instructor_payments')
        .select(`
            *,
            instructor:instructors (
                first_name,
                last_name
            )
        `)
        .order('payment_date', { ascending: false })
        .limit(50);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Liquidación de Instructores</h1>
                <p className="text-muted-foreground">
                    Gestiona los sueldos y comisiones de tu equipo.
                </p>
            </div>

            <Tabs defaultValue="settlement" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="settlement" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Instructores por Liquidar
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Historial de Pagos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settlement" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {instructors?.map((instructor) => (
                            <Card key={instructor.id} className="flex flex-col justify-between">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">
                                            {instructor.last_name}, {instructor.first_name}
                                        </CardTitle>
                                        <Badge variant="outline" className="capitalize">
                                            {instructor.salary_type === 'per_class' ? 'Por Comisión' :
                                                instructor.salary_type === 'fixed' ? 'Sueldo Fijo' : 'Mixto'}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {instructor.phone}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                                        {(instructor.salary_type === 'fixed' || instructor.salary_type === 'mixed') && (
                                            <div className="flex justify-between">
                                                <span>Base:</span>
                                                <span className="font-medium text-foreground">${Number(instructor.base_salary).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {(instructor.salary_type === 'per_class' || instructor.salary_type === 'mixed') && (
                                            <div className="flex justify-between">
                                                <span>Valor Clase:</span>
                                                <span className="font-medium text-foreground">${Number(instructor.price_per_class).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <InstructorSettlementDialog instructor={instructor}>
                                        <Button className="w-full">
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            Liquidar
                                        </Button>
                                    </InstructorSettlementDialog>
                                </CardContent>
                            </Card>
                        ))}

                        {(!instructors || instructors.length === 0) && (
                            <p className="col-span-full text-center text-muted-foreground py-8">
                                No hay instructores activos.
                            </p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pagos Realizados</CardTitle>
                            <CardDescription>
                                Últimos 50 pagos registrados en el sistema.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha Pago</TableHead>
                                        <TableHead>Instructor</TableHead>
                                        <TableHead>Periodo Liquidado</TableHead>
                                        <TableHead>Clases</TableHead>
                                        <TableHead className="text-right">Monto Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments?.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {format(new Date(payment.payment_date), "d MMM yyyy", { locale: es })}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {payment.instructor?.last_name}, {payment.instructor?.first_name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(payment.period_start), "d MMM", { locale: es })} - {format(new Date(payment.period_end), "d MMM", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                {payment.total_classes}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ${payment.total_amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!payments || payments.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No hay historial de pagos.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
