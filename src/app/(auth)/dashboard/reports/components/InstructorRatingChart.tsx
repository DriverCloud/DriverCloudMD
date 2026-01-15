'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Star } from 'lucide-react'

interface InstructorRatingChartProps {
    data: Array<{ name: string; rating: number; count: number }>
}

export function InstructorRatingChart({ data }: InstructorRatingChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                No hay evaluaciones suficientes para generar el ranking
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
                    <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
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
                        formatter={(value: any) => [
                            <span key="val" className="flex items-center gap-1">
                                {value} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            </span>,
                            'Calificación'
                        ]}
                    />
                    <Bar dataKey="rating" radius={[0, 4, 4, 0]} barSize={25}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.rating >= 4 ? '#10b981' : entry.rating >= 3 ? '#f59e0b' : '#ef4444'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
