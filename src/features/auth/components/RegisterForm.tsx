"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Eye, Loader2, Car, AlertCircle, CheckCircle2 } from "lucide-react"

const formSchema = z.object({
    fullName: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Por favor ingresa un email válido.",
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
})

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function RegisterForm({ className, ...props }: RegisterFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<boolean>(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()

            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.fullName,
                    }
                }
            })

            if (error) {
                console.error(error)
                setError(error.message || "Error al crear la cuenta.")
                setIsLoading(false)
                return
            }

            // Setup successful - check if session exists (auto-login) or email confirmation needed
            if (data.session) {
                router.push("/dashboard")
                router.refresh()
            } else {
                // Email confirmation required
                setSuccess(true)
                setIsLoading(false)
            }

        } catch (err) {
            setError("Ocurrió un error inesperado al registrarse.")
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className={cn("grid gap-6 text-center", className)} {...props}>
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">¡Cuenta creada!</h2>
                    <p className="text-muted-foreground">
                        Hemos enviado un enlace de confirmación a tu correo electrónico.
                        Por favor verifica tu bandeja de entrada para activar tu cuenta.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="mt-4 w-full">
                            Volver al inicio de sesión
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("grid gap-0", className)} {...props}>
            {/* Logo & Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-8 text-primary">
                    <Car className="h-10 w-10" />
                    <span className="text-2xl font-bold tracking-tight text-foreground">DriverCloudMD</span>
                </div>
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                    Crear una cuenta
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                    Ingresa tus datos para comenzar a gestionar tu autoescuela.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Full Name Field */}
                    <div>
                        <Label htmlFor="fullName" className="block text-base font-medium leading-6 text-foreground">
                            Nombre completo
                        </Label>
                        <div className="mt-2">
                            <Input
                                id="fullName"
                                placeholder="Juan Pérez"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                autoCorrect="off"
                                disabled={isLoading}
                                className="block w-full rounded-lg border border-input bg-transparent py-3.5 px-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary h-auto"
                                {...register("fullName")}
                            />
                            {errors.fullName && (
                                <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Email Field */}
                    <div>
                        <Label htmlFor="email" className="block text-base font-medium leading-6 text-foreground">
                            Correo electrónico
                        </Label>
                        <div className="mt-2">
                            <Input
                                id="email"
                                placeholder="tu@email.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                className="block w-full rounded-lg border border-input bg-transparent py-3.5 px-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary h-auto"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <Label htmlFor="password" className="block text-base font-medium leading-6 text-foreground">
                            Contraseña
                        </Label>

                        <div className="mt-2 relative rounded-lg shadow-sm">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                autoCapitalize="none"
                                autoComplete="new-password"
                                disabled={isLoading}
                                className="block w-full rounded-lg border border-input bg-transparent py-3.5 pl-4 pr-12 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary h-auto"
                                {...register("password")}
                            />
                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <Eye className="h-5 w-5" />
                            </div>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                {/* Primary Button */}
                <div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full justify-center rounded-lg bg-primary px-3 py-3.5 text-base font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors h-auto"
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        )}
                        Crear cuenta
                    </Button>
                </div>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-input text-center">
                <p className="text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    )
}
