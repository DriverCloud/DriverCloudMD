'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ConversionFunnelProps {
    data: Array<{ id: string; label: string; count: number }>
}

const COLORS: Record<string, string> = {
    active: 'hsl(var(--primary))',
    paused: '#f59e0b',
    finished: '#3b82f6',
    graduated: '#10b981',
    failed: '#ef4444',
    abandoned: '#6b7280'
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">
                No hay datos de alumnos
            </div>
        )
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="label"
                        type="category"
                        width={100}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                        }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.id] || 'hsl(var(--primary))'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
