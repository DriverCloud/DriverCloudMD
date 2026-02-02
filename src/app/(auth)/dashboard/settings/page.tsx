import { getSettings } from './actions';
import { SchoolProfileForm } from '@/components/settings/SchoolProfileForm';
import { BookingPoliciesForm } from '@/components/settings/BookingPoliciesForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, CalendarClock, Users, BookOpen, Tag, Bell } from 'lucide-react';
import UsersPage from './users/page';
import { ClassTypesSettings } from '@/components/settings/ClassTypesSettings';
import { CoursePackagesSettings } from '@/components/settings/CoursePackagesSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
    const supabase = await createClient();

    // Check Role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: membership } = await supabase.from('memberships').select('role').eq('user_id', user.id).single();
        if (membership?.role === 'instructor') {
            redirect('/dashboard');
        }
    }

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
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="profile" className="gap-2">
                        <Building className="h-4 w-4" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="policies" className="gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Políticas
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="h-4 w-4" />
                        Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="classes" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Clases
                    </TabsTrigger>
                    <TabsTrigger value="packages" className="gap-2">
                        <Tag className="h-4 w-4" />
                        Cursos
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notificaciones
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <SchoolProfileForm school={school} />
                </TabsContent>

                <TabsContent value="policies" className="mt-6">
                    <BookingPoliciesForm settings={settings} />
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                    <UsersPage />
                </TabsContent>

                <TabsContent value="classes" className="mt-6">
                    <ClassTypesSettings />
                </TabsContent>

                <TabsContent value="packages" className="mt-6">
                    <CoursePackagesSettings />
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                    <NotificationSettings settings={data.notifications || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
