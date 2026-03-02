import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configuraciones Globales</h2>
                <p className="text-muted-foreground">Administra los planes de suscripción y límites del sistema SaaS.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Basic Plan */}
                <Card className="border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="h-2 w-full bg-slate-400 absolute top-0 left-0"></div>
                    <CardHeader>
                        <CardTitle className="text-xl">Plan Básico</CardTitle>
                        <CardDescription>Para escuelas pequeñas comenzando.</CardDescription>
                        <div className="mt-4 flex items-baseline text-4xl font-extrabold pb-2">
                            $49
                            <span className="ml-1 text-xl font-medium text-muted-foreground">/mes</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                                <span>Hasta <strong>50</strong> Estudiantes</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                                <span>Hasta <strong>2</strong> Instructores</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                                <span>Soporte estándar</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Editar Límites</Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className="border-indigo-200 shadow-md relative overflow-hidden bg-indigo-50/50">
                    <div className="h-2 w-full bg-indigo-600 absolute top-0 left-0"></div>
                    <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                        POPULAR
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl">Plan Pro</CardTitle>
                        <CardDescription>Para escuelas en crecimiento.</CardDescription>
                        <div className="mt-4 flex items-baseline text-4xl font-extrabold pb-2">
                            $99
                            <span className="ml-1 text-xl font-medium text-muted-foreground">/mes</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-600" />
                                <span>Hasta <strong>250</strong> Estudiantes</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-600" />
                                <span>Hasta <strong>10</strong> Instructores</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-600" />
                                <span>Recordatorios por WhatsApp</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-600" />
                                <span>Soporte prioritario</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Editar Límites</Button>
                    </CardFooter>
                </Card>

                {/* Enterprise Plan */}
                <Card className="border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="h-2 w-full bg-slate-900 absolute top-0 left-0"></div>
                    <CardHeader>
                        <CardTitle className="text-xl">Plan Empresa</CardTitle>
                        <CardDescription>Múltiples sucursales y gran volumen.</CardDescription>
                        <div className="mt-4 flex items-baseline text-4xl font-extrabold pb-2">
                            $249
                            <span className="ml-1 text-xl font-medium text-muted-foreground">/mes</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-slate-700" />
                                <span>Estudiantes <strong>Ilimitados</strong></span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-slate-700" />
                                <span>Instructores <strong>Ilimitados</strong></span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-slate-700" />
                                <span>Marca blanca (Próximamente)</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-slate-700" />
                                <span>Gerente de cuenta dedicado</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Editar Límites</Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Global Settings Configuration */}
            <div className="mt-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                            Ajustes del Sistema
                        </CardTitle>
                        <CardDescription>
                            Estos ajustes afectan a todas las instancias y tenants en la plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Días de Prueba Gratuita (Trial)
                                </label>
                                <Input type="number" defaultValue={14} />
                                <p className="text-[0.8rem] text-muted-foreground">Días que una escuela nueva puede usar el sistema sin pagar.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Alerta de Cancelación (Días previos)
                                </label>
                                <Input type="number" defaultValue={3} />
                                <p className="text-[0.8rem] text-muted-foreground">Cuándo avisar antes de suspender por falta de pago.</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t px-6 py-4">
                        <Button className="ml-auto">
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
