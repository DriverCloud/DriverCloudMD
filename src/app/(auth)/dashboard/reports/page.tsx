import {
    getFinancialData,
    getPaymentMethodStats,
    getClassStats,
    getInstructorPerformance,
    getConversionStats,
    getInstructorRatings,
    getVehicleEfficiency,
    getLocations
} from './actions'
import { RevenueChart } from './components/RevenueChart'
import { PaymentMethodChart } from './components/PaymentMethodChart'
import { ClassStatsChart } from './components/ClassStatsChart'
import { ConversionFunnel } from './components/ConversionFunnel'
import { InstructorRatingChart } from './components/InstructorRatingChart'
import { VehicleEfficiencyChart } from './components/VehicleEfficiencyChart'
import { ReportFilters } from './components/ReportFilters'
import { BarChart3, TrendingUp, Users, Calendar, Wallet, PieChart as PieChartIcon, TrendingDown, Star, Car } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ReportsPage({ searchParams }: PageProps) {
    const params = await searchParams

    const filters = {
        startDate: params.startDate as string,
        endDate: params.endDate as string,
        locationId: params.locationId as string
    }

    const [
        financialResult,
        paymentMethodResult,
        classStatsResult,
        instructorResult,
        conversionResult,
        ratingResult,
        vehicleResult,
        locationResult
    ] = await Promise.all([
        getFinancialData(filters),
        getPaymentMethodStats(filters),
        getClassStats(filters),
        getInstructorPerformance(filters),
        getConversionStats(filters),
        getInstructorRatings(filters),
        getVehicleEfficiency(filters),
        getLocations()
    ])

    const financialData = financialResult.success && financialResult.data ? financialResult.data : []
    const paymentMethodData = paymentMethodResult.success && paymentMethodResult.data ? paymentMethodResult.data : []
    const classStats = classStatsResult.success && classStatsResult.data ? classStatsResult.data : { byStatus: [], byType: [] }
    const instructorData = instructorResult.success && instructorResult.data ? instructorResult.data : []
    const conversionData = conversionResult.success && conversionResult.data ? conversionResult.data : []
    const ratingData = ratingResult.success && ratingResult.data ? ratingResult.data : []
    const vehicleData = vehicleResult.success && vehicleResult.data ? vehicleResult.data : []
    const locations = locationResult.success && locationResult.data ? locationResult.data : []

    // Calculate totals
    const totalIncome = financialData.reduce((sum: number, item: any) => sum + (item.income || 0), 0)
    const totalExpenses = financialData.reduce((sum: number, item: any) => sum + (item.expenses || 0), 0)
    const netProfit = totalIncome - totalExpenses

    const totalClasses = (classStats.byStatus || []).reduce((sum, item) => sum + (item.count || 0), 0)

    const isFiltered = !!filters.startDate || !!filters.endDate || !!filters.locationId

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
                    <p className="text-muted-foreground">Monitorea la salud financiera y el rendimiento de tu escuela.</p>
                </div>
            </div>

            {/* Global Filters */}
            <ReportFilters locations={locations} />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            {isFiltered ? 'Ingresos (Período)' : 'Ingresos (6m)'}
                        </h3>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        ${totalIncome.toLocaleString()}
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            {isFiltered ? 'Gastos (Período)' : 'Gastos (6m)'}
                        </h3>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        ${totalExpenses.toLocaleString()}
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Beneficio Neto</h3>
                        <Wallet className={cn("h-4 w-4", netProfit >= 0 ? "text-emerald-500" : "text-rose-500")} />
                    </div>
                    <div className={cn("text-2xl font-bold", netProfit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        ${netProfit.toLocaleString()}
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Clases Totales</h3>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {totalClasses}
                    </div>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Financial Comparison Chart */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Ingresos vs Gastos</h3>
                    </div>
                    <RevenueChart data={financialData} />
                </div>

                {/* Conversion Funnel */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Embudo de Alumnos</h3>
                    </div>
                    <ConversionFunnel data={conversionData} />
                </div>
            </div>

            {/* Quality and Efficiency Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Instructor Ratings */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <h3 className="text-lg font-semibold">Satisfacción de Instructores</h3>
                    </div>
                    <InstructorRatingChart data={ratingData} />
                </div>

                {/* Vehicle Efficiency */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Car className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Uso vs Gasto de Vehículos</h3>
                    </div>
                    <VehicleEfficiencyChart data={vehicleData} />
                </div>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Payment Method Chart */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Métodos de Pago</h3>
                    </div>
                    <PaymentMethodChart data={paymentMethodData} />
                </div>

                {/* Class Stats */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Estado de Clases</h3>
                    <ClassStatsChart data={classStats.byStatus} />
                </div>

                {/* Instructor Volume */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Volumen por Instructor</h3>
                    </div>
                    <div className="space-y-4">
                        {instructorData.length > 0 ? (
                            instructorData.map((instructor, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-sm">{instructor.instructor}</span>
                                    </div>
                                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
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
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Tipos de Clase</h3>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo de Clase</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Cantidad</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {(classStats.byType || []).length > 0 ? (
                                (classStats.byType || []).map((type, index) => (
                                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{type.type}</td>
                                        <td className="p-4 align-middle text-right font-bold">{type.count}</td>
                                        <td className="p-4 align-middle text-right">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                                                {totalClasses > 0 ? `${((type.count / totalClasses) * 100).toFixed(1)}%` : '0%'}
                                            </span>
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

