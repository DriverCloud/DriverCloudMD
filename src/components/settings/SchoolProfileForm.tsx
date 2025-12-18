'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSchoolProfile } from '@/app/(auth)/dashboard/settings/actions';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SchoolProfileFormProps {
    school: any;
}

export function SchoolProfileForm({ school }: SchoolProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await updateSchoolProfile(formData);

        if (result.success) {
            toast.success("Perfil actualizado correctamente");
            router.refresh();
        } else {
            toast.error(result.error || "Error al actualizar perfil");
        }

        setLoading(false);
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Perfil de la Escuela</CardTitle>
                    <CardDescription>
                        Información pública visible para tus alumnos y en reportes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Escuela *</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={school.name}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={school.phone}
                                placeholder="+54 11..."
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email de Contacto</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={school.email}
                                placeholder="contacto@escuela.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección Principal</Label>
                        <Input
                            id="address"
                            name="address"
                            defaultValue={school.address}
                            placeholder="Calle 123, Localidad"
                            disabled={loading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!loading && <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
