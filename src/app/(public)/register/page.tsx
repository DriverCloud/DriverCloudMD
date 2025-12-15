import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Image from "next/image";

export default function RegisterPage() {
    return (
        <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="hidden lg:block relative h-full w-full bg-slate-900 border-r border-border/40">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
                    alt="DriverCloudMD Dashboard"
                    fill
                    className="object-cover opacity-90 grayscale-[20%]"
                    priority
                />
                <div className="absolute bottom-10 left-10 z-20 max-w-lg">
                    <blockquote className="space-y-2 text-white">
                        <p className="text-lg font-medium leading-relaxed drop-shadow-md">
                            &ldquo;La plataforma que transformó la gestión de nuestra autoescuela. Control total sobre instructores, agenda y finanzas en un solo lugar.&rdquo;
                        </p>
                        <footer className="text-sm font-semibold text-slate-200 mt-4">
                            Sofia Martinez - Directora en Autoescuela Norte
                        </footer>
                    </blockquote>
                </div>
            </div>
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}
