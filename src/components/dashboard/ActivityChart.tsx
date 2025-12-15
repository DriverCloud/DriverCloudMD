'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ActivityChartProps {
    data: { name: string; classes: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar
                    dataKey="classes"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-blue-500 dark:fill-blue-400"
                    barSize={40}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
