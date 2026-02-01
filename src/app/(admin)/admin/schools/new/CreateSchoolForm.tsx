"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { createSchool } from "@/app/(admin)/admin/actions"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
    schoolName: z.string().min(2, {
        message: "El nombre de la escuela debe tener al menos 2 caracteres.",
    }),
    ownerName: z.string().min(2, {
        message: "El nombre del dueño es requerido.",
    }),
    ownerEmail: z.string().email({
        message: "Email inválido.",
    }),
    planType: z.enum(["basic", "pro", "enterprise"]),
})

export function CreateSchoolForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string; tempPassword?: string } | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            schoolName: "",
            ownerName: "",
            ownerEmail: "",
            planType: "pro",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setResult(null)

        try {
            const res = await createSchool(values)
            setResult(res)
            if (res.success) {
                form.reset()
            }
        } catch (error) {
            setResult({ success: false, message: "Error de conexión al servidor." })
        } finally {
            setIsLoading(false)
        }
    }

    if (result?.success) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 border rounded-lg bg-emerald-50 text-center">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-900">¡Escuela Creada!</h2>
                <div className="text-emerald-800 space-y-2">
                    <p>La escuela <strong>{form.getValues().schoolName || "Nueva"}</strong> ha sido configurada.</p>
                    <p>Se ha enviado una invitación a: <strong>{form.getValues().ownerEmail || ""}</strong></p>
                </div>

                {/* Temporary Password Display for Dev/Testing if email not working */}
                {result.tempPassword && (
                    <div className="mt-4 p-4 bg-white rounded border border-emerald-200">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Credenciales Temporales (Copia esto)</p>
                        <p className="font-mono text-lg select-all">Contraseña: {result.tempPassword}</p>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setResult(null)}>
                        Crear Otra
                    </Button>
                    <Button asChild>
                        <Link href="/admin/schools">Ir a Lista de Escuelas</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
                {result && !result.success && (
                    <div className="p-3 rounded-md bg-red-50 text-red-600 flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {result.message}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="schoolName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre de la Autoescuela</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Autoescuela Veloz" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Dueño</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Carlos Perez" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="planType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plan Suscripción</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a plan" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="basic">Básico</SelectItem>
                                        <SelectItem value="pro">Pro (Recomendado)</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="ownerEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email del Dueño (Login)</FormLabel>
                            <FormControl>
                                <Input placeholder="cliente@ejemplo.com" {...field} />
                            </FormControl>
                            <FormDescription>
                                Recibirá las credenciales en este correo.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Creando Entorno..." : "Dar de Alta Escuela"}
                </Button>
            </form>
        </Form>
    )
}
