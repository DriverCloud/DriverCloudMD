export default function StudentDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Mi Progreso</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium">Clases Restantes</div>
                    <div className="text-2xl font-bold">8 / 10</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium">Próxima Clase</div>
                    <div className="text-2xl font-bold text-muted-foreground text-sm mt-2">Sin agendar</div>
                </div>
            </div>
        </div>
    );
}
