'use server'

import { createClient } from '@/lib/supabase/server'
import { addDays, format } from 'date-fns'

export async function getNotifications() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const notifications: any[] = []
    const now = new Date()
    const tomorrow = addDays(now, 1)

    // Get upcoming classes (next 24 hours)
    const { data: upcomingClasses } = await supabase
        .from('appointments')
        .select(`
            id,
            scheduled_date,
            start_time,
            student:students(first_name, last_name),
            instructor:instructors(first_name, last_name)
        `)
        .eq('status', 'scheduled')
        .gte('scheduled_date', format(now, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(tomorrow, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5)

    if (upcomingClasses) {
        upcomingClasses.forEach(appointment => {
            notifications.push({
                id: `class-${appointment.id}`,
                type: 'class',
                title: 'Clase Próxima',
                message: `${appointment.student?.first_name} ${appointment.student?.last_name} - ${appointment.start_time.slice(0, 5)}`,
                time: appointment.scheduled_date === format(now, 'yyyy-MM-dd') ? 'Hoy' : 'Mañana',
                read: false
            })
        })
    }

    // Get students with pending payments (negative balance)
    const { data: pendingPayments } = await supabase
        .from('students')
        .select('id, first_name, last_name, balance')
        .lt('balance', 0)
        .eq('status', 'active')
        .order('balance', { ascending: true })
        .limit(5)

    if (pendingPayments) {
        pendingPayments.forEach(student => {
            notifications.push({
                id: `payment-${student.id}`,
                type: 'payment',
                title: 'Pago Pendiente',
                message: `${student.first_name} ${student.last_name} debe $${Math.abs(student.balance).toLocaleString()}`,
                time: 'Pendiente',
                read: false
            })
        })
    }

    // Sort by type priority (classes first, then payments)
    notifications.sort((a, b) => {
        if (a.type === 'class' && b.type !== 'class') return -1
        if (a.type !== 'class' && b.type === 'class') return 1
        return 0
    })

    return notifications.slice(0, 10) // Limit to 10 total
}
