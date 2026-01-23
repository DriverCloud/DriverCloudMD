import {
    getFinancialData,
    getPaymentMethodStats,
    getClassStats,
    getInstructorPerformance,
    getConversionStats,
    getInstructorRatings,
    getVehicleEfficiency,
    getLocations,
    getHeatmapData,
    getKPIData,
    getExpensesByCategory
} from './actions'
import { RevenueChart } from './components/RevenueChart'
import { PaymentMethodChart } from './components/PaymentMethodChart'
import { ClassStatsChart } from './components/ClassStatsChart'
import { ConversionFunnel } from './components/ConversionFunnel'
import { InstructorRatingChart } from './components/InstructorRatingChart'
import { VehicleEfficiencyChart } from './components/VehicleEfficiencyChart'
import { HeatmapChart } from './components/HeatmapChart'
import { ExpenseBreakdownChart } from './components/ExpenseBreakdownChart'
import { ReportFilters } from './components/ReportFilters'
import { DashboardContent } from './components/DashboardContent'
import { BarChart3, TrendingUp, Users, Calendar, Wallet, PieChart as PieChartIcon, TrendingDown, Star, Car, Activity, CheckCircle, Clock } from 'lucide-react'
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
        locationResult,
        heatmapResult,
        kpiResult,
        expenseResult
    ] = await Promise.all([
        getFinancialData(filters),
        getPaymentMethodStats(filters),
        getClassStats(filters),
        getInstructorPerformance(filters),
        getConversionStats(filters),
        getInstructorRatings(filters),
        getVehicleEfficiency(filters),
        getLocations(),
        getHeatmapData(filters),
        getKPIData(filters),
        getExpensesByCategory(filters)
    ])

    const financialData = financialResult.success && financialResult.data ? financialResult.data : []
    const paymentMethodData = paymentMethodResult.success && paymentMethodResult.data ? paymentMethodResult.data : []
    const classStats = classStatsResult.success && classStatsResult.data ? classStatsResult.data : { byStatus: [], byType: [] }
    const instructorData = instructorResult.success && instructorResult.data ? instructorResult.data : []
    const conversionData = conversionResult.success && conversionResult.data ? conversionResult.data : []
    const ratingData = ratingResult.success && ratingResult.data ? ratingResult.data : []
    const vehicleData = vehicleResult.success && vehicleResult.data ? vehicleResult.data : []
    const locations = locationResult.success && locationResult.data ? locationResult.data : []
    const heatmapData = heatmapResult.success && heatmapResult.data ? heatmapResult.data : []
    const kpiData = kpiResult.success && kpiResult.data ? kpiResult.data : { approvalRate: 0, ltv: 0, occupancyRate: 0, totalGraduated: 0, totalFailed: 0 }
    const expenseData = expenseResult.success && expenseResult.data ? expenseResult.data : []

    // Calculate totals
    const totalIncome = financialData.reduce((sum: number, item: any) => sum + (item.income || 0), 0)
    const totalExpenses = financialData.reduce((sum: number, item: any) => sum + (item.expenses || 0), 0)
    const netProfit = totalIncome - totalExpenses

    const totalClasses = (classStats.byStatus || []).reduce((sum, item) => sum + (item.count || 0), 0)

    const isFiltered = !!filters.startDate || !!filters.endDate || !!filters.locationId

    const data = {
        financialData,
        paymentMethodData,
        classStats,
        instructorData,
        conversionData,
        ratingData,
        vehicleData,
        heatmapData,
        kpiData,
        expenseData,
        totals: {
            totalIncome,
            totalExpenses,
            netProfit,
            totalClasses
        },
        isFiltered
    }

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

            {/* Dashboard Content Client Component for Customization */}
            <DashboardContent data={data} />
        </div>
    )
}

