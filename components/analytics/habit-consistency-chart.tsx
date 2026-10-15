'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { habitConsistencyChartBackendDTO } from '@/types/types'
import { TrendingUp } from 'lucide-react'


type ConsistencyChartProps = {
    chartData: habitConsistencyChartBackendDTO
}

const habitInsightsChartConfig = {
    consistency: {
        label: "Consistency",
        color: "var(--chart-2)",
    }
} satisfies ChartConfig

export function HabitConsistencyChart({ chartData }: ConsistencyChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Consistency Graph</CardTitle>
                <CardDescription>Last 2 weeks</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={habitInsightsChartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Bar dataKey="consistency" fill="var(--color-consistency)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Showing your consistency our the habits
                </div>
            </CardFooter>
        </Card>
    )
}

