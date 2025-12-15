import { getPayments } from './actions';
import { getResources } from '../classes/actions';
import { RegisterPaymentDialog } from '@/components/finance/RegisterPaymentDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function FinancePage() {
    const { success, data: payments } = await getPayments();
    const resources = await getResources();

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
                    <p className="text-muted-foreground">Registro de pagos y movimientos.</p>
                </div>
                <RegisterPaymentDialog students={resources.students || []} />
            </div>

            <div className="rounded-md border bg-card">
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
                                        <td className="p-4 align-middle capitalize">
                                            {payment.payment_method}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {payment.notes || '-'}
                                        </td>
                                        <td className="p-4 align-middle text-right font-bold text-green-600">
                                            ${Number(payment.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                        No hay pagos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
