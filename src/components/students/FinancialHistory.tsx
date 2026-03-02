'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, History, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentModal } from '@/features/finance/components/PaymentModal';

interface FinancialHistoryProps {
    packages: any[];
    payments: any[];
    studentId?: string;
}

export function FinancialHistory({ packages, payments, studentId }: FinancialHistoryProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Historial Financiero</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="transactions">Últimos Movimientos</TabsTrigger>
                        <TabsTrigger value="packages">Paquetes Comprados</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions" className="space-y-4 pt-4">
                        <div className="rounded-md border">
                            <table className="w-full text-sm table-fixed">
                                <thead className="bg-muted/50">
                                    <tr className="border-b">
                                        <th className="p-3 text-left w-[20%]">Fecha</th>
                                        <th className="p-3 text-left w-[25%]">Tipo</th>
                                        <th className="p-3 text-left w-[30%]">Detalle</th>
                                        <th className="p-3 text-right w-[25%]">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.id} className="border-b">
                                            <td className="p-3">{new Date(p.payment_date).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    Pago ({p.payment_method})
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-muted-foreground">{p.notes || '-'}</td>
                                            <td className="p-3 text-right font-medium text-emerald-600 whitespace-nowrap">
                                                +${p.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {packages.map((pkg) => (
                                        <tr key={pkg.id} className="border-b">
                                            <td className="p-3">{new Date(pkg.purchase_date || pkg.created_at).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                                                    Compra Pack
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-muted-foreground">
                                                {pkg.name} ({pkg.total_credits} clases)
                                            </td>
                                            <td className="p-3 text-right font-medium text-rose-600 whitespace-nowrap">
                                                -${pkg.price.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {packages.length === 0 && payments.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-16 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-200">
                                                        <History className="h-6 w-6" />
                                                    </div>
                                                    <div className="space-y-1 text-center">
                                                        <p className="font-semibold text-slate-900">Sin movimientos financieros</p>
                                                        <p className="text-sm text-slate-500 max-w-[300px] mx-auto">
                                                            Aún no se han registrado cobros ni ventas de paquetes para este alumno.
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="packages" className="pt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {packages.map((pkg) => (
                                <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Package className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{pkg.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(pkg.purchase_date || pkg.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">${pkg.price.toLocaleString()}</p>
                                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                                            {pkg.remaining_credits !== undefined ? pkg.remaining_credits : pkg.credits} / {pkg.total_credits} créditos
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {packages.length === 0 && (
                                <div className="col-span-2 py-12 flex flex-col items-center justify-center space-y-4 border-2 border-dashed rounded-xl border-slate-100">
                                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="font-semibold text-slate-900">No posee paquetes</p>
                                        <p className="text-sm text-slate-500 max-w-[280px]">
                                            El alumno no ha comprado ningún pack de clases todavía.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
