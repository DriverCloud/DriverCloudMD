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
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, Filter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SchoolActionsMenu } from "@/components/admin/SchoolActionsMenu";

export default async function AdminSchoolsPage() {
    const schools = await getSchoolsList();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Autoescuelas</h2>
                    <p className="text-muted-foreground mt-1">Gestiona tus clientes, suscripciones y accesos al sistema.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex">
                        <Filter className="mr-2 h-4 w-4" /> Filtros
                    </Button>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                        <Link href="/admin/schools/new">
                            <Plus className="mr-2 h-4 w-4" /> Nueva Escuela
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre o dueño..."
                            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        Mostrando <span className="font-medium text-slate-900">{schools.length}</span> escuelas
                    </div>
                </div>

                <div className="bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                                <TableHead className="font-semibold text-slate-700 h-11">Nombre</TableHead>
                                <TableHead className="font-semibold text-slate-700 h-11">Estado</TableHead>
                                <TableHead className="font-semibold text-slate-700 h-11">Plan</TableHead>
                                <TableHead className="font-semibold text-slate-700 h-11">Contacto</TableHead>
                                <TableHead className="font-semibold text-slate-700 h-11">Fecha Alta</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 h-11">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schools.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Building2 className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-slate-900">No hay escuelas registradas</p>
                                                <p className="text-sm text-slate-500">Agrega tu primera autoescuela para comenzar.</p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild className="mt-4">
                                                <Link href="/admin/schools/new">Agregar Escuela</Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                schools.map((school) => (
                                    <TableRow key={school.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                    {school.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                {school.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={school.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50'}
                                            >
                                                {school.status === 'active' ? 'Activa' : 'Suspendida'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 capitalize">
                                                {school.plan_type || 'Basic'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {school.email || 'Sin contacto'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {school.created_at && format(new Date(school.created_at), "d MMM yyyy", { locale: es })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <SchoolActionsMenu
                                                schoolId={school.id}
                                                schoolName={school.name}
                                                currentStatus={school.status}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
