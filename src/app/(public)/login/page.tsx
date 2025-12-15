import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Bienvenido de nuevo
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ingresa tu email y contraseña para continuar
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
