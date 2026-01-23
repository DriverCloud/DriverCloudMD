'use client';

import { RevenueChart } from './RevenueChart'
import { PaymentMethodChart } from './PaymentMethodChart'
import { ClassStatsChart } from './ClassStatsChart'
import { ConversionFunnel } from './ConversionFunnel'
import { InstructorRatingChart } from './InstructorRatingChart'
import { VehicleEfficiencyChart } from './VehicleEfficiencyChart'
import { HeatmapChart } from './HeatmapChart'
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart'
import { DashboardCustomizer, useDashboardConfig } from './DashboardCustomizer'
import { BarChart3, TrendingUp, Users, Calendar, Wallet, PieChart as PieChartIcon, TrendingDown, Star, Car, Activity, CheckCircle, Clock, Banknote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardContentProps {
    data: any;
}

export function DashboardContent({ data }: DashboardContentProps) {
    const { config, updateConfig, loaded } = useDashboardConfig();

    if (!loaded) return null;

    const {
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
        totals,
        isFiltered
    } = data;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-end">
                <DashboardCustomizer config={config} onConfigChange={updateConfig} />
            </div>

            {/* KPI Cards */}
            {config.showKPIs && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                {isFiltered ? 'Ingresos (Período)' : 'Ingresos (6m)'}
                            </h3>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold">
                            ${totals.totalIncome.toLocaleString()}
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
                            ${totals.totalExpenses.toLocaleString()}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Beneficio Neto</h3>
                            <Wallet className={cn("h-4 w-4", totals.netProfit >= 0 ? "text-emerald-500" : "text-rose-500")} />
                        </div>
                        <div className={cn("text-2xl font-bold", totals.netProfit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                            ${totals.netProfit.toLocaleString()}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Clases Totales</h3>
                            <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">
                            {totals.totalClasses}
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced KPI Cards */}
            {config.showAdvancedKPIs && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Tasa de Aprobación Estimate</h3>
                            <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold">
                                {kpiData.approvalRate.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                                {kpiData.totalGraduated} Graduados / {kpiData.totalGraduated + kpiData.totalFailed} Finalizados
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Valor x Alumno (LTV)</h3>
                            <Banknote className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold">
                            ${Math.round(kpiData.ltv).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Promedio histórico de ingresos por alumno
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Ocupación Estimada</h3>
                            <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold">
                            {kpiData.occupancyRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Basado en capacidad teórica vs clases reales
                        </p>
                    </div>
                </div>
            )}

            {/* Main Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Financial Comparison Chart */}
                {config.showFinancialChart && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Ingresos vs Gastos</h3>
                        </div>
                        <RevenueChart data={financialData} />
                    </div>
                )}

                {/* Expense Breakdown (New) */}
                {config.showExpenseBreakdown && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Desglose de Gastos</h3>
                        </div>
                        <ExpenseBreakdownChart data={expenseData} />
                    </div>
                )}

                {/* Conversion Funnel */}
                {config.showConversionFunnel && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Embudo de Alumnos</h3>
                        </div>
                        <ConversionFunnel data={conversionData} />
                    </div>
                )}

                {/* Heatmap (New) */}
                {config.showHeatmap && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Mapa de Calor (Horarios)</h3>
                        </div>
                        <HeatmapChart data={heatmapData} />
                    </div>
                )}
            </div>

            {/* Quality and Efficiency Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Instructor Ratings */}
                {config.showInstructorRatings && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <h3 className="text-lg font-semibold">Satisfacción de Instructores</h3>
                        </div>
                        <InstructorRatingChart data={ratingData} />
                    </div>
                )}

                {/* Vehicle Efficiency */}
                {config.showVehicleEfficiency && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Car className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Uso vs Gasto de Vehículos</h3>
                        </div>
                        <VehicleEfficiencyChart data={vehicleData} />
                    </div>
                )}
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Payment Method Chart */}
                {config.showPaymentMethods && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Métodos de Pago</h3>
                        </div>
                        <PaymentMethodChart data={paymentMethodData} />
                    </div>
                )}

                {/* Class Stats */}
                {config.showClassStats && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-6">Estado de Clases</h3>
                        <ClassStatsChart data={classStats.byStatus} />
                    </div>
                )}

                {/* Instructor Volume */}
                {config.showInstructorVolume && (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Volumen por Instructor</h3>
                        </div>
                        <div className="space-y-4">
                            {instructorData.length > 0 ? (
                                instructorData.map((instructor: any, index: number) => (
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
                )}
            </div>

            {/* Class Types Table */}
            {config.showClassTypes && (
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
                                    (classStats.byType || []).map((type: any, index: number) => (
                                        <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{type.type}</td>
                                            <td className="p-4 align-middle text-right font-bold">{type.count}</td>
                                            <td className="p-4 align-middle text-right">
                                                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                                                    {totals.totalClasses > 0 ? `${((type.count / totals.totalClasses) * 100).toFixed(1)}%` : '0%'}
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
            )}
        </div>
    )
}
