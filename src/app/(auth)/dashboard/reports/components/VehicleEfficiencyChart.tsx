'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface VehicleEfficiencyChartProps {
    data: Array<{ name: string; classes: number; maintenanceCost: number }>
}

export function VehicleEfficiencyChart({ data }: VehicleEfficiencyChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                No hay datos de vehículos para mostrar
            </div>
        )
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis
                        dataKey="name"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                        yAxisId="left"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        label={{ value: 'Clases', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `$${value}`}
                        label={{ value: 'Gasto Mant.', angle: 90, position: 'insideRight', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    <Bar
                        yAxisId="left"
                        name="Clase Realizadas"
                        dataKey="classes"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                    />
                    <Line
                        yAxisId="right"
                        name="Gasto de Mantenimiento"
                        type="monotone"
                        dataKey="maintenanceCost"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
