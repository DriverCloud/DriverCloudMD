import { getRevenueData, getPaymentMethodStats, getClassStats, getInstructorPerformance } from './actions'
import { RevenueChart } from './components/RevenueChart'
import { PaymentMethodChart } from './components/PaymentMethodChart'
import { ClassStatsChart } from './components/ClassStatsChart'
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react'

export default async function ReportsPage() {
    const [revenueResult, paymentMethodResult, classStatsResult, instructorResult] = await Promise.all([
        getRevenueData(),
        getPaymentMethodStats(),
        getClassStats(),
        getInstructorPerformance()
    ])

    const revenueData = revenueResult.success ? revenueResult.data : []
    const paymentMethodData = paymentMethodResult.success ? paymentMethodResult.data : []
    const classStats = classStatsResult.success ? classStatsResult.data : { byStatus: [], byType: [] }
    const instructorData = instructorResult.success ? instructorResult.data : []

    // Calculate totals
    const totalRevenue = paymentMethodData.reduce((sum, item) => sum + item.total, 0)
    const totalClasses = classStats.byStatus.reduce((sum, item) => sum + item.count, 0)
    const completedClasses = classStats.byStatus.find(s => s.status === 'Completadas')?.count || 0

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
                <p className="text-muted-foreground">Estadísticas y métricas del negocio.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Ingresos Totales</h3>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        ${totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Últimos 6 meses
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Clases</h3>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                        {totalClasses}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Todas las clases
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Clases Completadas</h3>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        {completedClasses}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {totalClasses > 0 ? `${((completedClasses / totalClasses) * 100).toFixed(1)}% del total` : '0%'}
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Tasa de Éxito</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {totalClasses > 0 ? `${((completedClasses / totalClasses) * 100).toFixed(1)}%` : '0%'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Clases completadas
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Revenue Chart */}
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Ingresos Mensuales</h3>
                    <RevenueChart data={revenueData} />
                </div>

                {/* Payment Method Chart */}
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Métodos de Pago</h3>
                    <PaymentMethodChart data={paymentMethodData} />
                </div>

                {/* Class Stats Chart */}
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Estado de Clases</h3>
                    <ClassStatsChart data={classStats.byStatus} />
                </div>

                {/* Instructor Performance */}
                <div className="rounded-lg border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Instructores</h3>
                    <div className="space-y-4">
                        {instructorData.length > 0 ? (
                            instructorData.map((instructor, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">{instructor.instructor}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {instructor.classes} clases
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-8">
                                No hay datos de instructores
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Class Types Table */}
            <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Tipos de Clase</h3>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Cantidad</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {classStats.byType.length > 0 ? (
                                classStats.byType.map((type, index) => (
                                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{type.type}</td>
                                        <td className="p-4 align-middle text-right">{type.count}</td>
                                        <td className="p-4 align-middle text-right text-muted-foreground">
                                            {totalClasses > 0 ? `${((type.count / totalClasses) * 100).toFixed(1)}%` : '0%'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                        No hay datos de tipos de clase
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
