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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { paymentsService } from "../services/payments.service";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
    student_id: z.string().min(1, "Selecciona un estudiante"),
    amount: z.number().min(1, "El monto debe ser mayor a 0"),
    payment_method: z.string().min(1, "Selecciona método de pago"),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof formSchema>;

export function PaymentModal({ onSuccess }: { onSuccess?: () => void }) {
    const [students, setStudents] = useState<{ id: string, name: string }[]>([]);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            student_id: "",
            amount: 0,
            payment_method: "",
            notes: "",
        },
    });

    useEffect(() => {
        // Fetch students for dropdown
        const fetchStudents = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('students')
                .select('id, first_name, last_name')
                .order('last_name');

            if (data) {
                setStudents(data.map(s => ({
                    id: s.id,
                    name: `${s.last_name}, ${s.first_name}`
                })));
            }
        };
        fetchStudents();
    }, []);

    async function onSubmit(values: PaymentFormValues) {
        try {
            await paymentsService.createPayment(values);
            toast.success("Pago registrado exitosamente");
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast.error("Error al registrar pago");
            console.error(error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="student_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estudiante</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estudiante" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {students.map((student) => (
                                        <SelectItem key={student.id} value={student.id}>
                                            {student.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={event => field.onChange(+event.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="payment_method"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Método de Pago</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="cash">Efectivo</SelectItem>
                                        <SelectItem value="transfer">Transferencia</SelectItem>
                                        <SelectItem value="credit_card">Tarjeta Crédito</SelectItem>
                                        <SelectItem value="debit_card">Tarjeta Débito</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full">Registrar Pago</Button>
            </form>
        </Form>
    );
}
