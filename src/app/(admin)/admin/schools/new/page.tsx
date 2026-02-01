import { CreateSchoolForm } from "./CreateSchoolForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSchoolPage() {
    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/schools">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Lista
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Nueva Autoescuela</h2>
                <p className="text-muted-foreground">Da de alta un nuevo cliente y genera sus credenciales.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <CreateSchoolForm />
            </div>
        </div>
    );
}
