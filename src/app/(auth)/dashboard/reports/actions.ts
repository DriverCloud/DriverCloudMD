'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export interface ReportFilters {
    startDate?: string
    endDate?: string
    locationId?: string
}

export async function getLocations() {
    const supabase = await createClient()
    const { data: locations } = await supabase.from('locations').select('id, name').order('name')
    return { success: true, data: locations || [] }
}

export async function getFinancialData(filters?: ReportFilters) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const defStartDate = filters?.startDate || format(subMonths(new Date(), 6), 'yyyy-MM-dd')
    const defEndDate = filters?.endDate || format(new Date(), 'yyyy-MM-dd')

    let paymentsQuery = supabase.from('payments').select('amount, payment_date').gte('payment_date', defStartDate).lte('payment_date', defEndDate)
    let expensesQuery = supabase.from('expenses').select('amount, date').gte('date', defStartDate).lte('date', defEndDate)

    if (filters?.locationId) {
        paymentsQuery = paymentsQuery.eq('location_id', filters.locationId)
        expensesQuery = expensesQuery.eq('location_id', filters.locationId)
    }

    const [paymentsResponse, expensesResponse] = await Promise.all([
        paymentsQuery,
        expensesQuery
    ])

    const payments = paymentsResponse.data || []
    const expenses = expensesResponse.data || []

    const monthlyData: Record<string, { income: number, expenses: number }> = {}

    payments.forEach(p => {
        const month = format(new Date(p.payment_date), 'MMM yyyy')
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 }
        monthlyData[month].income += Number(p.amount)
    })

    expenses.forEach(e => {
        const month = format(new Date(e.date), 'MMM yyyy')
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 }
        monthlyData[month].expenses += Number(e.amount)
    })

    return {
        success: true,
        data: Object.entries(monthlyData).map(([month, totals]) => ({
            month,
            ...totals
        })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    }
}

export async function getConversionStats(filters?: ReportFilters) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    let query = supabase.from('students').select('status')

    if (filters?.locationId) {
        query = query.eq('location_id', filters.locationId)
    }

    if (filters?.startDate) query = query.gte('created_at', filters.startDate)
    if (filters?.endDate) query = query.lte('created_at', filters.endDate + 'T23:59:59')

    const { data: students } = await query

    const statusCounts: Record<string, number> = {
        active: 0,
        paused: 0,
        finished: 0,
        graduated: 0,
        failed: 0,
        abandoned: 0
    }

    students?.forEach(s => {
        if (s.status in statusCounts) {
            statusCounts[s.status]++
        }
    })

    return {
        success: true,
        data: [
            { id: 'active', label: 'En Curso', count: statusCounts.active },
            { id: 'paused', label: 'En Pausa', count: statusCounts.paused },
            { id: 'finished', label: 'Finalizado', count: statusCounts.finished },
            { id: 'graduated', label: 'Graduados', count: statusCounts.graduated },
            { id: 'failed', label: 'Reprobados', count: statusCounts.failed },
            { id: 'abandoned', label: 'Abandono', count: statusCounts.abandoned }
        ]
    }
}

export async function getPaymentMethodStats(filters?: ReportFilters) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    let query = supabase.from('payments').select('payment_method, amount')

    if (filters?.locationId) query = query.eq('location_id', filters.locationId)
    if (filters?.startDate) query = query.gte('payment_date', filters.startDate)
    if (filters?.endDate) query = query.lte('payment_date', filters.endDate)

    const { data: payments } = await query

    const methodStats: Record<string, number> = {}
    payments?.forEach(payment => {
        const method = payment.payment_method || 'other'
        methodStats[method] = (methodStats[method] || 0) + Number(payment.amount)
    })

    const methodLabels: Record<string, string> = {
        cash: 'Efectivo',
        card: 'Tarjeta',
        transfer: 'Transferencia',
        mercadopago: 'MercadoPago',
        other: 'Otro'
    }

    return {
        success: true,
        data: Object.entries(methodStats).map(([method, total]) => ({
            method: methodLabels[method] || method,
            total
        }))
    }
}

export async function getClassStats(filters?: ReportFilters) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    let query = supabase.from('appointments').select('status, class_type:class_types(name)')

    if (filters?.locationId) query = query.eq('location_id', filters.locationId)
    if (filters?.startDate) query = query.gte('scheduled_date', filters.startDate)
    if (filters?.endDate) query = query.lte('scheduled_date', filters.endDate)

    const { data: appointments } = await query

    const statusCount = { scheduled: 0, completed: 0, cancelled: 0 }
    const classTypeCount: Record<string, number> = {}

    appointments?.forEach(appointment => {
        if (appointment.status in statusCount) {
            statusCount[appointment.status as keyof typeof statusCount]++
        }

        const classType: any = appointment.class_type
        const typeName = (Array.isArray(classType) ? classType[0]?.name : classType?.name) || 'Sin tipo'
        classTypeCount[typeName] = (classTypeCount[typeName] || 0) + 1
    })

    return {
        success: true,
        data: {
            byStatus: [
                { status: 'Agendadas', count: statusCount.scheduled },
                { status: 'Completadas', count: statusCount.completed },
                { status: 'Canceladas', count: statusCount.cancelled }
            ],
            byType: Object.entries(classTypeCount).map(([type, count]) => ({
                type,
                count
            }))
        }
    }
}

export async function getInstructorPerformance(filters?: ReportFilters) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    let query = supabase.from('appointments')
        .select('instructor:instructors(first_name, last_name), status')
        .eq('status', 'completed')

    if (filters?.locationId) query = query.eq('location_id', filters.locationId)
    if (filters?.startDate) query = query.gte('scheduled_date', filters.startDate)
    if (filters?.endDate) query = query.lte('scheduled_date', filters.endDate)

    const { data: appointments } = await query

    const instructorCount: Record<string, number> = {}
    appointments?.forEach(appointment => {
        const inst: any = appointment.instructor
        const instructor = Array.isArray(inst) ? inst[0] : inst
        const name = instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Desconocido'
        instructorCount[name] = (instructorCount[name] || 0) + 1
    })

    return {
        success: true,
        data: Object.entries(instructorCount)
            .map(([instructor, classes]) => ({ instructor, classes }))
            .sort((a, b) => b.classes - a.classes)
            .slice(0, 5)
    }
}

export async function getInstructorRatings(filters?: ReportFilters) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    let query = supabase.from('class_evaluations')
        .select('rating, instructor:instructors(first_name, last_name)')

    if (filters?.startDate) query = query.gte('created_at', filters.startDate)
    if (filters?.endDate) query = query.lte('created_at', filters.endDate + 'T23:59:59')

    const { data: evaluations } = await query

    const ratings: Record<string, { total: number, count: number }> = {}
    evaluations?.forEach(evalItem => {
        const inst: any = evalItem.instructor
        const instructor = Array.isArray(inst) ? inst[0] : inst
        if (!instructor) return

        const name = `${instructor.first_name} ${instructor.last_name}`
        if (!ratings[name]) ratings[name] = { total: 0, count: 0 }
        ratings[name].total += evalItem.rating
        ratings[name].count++
    })

    return {
        success: true,
        data: Object.entries(ratings)
            .map(([name, stats]) => ({
                name,
                rating: Number((stats.total / stats.count).toFixed(1)),
                count: stats.count
            }))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)
    }
}

export async function getVehicleEfficiency(filters?: ReportFilters) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    let vehicleQuery = supabase.from('vehicles').select('id, brand, model, license_plate')
    if (filters?.locationId) vehicleQuery = vehicleQuery.eq('location_id', filters.locationId)

    const { data: vehicles } = await vehicleQuery
    if (!vehicles) return { success: true, data: [] }

    let usageQuery = supabase.from('appointments').select('vehicle_id').eq('status', 'completed')
    if (filters?.locationId) usageQuery = usageQuery.eq('location_id', filters.locationId)
    if (filters?.startDate) usageQuery = usageQuery.gte('scheduled_date', filters.startDate)
    if (filters?.endDate) usageQuery = usageQuery.lte('scheduled_date', filters.endDate)

    let costsQuery = supabase.from('vehicle_service_records').select('vehicle_id, cost')
    if (filters?.startDate) costsQuery = costsQuery.gte('date', filters.startDate)
    if (filters?.endDate) costsQuery = costsQuery.lte('date', filters.endDate)

    const [usageResult, costsResult] = await Promise.all([usageQuery, costsQuery])

    const usageCount: Record<string, number> = {}
    usageResult.data?.forEach(a => {
        if (a.vehicle_id) usageCount[a.vehicle_id] = (usageCount[a.vehicle_id] || 0) + 1
    })

    const costSum: Record<string, number> = {}
    costsResult.data?.forEach(c => {
        if (c.vehicle_id) costSum[c.vehicle_id] = (costSum[c.vehicle_id] || 0) + Number(c.cost)
    })

    return {
        success: true,
        data: vehicles.map(v => ({
            name: `${v.brand} ${v.model} (${v.license_plate})`,
            classes: usageCount[v.id] || 0,
            maintenanceCost: costSum[v.id] || 0
        })).sort((a, b) => b.classes - a.classes)
    }
}

export async function getHeatmapData(filters?: ReportFilters) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    let query = supabase.from('appointments').select('scheduled_date, start_time').eq('status', 'completed')

    if (filters?.locationId) query = query.eq('location_id', filters.locationId)
    // Default to last 30 days if no date filter to show relevant trends
    const startDate = filters?.startDate || format(subMonths(new Date(), 1), 'yyyy-MM-dd')
    const endDate = filters?.endDate || format(new Date(), 'yyyy-MM-dd')

    query = query.gte('scheduled_date', startDate).lte('scheduled_date', endDate)

    const { data: appointments } = await query

    // Initialize 7 days x 24 hours grid
    const heatmap: number[][] = Array(7).fill(0).map(() => Array(24).fill(0))

    appointments?.forEach(app => {
        const date = new Date(app.scheduled_date + 'T' + app.start_time)
        const day = date.getDay() // 0 = Sunday
        const hour = date.getHours()
        heatmap[day][hour]++
    })

    return {
        success: true,
        data: heatmap
    }
}

export async function getKPIData(filters?: ReportFilters) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // 1. Approval Rate (Graduated vs Failed)
    let studentQuery = supabase.from('students').select('status')
    if (filters?.locationId) studentQuery = studentQuery.eq('location_id', filters.locationId)

    // For KPIs we usually look at all time or a longer period, but respecting filters if present
    if (filters?.startDate) studentQuery = studentQuery.gte('created_at', filters.startDate)
    if (filters?.endDate) studentQuery = studentQuery.lte('created_at', filters.endDate + 'T23:59:59')

    const { data: students } = await studentQuery

    const graduated = students?.filter(s => s.status === 'graduated').length || 0
    const failed = students?.filter(s => s.status === 'failed').length || 0
    const totalFinished = graduated + failed
    const approvalRate = totalFinished > 0 ? (graduated / totalFinished) * 100 : 0

    // 2. LTV (Total Income / Total Paying Students)
    let paymentQuery = supabase.from('payments').select('amount, student_id')
    if (filters?.locationId) paymentQuery = paymentQuery.eq('location_id', filters.locationId)

    const { data: payments } = await paymentQuery
    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
    const uniqueStudents = new Set(payments?.map(p => p.student_id)).size
    const ltv = uniqueStudents > 0 ? totalRevenue / uniqueStudents : 0

    // 3. Occupancy Rate (Estimated)
    // Assume capacity = # Instructors * 6 classes/day * days in period
    // This is a rough estimate.

    const { count: instructorCount } = await supabase.from('instructors').select('*', { count: 'exact', head: true }).eq('active', true)

    let appointmentQuery = supabase.from('appointments').select('id', { count: 'exact' }).neq('status', 'cancelled')
    if (filters?.locationId) appointmentQuery = appointmentQuery.eq('location_id', filters.locationId)
    if (filters?.startDate) appointmentQuery = appointmentQuery.gte('scheduled_date', filters.startDate)
    if (filters?.endDate) appointmentQuery = appointmentQuery.lte('scheduled_date', filters.endDate)

    const { count: classCount } = await appointmentQuery

    // Calculate days in period
    const start = filters?.startDate ? new Date(filters.startDate) : subMonths(new Date(), 1)
    const end = filters?.endDate ? new Date(filters.endDate) : new Date()
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))

    // Theoretical capacity: Instructors * 6 slots * Days
    // If no instructors, avoid division by zero
    const capacity = (instructorCount || 1) * 6 * daysDiff
    const occupancyRate = capacity > 0 ? ((classCount || 0) / capacity) * 100 : 0

    return {
        success: true,
        data: {
            approvalRate,
            ltv,
            occupancyRate,
            totalGraduated: graduated,
            totalFailed: failed
        }
    }
}

export async function getExpensesByCategory(filters?: ReportFilters) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    let query = supabase.from('expenses').select('amount, type')
    if (filters?.locationId) query = query.eq('location_id', filters.locationId)
    if (filters?.startDate) query = query.gte('date', filters.startDate)
    if (filters?.endDate) query = query.lte('date', filters.endDate)

    const { data: expenses } = await query

    const byCategory: Record<string, number> = {}
    expenses?.forEach(e => {
        const type = e.type || 'Otros'
        byCategory[type] = (byCategory[type] || 0) + Number(e.amount)
    })

    return {
        success: true,
        data: Object.entries(byCategory).map(([type, amount]) => ({ name: type, value: amount }))
            .sort((a, b) => b.value - a.value)
    }
}
