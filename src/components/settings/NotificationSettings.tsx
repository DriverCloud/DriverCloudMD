'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BellRing, ShieldAlert, Wrench, Wallet } from 'lucide-react';
import { updateNotificationSetting } from '@/app/(auth)/dashboard/settings/actions';
import { toast } from 'sonner';

interface NotificationSetting {
    id: string;
    type: string;
    enabled: boolean;
    days_threshold: number;
}

interface NotificationSettingsProps {
    settings: NotificationSetting[];
}

const NOTIFICATION_TYPES = [
    {
        id: 'license_expiry',
        label: 'Vencimiento de Licencias',
        description: 'Avisar antes de que venza la licencia de un instructor.',
        icon: ShieldAlert,
        hasThreshold: true,
        defaultThreshold: 30
    },
    {
        id: 'vehicle_maintenance',
        label: 'Mantenimiento de Vehículos',
        description: 'Avisar cuando un vehículo alcance el kilometraje de servicio.',
        icon: Wrench,
        hasThreshold: false, // Could be km, but usually that's per vehicle rules. This is a global toggle.
        defaultThreshold: 0
    },
    {
        id: 'payment_received',
        label: 'Pagos Recibidos',
        description: 'Notificar cada vez que se registre un nuevo pago.',
        icon: Wallet,
        hasThreshold: false,
        defaultThreshold: 0
    }
];

export function NotificationSettings({ settings }: NotificationSettingsProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleToggle = async (type: string, currentEnabled: boolean, threshold: number) => {
        setLoading(type);
        const result = await updateNotificationSetting(type, !currentEnabled, threshold);

        if (result.success) {
            toast.success('Configuración actualizada');
        } else {
            toast.error('Error al actualizar');
        }
        setLoading(null);
    };

    const handleThresholdChange = async (type: string, enabled: boolean, newThreshold: string) => {
        const val = parseInt(newThreshold);
        if (isNaN(val)) return;

        // Debouncing would be better here, but for now simple onBlur or similar action could work. 
        // Or just a separate save button? 
        // Let's rely on the user triggering it via a small button or blur. 
        // Actually, simplest UX: Input triggers update on Blur.

        const result = await updateNotificationSetting(type, enabled, val);
        if (result.success) {
            toast.success('Umbral actualizado');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-6 w-6" />
                    Preferencias de Notificaciones
                </CardTitle>
                <CardDescription>
                    Elige qué alertas quieres recibir y con cuánta anticipación.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {NOTIFICATION_TYPES.map((type) => {
                    const setting = settings.find(s => s.type === type.id);
                    const enabled = setting ? setting.enabled : true; // Default to true if not set
                    const threshold = setting ? setting.days_threshold : type.defaultThreshold;
                    const Icon = type.icon;

                    return (
                        <div key={type.id} className="flex items-start justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-start space-x-4">
                                <div className="mt-1 bg-muted p-2 rounded-full">
                                    <Icon className="h-5 w-5 text-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor={type.id} className="text-base font-medium">
                                        {type.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {type.description}
                                    </p>

                                    {type.hasThreshold && enabled && (
                                        <div className="flex items-center gap-2 mt-2 pt-1 animate-in fade-in slide-in-from-top-1">
                                            <span className="text-sm">Avisar</span>
                                            <Input
                                                type="number"
                                                className="w-20 h-8"
                                                defaultValue={threshold}
                                                onBlur={(e) => handleThresholdChange(type.id, enabled, e.target.value)}
                                            />
                                            <span className="text-sm">días antes.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Switch
                                id={type.id}
                                checked={enabled}
                                onCheckedChange={() => handleToggle(type.id, enabled, threshold)}
                                disabled={loading === type.id}
                            />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
