'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { updateBookingPolicies } from '@/app/(auth)/dashboard/settings/actions';
import { Loader2, Save, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface BookingPoliciesFormProps {
    settings: any;
}

export function BookingPoliciesForm({ settings }: BookingPoliciesFormProps) {
    const [loading, setLoading] = useState(false);
    const [allowExceptions, setAllowExceptions] = useState(settings?.allow_policy_exceptions || false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        // Manually append the switch value if needed, but the hidden input handles it.

        const result = await updateBookingPolicies(formData);

        if (result.success) {
            toast.success("Políticas actualizadas correctamente");
            router.refresh();
        } else {
            toast.error(result.error || "Error al actualizar políticas");
        }

        setLoading(false);
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Reglas de Agenda</CardTitle>
                    <CardDescription>
                        Configura cómo se comportan las reservas y cancelaciones.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4 p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/10">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-orange-800 dark:text-orange-400">Importante</h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                Estos cambios afectan a los turnos futuros. Los turnos ya agendados mantendrán las reglas vigentes al momento de su creación.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="cancellation_policy_hours" className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Tiempo de Cancelación (Horas)
                            </Label>
                            <Input
                                id="cancellation_policy_hours"
                                name="cancellation_policy_hours"
                                type="number"
                                min="0"
                                max="168"
                                defaultValue={settings?.cancellation_policy_hours ?? 24}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Mínimo de horas antes del turno para cancelar sin penalidad.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="default_buffer_minutes" className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Buffer entre Clases (Minutos)
                            </Label>
                            <Input
                                id="default_buffer_minutes"
                                name="default_buffer_minutes"
                                type="number"
                                step="5"
                                min="0"
                                max="60"
                                defaultValue={settings?.default_buffer_minutes ?? 15}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Tiempo de descanso automático agregado después de cada clase.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Permitir Excepciones</Label>
                            <CardDescription>
                                Permitir a los administrativos forzar cancelaciones fuera de término.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={allowExceptions}
                                onCheckedChange={setAllowExceptions}
                                disabled={loading}
                            />
                            {/* Hidden input to submit the boolean value */}
                            <input
                                type="hidden"
                                name="allow_policy_exceptions"
                                value={allowExceptions ? 'on' : 'off'}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!loading && <Save className="mr-2 h-4 w-4" />}
                        Guardar Reglas
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
