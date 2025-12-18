import { getSettings } from './actions';
import { SchoolProfileForm } from '@/components/settings/SchoolProfileForm';
import { BookingPoliciesForm } from '@/components/settings/BookingPoliciesForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, CalendarClock } from 'lucide-react';

export default async function SettingsPage() {
    const { success, data, error } = await getSettings();

    if (!success || !data) {
        return (
            <div className="p-6">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    Error al cargar configuración: {error}
                </div>
            </div>
        );
    }

    const { school, settings } = data;

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">
                    Administra el perfil de tu escuela y las reglas operativas.
                </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="profile" className="gap-2">
                        <Building className="h-4 w-4" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="policies" className="gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Políticas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <SchoolProfileForm school={school} />
                </TabsContent>

                <TabsContent value="policies" className="mt-6">
                    <BookingPoliciesForm settings={settings} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
