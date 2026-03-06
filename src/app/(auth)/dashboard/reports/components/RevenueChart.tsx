'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RevenueChartProps {
    data: Array<{ month: string; income: number; expenses: number; projectedIncome?: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">
                No hay datos financieros para mostrar
            </div>
        )
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis
                        dataKey="month"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: any, name?: string) => {
                            let label = 'Ingresos'
                            if (name === 'expenses') label = 'Gastos'
                            if (name === 'projectedIncome') label = 'Ing. Proyectados'
                            return [`$${Number(value).toLocaleString()}`, label]
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                        formatter={(value) => {
                            if (value === 'income') return 'Ingresos'
                            if (value === 'expenses') return 'Gastos'
                            if (value === 'projectedIncome') return 'Proyección'
                            return value
                        }}
                    />
                    <Bar name="income" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar name="expenses" dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" name="projectedIncome" dataKey="projectedIncome" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}

