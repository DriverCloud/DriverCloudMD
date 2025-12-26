"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    description: z.string().min(5, "Descripción requerida"),
    expected_end_date: z.string().optional(),
});

export function MaintenanceForm({ onSubmit, loading }: { onSubmit: (val: any) => void; loading: boolean }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Motivo del Mantenimiento</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Cambio de aceite y filtros..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="expected_end_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha Estimada de Finalización</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Registrar Mantenimiento"}
                </Button>
            </form>
        </Form>
    );
}
