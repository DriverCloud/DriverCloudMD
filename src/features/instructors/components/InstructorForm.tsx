"use client";

import { useForm, type ControllerProps, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField as BaseFormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { instructorsService } from "../service";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    first_name: z.string().min(2, "Nombre requerido"),
    last_name: z.string().min(2, "Apellido requerido"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().min(8, "Teléfono mínimo 8 dígitos").optional().or(z.literal("")),
    birth_date: z.string().optional(),
    cuil: z.string().optional(),
    address: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    license_number: z.string().min(5, "Nro licencia requerido"),
    license_expiry: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    salary_type: z.enum(['per_class', 'fixed', 'mixed']).default('per_class'),
    base_salary: z.coerce.number().optional(),
    price_per_class: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const FormField = <TName extends FieldPath<FormValues>>(
    props: ControllerProps<FormValues, TName>
) => {
    return <BaseFormField<FormValues, TName> {...props} />
}

const SPECIALTIES = [
    { id: "Manual", label: "Auto Manual" },
    { id: "Automático", label: "Auto Automático" },
    { id: "Moto", label: "Motocicleta" },
    { id: "Teórico", label: "Clases Teóricas" },
];

export function InstructorForm({ onSuccess }: { onSuccess?: () => void }) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            birth_date: "",
            cuil: "",
            address: "",
            emergency_contact_name: "",
            emergency_contact_phone: "",
            license_number: "",
            license_expiry: "",
            specialties: [],
            salary_type: "per_class" as "per_class" | "fixed" | "mixed",
            base_salary: 0,
            price_per_class: 0,
        },
    });

    async function onSubmit(values: FormValues) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { specialties, ...instructorData } = values;
            await instructorsService.createInstructor({
                ...instructorData,
                salary_type: instructorData.salary_type as 'fixed' | 'per_class' | 'mixed',
            });
            toast.success("Instructor creado exitosamente");
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast.error("Error al crear instructor");
            console.error(error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Juan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl>
                                    <Input placeholder="Pérez" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="juan@ejemplo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input placeholder="+54..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Nacimiento</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cuil"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CUIL</FormLabel>
                                <FormControl>
                                    <Input placeholder="20-12345678-9" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                                <Input placeholder="Calle Falsa 123, Quilmes" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Configuración de Pago */}
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-bold">$</span>
                        </div>
                        <h3 className="text-base font-semibold">Acuerdo de Pago General</h3>
                    </div>

                    <div className="grid gap-4 pl-10">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="salary_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modalidad</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    <option value="per_class">Por Clase (Comisión)</option>
                                                    <option value="fixed">Sueldo Fijo Mensual</option>
                                                    <option value="mixed">Mixto (Fijo + Comisión)</option>
                                                </select>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {(form.watch('salary_type') === 'fixed' || form.watch('salary_type') === 'mixed') && (
                                <FormField
                                    control={form.control}
                                    name="base_salary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sueldo Base Mensual</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                    <Input type="number" step="0.01" className="pl-7" placeholder="0.00" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {(form.watch('salary_type') === 'per_class' || form.watch('salary_type') === 'mixed') && (
                                <FormField
                                    control={form.control}
                                    name="price_per_class"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valor Base por Clase</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                    <Input type="number" step="0.01" className="pl-7" placeholder="0.00" {...field} />
                                                </div>
                                            </FormControl>
                                            <p className="text-[10px] text-muted-foreground">Tarifa por defecto si no hay específica.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-primary">Contacto de Emergencia</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="emergency_contact_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre del contacto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emergency_contact_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Teléfono alternativo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4 border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-primary">Licencia de Conducir</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="license_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número</FormLabel>
                                    <FormControl>
                                        <Input placeholder="B-12345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="license_expiry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vencimiento</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Especialidades</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {SPECIALTIES.map((item) => (
                                    <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), item.id])
                                                        : field.onChange(
                                                            (field.value || []).filter(
                                                                (value) => value !== item.id
                                                            )
                                                        )
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {item.label}
                                        </FormLabel>
                                    </FormItem>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">Crear Instructor</Button>
            </form>
        </Form>
    );
}
