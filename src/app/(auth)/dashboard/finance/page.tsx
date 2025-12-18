import { getPayments, getExpenses } from './actions';
import { getResources } from '../classes/actions';
import { RegisterPaymentDialog } from '@/components/finance/RegisterPaymentDialog';
import { RegisterExpenseDialog } from '@/components/finance/RegisterExpenseDialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Banknote, CreditCard, Building2, Smartphone, HelpCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

function getPaymentMethodBadge(method: string) {
    const methodConfig: Record<string, { label: string; icon: any; variant: 'default' | 'secondary' | 'outline' }> = {
        cash: { label: 'Efectivo', icon: Banknote, variant: 'default' },
        card: { label: 'Tarjeta', icon: CreditCard, variant: 'secondary' },
        transfer: { label: 'Transferencia', icon: Building2, variant: 'outline' },
        mercadopago: { label: 'MercadoPago', icon: Smartphone, variant: 'secondary' },
        other: { label: 'Otro', icon: HelpCircle, variant: 'outline' },
        check: { label: 'Cheque', icon: Banknote, variant: 'outline' }
    };

    const config = methodConfig[method] || methodConfig.other;
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

export default async function FinancePage() {
    const { data: payments } = await getPayments();
    const { data: expenses } = await getExpenses();
    const resources = await getResources();

    // Calculate totals
    const totalRevenue = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const totalExpenses = expenses?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0;
    const balance = totalRevenue - totalExpenses;

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
                    <p className="text-muted-foreground">Control de ingresos, gastos y balance general.</p>
                </div>
                <div className="flex gap-2">
                    <RegisterPaymentDialog students={resources.students || []} />
                    <RegisterExpenseDialog />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            ${totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {payments?.length || 0} pagos registrados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">
                            ${totalExpenses.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {expenses?.length || 0} gastos registrados
                        </p>
                    </CardContent>
                </Card>
                <Card className={cn("border-l-4", balance >= 0 ? "border-l-emerald-500" : "border-l-rose-500")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balance General</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", balance >= 0 ? "text-primary" : "text-rose-600")}>
                            ${balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ganancia Neta
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="income" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="income">Ingresos</TabsTrigger>
                    <TabsTrigger value="expenses">Gastos</TabsTrigger>
                </TabsList>

                <TabsContent value="income" className="mt-4">
                    <Card>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estudiante</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Método</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notas</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {payments && payments.length > 0 ? (
                                        payments.map((payment: any) => (
                                            <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    {payment.payment_date ? format(new Date(payment.payment_date), 'dd/MM/yyyy') : '-'}
                                                </td>
                                                <td className="p-4 align-middle font-medium">
                                                    {payment.student?.first_name} {payment.student?.last_name}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {getPaymentMethodBadge(payment.payment_method)}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {payment.notes || '-'}
                                                </td>
                                                <td className="p-4 align-middle text-right font-bold text-emerald-600">
                                                    + ${Number(payment.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                No hay pagos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses" className="mt-4">
                    <Card>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoría</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Descripción</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Método</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {expenses && expenses.length > 0 ? (
                                        expenses.map((expense: any) => (
                                            <tr key={expense.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    {expense.date ? format(new Date(expense.date), 'dd/MM/yyyy') : '-'}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant="outline">{expense.category}</Badge>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {expense.description || '-'}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {getPaymentMethodBadge(expense.payment_method)}
                                                </td>
                                                <td className="p-4 align-middle text-right font-bold text-rose-600">
                                                    - ${Number(expense.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                No hay gastos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
