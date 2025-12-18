import { createClient } from '@/lib/supabase/server';
import { Car, Wrench, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateVehicleDialog } from '@/components/vehicles/CreateVehicleDialog';
import { EditVehicleDialog } from '@/components/vehicles/EditVehicleDialog';
import { DeleteVehicleButton } from '@/components/vehicles/DeleteVehicleButton';

export default async function VehiclesPage() {
    const supabase = await createClient();

    // Fetch all vehicles
    const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching vehicles:', error);
    }

    const totalVehicles = vehicles?.length || 0;
    const activeVehicles = vehicles?.filter(v => v.status === 'active').length || 0;
    const maintenanceVehicles = vehicles?.filter(v => v.status === 'maintenance').length || 0;

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vehículos</h1>
                    <p className="text-muted-foreground mt-1">{activeVehicles} de {totalVehicles} vehículos disponibles</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        Exportar Lista
                    </Button>
                    <CreateVehicleDialog />
                </div>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles && vehicles.length > 0 ? (
                    vehicles.map((vehicle) => {
                        const isActive = vehicle.status === 'active';
                        const isMaintenance = vehicle.status === 'maintenance';

                        return (
                            <div key={vehicle.id} className="bg-card rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                <div className={cn("p-6 border-b",
                                    isActive ? "bg-emerald-50 dark:bg-emerald-900/10" : "bg-orange-50 dark:bg-orange-900/10"
                                )}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center",
                                                isActive ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-orange-100 dark:bg-orange-900/30"
                                            )}>
                                                <Car className={cn("h-6 w-6",
                                                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"
                                                )} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{vehicle.brand} {vehicle.model}</h3>
                                                <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        )}
                                        {isMaintenance && (
                                            <Wrench className="h-5 w-5 text-orange-600" />
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Patente</span>
                                        <span className="font-semibold">{vehicle.license_plate}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Transmisión</span>
                                        <span className="font-medium capitalize">{vehicle.transmission_type === 'manual' ? 'Manual' : 'Automática'}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Estado</span>
                                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                                                isMaintenance ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" :
                                                    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                        )}>
                                            {vehicle.status === 'active' ? 'Disponible' :
                                                vehicle.status === 'maintenance' ? 'En Taller' :
                                                    vehicle.status}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t flex gap-2">
                                        <Button variant="default" className="flex-1" asChild>
                                            <a href={`/dashboard/vehicles/${vehicle.id}`}>
                                                Ver Detalles
                                            </a>
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <EditVehicleDialog vehicle={vehicle} />
                                        <DeleteVehicleButton vehicleId={vehicle.id} vehicleName={`${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full p-12 text-center bg-card rounded-xl border">
                        <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground font-medium">No hay vehículos registrados</p>
                        <p className="text-sm text-muted-foreground mt-1">Agrega tu primer vehículo para comenzar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
