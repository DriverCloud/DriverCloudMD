"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Eye, Loader2, Car, AlertCircle } from "lucide-react"

const formSchema = z.object({
    email: z.string().email({
        message: "Por favor ingresa un email válido.",
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
})

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function LoginForm({ className, ...props }: LoginFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })

            if (error) {
                console.error(error)
                setError("Credenciales inválidas. Por favor intenta de nuevo.")
                setIsLoading(false)
                return
            }

            // Login successful, redirect handled by router or middleware
            router.push("/dashboard")
            router.refresh()
        } catch (err) {
            setError("Ocurrió un error inesperado al iniciar sesión.")
            setIsLoading(false)
        }
    }

    // Demo Login Handler
    async function handleDemoLogin() {
        setIsLoading(true)
        setError(null)

        // Attempt anonymous login for demo access if enabled in Supabase
        // If not enabled, this will fail, prompting user to ask Admin (you) to check settings.
        const supabase = createClient()
        const { error } = await supabase.auth.signInAnonymously()

        if (error) {
            // Fallback or Error message
            console.error("Anonymous auth error:", error)
            setError("El modo Demo no está activo. Por favor ingresa con credenciales reales.")
            setIsLoading(false)
        } else {
            router.push("/dashboard")
            router.refresh()
        }
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
                    Bienvenido de nuevo
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                    Ingresa tus credenciales para acceder al panel.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-6">
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
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="block text-base font-medium leading-6 text-foreground">
                                Contraseña
                            </Label>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-blue-600">
                                    ¿Olvidé mi contraseña?
                                </a>
                            </div>
                        </div>

                        <div className="mt-2 relative rounded-lg shadow-sm">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                autoCapitalize="none"
                                autoComplete="current-password"
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
                        Ingresar
                    </Button>
                </div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                    <span className="bg-background px-6 text-muted-foreground">
                        O
                    </span>
                </div>
            </div>

            {/* Secondary Demo Button (Now uses Anonymous Auth if enabled, or Errors) */}
            <div>
                <Button
                    variant="outline"
                    type="button"
                    disabled={isLoading}
                    onClick={handleDemoLogin}
                    className="flex w-full justify-center rounded-lg bg-emerald-600 px-3 py-3.5 text-base font-semibold leading-6 text-white shadow-sm hover:bg-emerald-500 border-transparent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors h-auto"
                >
                    Ingresar como Demo
                </Button>
            </div>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-input text-center">
                <p className="text-sm text-muted-foreground mb-4">
                    ¿No tienes cuenta?{" "}
                    <a href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        Regístrate aquí
                    </a>
                </p>
                <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors">Términos y Condiciones</a>
                    <span className="text-muted-foreground/50">|</span>
                    <a href="#" className="hover:text-foreground transition-colors">Soporte</a>
                </div>
            </div>
        </div>
    )
}
