import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Command } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, loginAsDemo } from "./actions";

export const metadata: Metadata = {
    title: "Login - DriverCloudMD",
    description: "Acceda a su cuenta de DriverCloudMD",
};

interface LoginPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const error = params.error as string;

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="absolute inset-0">
                    {/* Placeholder image from Unsplash - driving school related */}
                    <Image
                        src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
                        alt="Driving School"
                        fill
                        className="object-cover opacity-50"
                        priority
                    />
                </div>
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Command className="mr-2 h-6 w-6" />
                    DriverCloudMD
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Gestiona tu escuela con la confianza de un experto. DriverCloudMD ha transformado la manera en que administramos nuestros instructores y alumnos.&rdquo;
                        </p>
                        <footer className="text-sm">Roberto Gómez, Director de AutoEscuela Quilmes</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Bienvenido de nuevo
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ingresa tus credenciales para acceder al panel.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
                            {error}
                        </div>
                    )}

                    <div className={cn("grid gap-6")}>
                        <form action={login}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        placeholder="nombre@ejemplo.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                                <Button type="submit" className="w-full">
                                    Ingresar
                                </Button>
                            </div>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    O
                                </span>
                            </div>
                        </div>
                        <form action={loginAsDemo}>
                            <Button type="submit" variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                                Ingresar como Demo
                            </Button>
                        </form>
                    </div>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Al hacer clic en continuar, aceptas nuestros{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Términos de servicio
                        </Link>{" "}
                        y{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Política de privacidad
                        </Link>
                        .
                    </p>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        ¿No tienes cuenta?{" "}
                        <Link
                            href="/register"
                            className="underline underline-offset-4 hover:text-primary text-emerald-600"
                        >
                            Regístrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
