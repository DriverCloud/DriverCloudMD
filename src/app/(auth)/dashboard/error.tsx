'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Route Error:', error);
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 mb-6">
                <AlertTriangle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Algo salió mal</h2>
            <p className="text-muted-foreground max-w-[500px] mb-8">
                No pudimos cargar esta sección del panel. Puede ser un problema temporal de conexión con la base de datos o un error inesperado al procesar la información.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" /> Intentar nuevamente
                </Button>
            </div>
        </div>
    );
}
