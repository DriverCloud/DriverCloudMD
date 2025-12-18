'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function getRevenueData() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Get payments from last 6 months
    const sixMonthsAgo = subMonths(new Date(), 6)

    const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date, payment_method')
        .gte('payment_date', format(sixMonthsAgo, 'yyyy-MM-dd'))
        .order('payment_date', { ascending: true })

    // Group by month
    const monthlyRevenue: Record<string, number> = {}
    payments?.forEach(payment => {
        const month = format(new Date(payment.payment_date), 'MMM yyyy')
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(payment.amount)
    })

    return {
        success: true,
        data: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
            month,
            revenue
        }))
    }
}

export async function getPaymentMethodStats() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: payments } = await supabase
        .from('payments')
        .select('payment_method, amount')

    // Group by payment method
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

export async function getClassStats() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: appointments } = await supabase
        .from('appointments')
        .select('status, class_type:class_types(name)')

    // Group by status
    const statusCount = {
        scheduled: 0,
        completed: 0,
        cancelled: 0
    }

    // Group by class type
    const classTypeCount: Record<string, number> = {}

    appointments?.forEach(appointment => {
        statusCount[appointment.status as keyof typeof statusCount]++

        const typeName = appointment.class_type?.name || 'Sin tipo'
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

export async function getInstructorPerformance() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: appointments } = await supabase
        .from('appointments')
        .select('instructor:instructors(first_name, last_name), status')
        .eq('status', 'completed')

    // Count completed classes per instructor
    const instructorCount: Record<string, number> = {}

    appointments?.forEach(appointment => {
        const name = `${appointment.instructor?.first_name} ${appointment.instructor?.last_name}`
        instructorCount[name] = (instructorCount[name] || 0) + 1
    })

    return {
        success: true,
        data: Object.entries(instructorCount)
            .map(([instructor, classes]) => ({ instructor, classes }))
            .sort((a, b) => b.classes - a.classes)
            .slice(0, 5) // Top 5
    }
}
