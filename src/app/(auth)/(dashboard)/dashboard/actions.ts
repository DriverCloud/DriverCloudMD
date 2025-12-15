'use server'

import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
    const supabase = await createClient();
    const today = new Date();

    // 1. Calculate Monthly Revenue (Last 6 months)
    // Supabase lacking 'date_trunc' easy access via JS client without RPC or raw SQL for grouping usually.
    // For MVP, we'll fetch payments from last 6 months and process in JS (assuming low volume).

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of that month

    const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .gte('payment_date', sixMonthsAgo.toISOString())
        .eq('payment_status', 'completed');

    // Process payments for Chart
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const revenueByMonth = new Map<string, number>();

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        const key = monthNames[d.getMonth()];
        revenueByMonth.set(key, 0);
    }

    if (payments) {
        payments.forEach(p => {
            const date = new Date(p.payment_date);
            const key = monthNames[date.getMonth()];
            if (revenueByMonth.has(key)) {
                revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + Number(p.amount));
            }
        });
    }

    const revenueChartData = Array.from(revenueByMonth.entries()).map(([name, total]) => ({ name, total }));

    // 2. Weekly Class Activity (Last 7 days or This Week)
    // Let's look at upcoming 7 days or past 7 days? Usually "Activity" implies past/current trend.
    // Let's show "Classes by Day of Week" based on *Scheduled* or *Completed* appointments in the last 30 days to show "busy days".
    // Or just "Upcoming Week Load".
    // Let's go with "Busy Days Pattern" (aggregating last 30 days of activity to show which days are popular).

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const { data: appointments } = await supabase
        .from('appointments')
        .select('scheduled_date')
        .gte('scheduled_date', thirtyDaysAgo.toISOString());

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const activityByDay = new Map<string, number>();
    daysOfWeek.forEach(d => activityByDay.set(d, 0));

    if (appointments) {
        appointments.forEach(a => {
            const date = new Date(a.scheduled_date + 'T12:00:00'); // Fix TZ issues
            // Note: scheduled_date is YYYY-MM-DD. standard new Date() might imply UTC midnight -> prev day in local.
            // Safest: parse manually or add time.
            const dayIndex = date.getDay();
            const key = daysOfWeek[dayIndex];
            activityByDay.set(key, (activityByDay.get(key) || 0) + 1);
        });
    }

    // Sort Monday to Sunday
    const sortedDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const activityChartData = sortedDays.map(day => ({
        name: day,
        classes: activityByDay.get(day) || 0
    }));

    // 3. Current Month Totals
    const currentMonthRevenue = revenueByMonth.get(monthNames[today.getMonth()]) || 0;

    // Calculate vs previous month
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(today.getMonth() - 1);
    const prevMonthRevenue = revenueByMonth.get(monthNames[prevMonthDate.getMonth()]) || 0;

    let revenueTrend = 0;
    if (prevMonthRevenue > 0) {
        revenueTrend = Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
    } else if (currentMonthRevenue > 0) {
        revenueTrend = 100; // 100% growth if prev was 0
    }

    return {
        revenueChartData,
        activityChartData,
        currentMonthRevenue,
        revenueTrend
    };
}
