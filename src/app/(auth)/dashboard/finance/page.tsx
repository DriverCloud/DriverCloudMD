import { getPayments, getExpenses } from './actions';
import { getResources } from '../classes/actions';
import { RegisterPaymentDialog } from '@/components/finance/RegisterPaymentDialog';
import { RegisterExpenseDialog } from '@/components/finance/RegisterExpenseDialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, parse, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Banknote, CreditCard, Building2, Smartphone, HelpCircle, TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DateFilter } from '@/components/finance/DateFilter';
import { FinanceChart } from '@/components/finance/FinanceChart';

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

interface FinancePageProps {
    searchParams: Promise<{ month?: string; view?: string }>;
}

export default async function FinancePage({ searchParams }: FinancePageProps) {
    const params = await searchParams;
    const viewMode = (params.view === 'accrual' ? 'accrual' : 'cash') as 'cash' | 'accrual';

    // Parse Date Filter
    const today = new Date();
    let startDate = startOfMonth(today);
    // Default to start of next month for the upper bound
    let endDate = startOfMonth(addMonths(today, 1));

    if (params.month) {
        try {
            const parsedDate = parse(params.month, 'yyyy-MM', new Date());
            startDate = startOfMonth(parsedDate);
            endDate = startOfMonth(addMonths(parsedDate, 1));
        } catch (e) {
            console.error("Invalid date format", e);
        }
    }

    // Format for DB (YZ format might be needed depending on DB, but assuming standard ISO strings or YYYY-MM-DD)
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    const { data: payments } = await getPayments({
        startDate: startStr,
        endDate: endStr,
        dateMode: viewMode
    });
    const { data: expenses } = await getExpenses({ startDate: startStr, endDate: endStr });
    const resources = await getResources();

    // Calculate totals
    const totalRevenue = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const totalExpenses = expenses?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0;
    const balance = totalRevenue - totalExpenses;

    // Prepare Chart Data
    // We need to map each day of the month to income/expense
    // 1. Create a map of all days in the range
    const daysMap = new Map<string, { income: number; expense: number }>();

    // Fill map with 0s for all days in selected month (optional, but looks better)
    // For simplicity, let's just map the data we have.

    payments?.forEach((p: any) => {
        // Use imputation_date if present and in accrual mode?
        // Actually getPayments already filtered the list. 
        // Visualizing: If accrual, we likely want to plot it on the imputation date day.
        const dateToUse = (viewMode === 'accrual' && p.imputation_date) ? p.imputation_date : p.payment_date;
        const date = dateToUse?.split('T')[0];
        if (!date) return;
        const current = daysMap.get(date) || { income: 0, expense: 0 };
        daysMap.set(date, { ...current, income: current.income + Number(p.amount) });
    });

    expenses?.forEach((e: any) => {
        const date = e.date?.split('T')[0]; // expenses usually have date field
        if (!date) return;
        const current = daysMap.get(date) || { income: 0, expense: 0 };
        daysMap.set(date, { ...current, expense: current.expense + Number(e.amount) });
    });

    const chartData = Array.from(daysMap.entries()).map(([date, values]) => ({
        date,
        income: values.income,
        expense: values.expense
    }));

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Ver por:</span>
                        <div className="inline-flex items-center rounded-lg border bg-background p-0.5">
                            <Link
                                href={`/dashboard/finance?month=${params.month || ''}&view=cash`}
                                className={cn(
                                    "px-2.5 py-1 rounded-md transition-all text-xs font-medium",
                                    viewMode === 'cash' ? "bg-muted text-foreground shadow-sm" : "hover:bg-muted/50 text-muted-foreground"
                                )}
                            >
                                Caja (Real)
                            </Link>
                            <Link
                                href={`/dashboard/finance?month=${params.month || ''}&view=accrual`}
                                className={cn(
                                    "px-2.5 py-1 rounded-md transition-all text-xs font-medium",
                                    viewMode === 'accrual' ? "bg-muted text-foreground shadow-sm" : "hover:bg-muted/50 text-muted-foreground"
                                )}
                            >
                                Devengado (Contable)
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2 items-end md:items-center">
                    <DateFilter />

                    <div className="flex gap-2">
                        <Link href="/dashboard/finance/instructors">
                            <Button variant="outline">
                                <Users className="mr-2 h-4 w-4" />
                                Sueldos
                            </Button>
                        </Link>
                        <RegisterPaymentDialog students={resources.students || []} />
                        <RegisterExpenseDialog />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos ({format(startDate, 'MMMM', { locale: es })})</CardTitle>
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
                        <CardTitle className="text-sm font-medium">Gastos ({format(startDate, 'MMMM', { locale: es })})</CardTitle>
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
                        <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
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

            {/* Chart Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Flujo de Caja - {format(startDate, 'MMMM yyyy', { locale: es })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <FinanceChart data={chartData} />
                </CardContent>
            </Card>

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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
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
                                                <td className="p-4 align-middle text-sm text-muted-foreground">
                                                    {payment.creator_name || '-'}
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
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
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
                                                <td className="p-4 align-middle text-sm text-muted-foreground">
                                                    {expense.creator_name || '-'}
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
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
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
