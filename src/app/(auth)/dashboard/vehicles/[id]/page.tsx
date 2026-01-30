import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Calendar, DollarSign, FileText, AlertTriangle, ArrowLeft, Gauge } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AddMaintenanceDialog } from '@/components/vehicles/AddMaintenanceDialog';
import { AddDocumentDialog } from '@/components/vehicles/AddDocumentDialog';
import { DeleteDocumentButton } from '@/components/vehicles/DeleteDocumentButton';
import { MaintenanceScheduleManager } from "@/components/vehicles/MaintenanceScheduleManager";
import { cn } from '@/lib/utils';

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { id } = await params;

    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

    if (!vehicle) {
        notFound();
    }

    const { data: maintenance } = await supabase
        .from('vehicle_service_records')
        .select('*')
        .eq('vehicle_id', id)
        .order('date', { ascending: false });

    const { data: documents } = await supabase
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', id)
        .order('expiry_date', { ascending: true });

    const { data: schedules } = await supabase
        .from('vehicle_maintenance_schedules')
        .select('*')
        .eq('vehicle_id', id);

    // Calculate totals
    const totalMaintenanceCost = maintenance?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0;

    // Check expired documents
    const today = new Date();
    const expiringSoon = documents?.filter(doc => {
        const expiry = new Date(doc.expiry_date);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    });

    const expiredDocs = documents?.filter(doc => {
        const expiry = new Date(doc.expiry_date);
        return expiry < today;
    });

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/vehicles">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{vehicle.brand} {vehicle.model}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-base">{vehicle.license_plate}</Badge>
                        <Badge variant={vehicle.status === 'active' ? 'default' : 'destructive'}>
                            {vehicle.status === 'active' ? 'Activo' : vehicle.status}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {((expiredDocs && expiredDocs.length > 0) || (expiringSoon && expiringSoon.length > 0)) && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900 p-4 rounded-lg flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-orange-800 dark:text-orange-400">Atención Requerida</h3>
                        <ul className="list-disc list-inside text-sm text-orange-700 dark:text-orange-300 mt-1">
                            {expiredDocs?.map(doc => (
                                <li key={doc.id}>
                                    Venció <strong>{doc.type}</strong> el {new Date(doc.expiry_date).toLocaleDateString()}
                                </li>
                            ))}
                            {expiringSoon?.map(doc => (
                                <li key={doc.id}>
                                    Vence <strong>{doc.type}</strong> pronto ({new Date(doc.expiry_date).toLocaleDateString()})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Stats Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Odómetro Actual</CardTitle>
                        <Gauge className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">
                            {vehicle.current_mileage ? `${vehicle.current_mileage.toLocaleString()} km` : '0 km'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Actualizado automáticamente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Costo Mantenimiento</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalMaintenanceCost.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Servicios Realizados</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maintenance?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Documentos Activos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documents?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="maintenance" className="w-full">
                <TabsList>
                    <TabsTrigger value="maintenance">Historial de Mantenimiento</TabsTrigger>
                    <TabsTrigger value="documents">Documentación</TabsTrigger>
                </TabsList>

                <TabsContent value="maintenance" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: History (2/3 width) */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Registro de Servicios</h2>
                                <AddMaintenanceDialog vehicleId={id} />
                            </div>

                            <Card>
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Detalle</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">KMs</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Costo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {maintenance && maintenance.length > 0 ? (
                                                maintenance.map((item) => (
                                                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                                        <td className="p-4 align-middle">{new Date(item.date).toLocaleDateString()}</td>
                                                        <td className="p-4 align-middle font-medium">{item.type}</td>
                                                        <td className="p-4 align-middle text-muted-foreground">{item.description}</td>
                                                        <td className="p-4 align-middle text-right">{item.mileage?.toLocaleString() || '-'}</td>
                                                        <td className="p-4 align-middle text-right font-medium">
                                                            {item.cost ? `$${item.cost.toLocaleString()}` : '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                        No hay registros de mantenimiento
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column: Rules (1/3 width) */}
                        <div className="lg:col-span-1">
                            <MaintenanceScheduleManager
                                vehicleId={id}
                                currentMileage={vehicle.current_mileage || 0}
                                schedules={schedules || []}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Documentos y Vencimientos</h2>
                        <AddDocumentDialog vehicleId={id} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents && documents.length > 0 ? (
                            documents.map((doc) => {
                                const expiry = new Date(doc.expiry_date);
                                const isExpired = expiry < today;
                                const isSoon = !isExpired && (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30;

                                return (
                                    <Card key={doc.id} className={cn(
                                        "border-l-4",
                                        isExpired ? "border-l-destructive" : isSoon ? "border-l-orange-500" : "border-l-emerald-500"
                                    )}>
                                        <CardHeader>
                                            <CardTitle className="text-base flex justify-between items-start">
                                                <div className="flex flex-col gap-2">
                                                    <span>{doc.type}</span>
                                                    <div className="flex gap-2">
                                                        {isExpired && <Badge variant="destructive">Vencido</Badge>}
                                                        {isSoon && <Badge className="bg-orange-500 hover:bg-orange-600">Vence Pronto</Badge>}
                                                        {!isExpired && !isSoon && <Badge className="bg-emerald-500 hover:bg-emerald-600">Vigente</Badge>}
                                                    </div>
                                                </div>
                                                <DeleteDocumentButton documentId={doc.id} vehicleId={id} />
                                            </CardTitle>
                                            <CardDescription>
                                                Vence: {expiry.toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Emisión:</span>
                                                    <span>{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : '-'}</span>
                                                </div>
                                                {doc.notes && (
                                                    <p className="text-sm text-muted-foreground mt-2 border-t pt-2 max-h-20 overflow-y-auto">
                                                        {doc.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        ) : (
                            <div className="col-span-full p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                                No hay documentos registrados
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
