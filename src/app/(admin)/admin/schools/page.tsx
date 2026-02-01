import { getSchoolsList } from "../actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export default async function AdminSchoolsPage() {
    const schools = await getSchoolsList();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Autoescuelas</h2>
                    <p className="text-muted-foreground">Gestiona tus clientes y sus suscripciones.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/schools/new">
                        <Plus className="mr-2 h-4 w-4" /> Nueva Escuela
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Dueño (Email)</TableHead>
                            <TableHead>Fecha Alta</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schools.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No hay escuelas registradas aún.
                                </TableCell>
                            </TableRow>
                        ) : (
                            schools.map((school) => (
                                <TableRow key={school.id}>
                                    <TableCell className="font-medium">{school.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={school.status === 'active' ? 'default' : 'destructive'}>
                                            {school.status === 'active' ? 'Activa' : 'Suspendida'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">{school.plan_type || 'Basic'}</TableCell>
                                    <TableCell>
                                        {/* Setup needed to pull owner email via join */}
                                        {school.email || 'Sin contacto'}
                                    </TableCell>
                                    <TableCell>
                                        {school.created_at && format(new Date(school.created_at), "d MMM yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
