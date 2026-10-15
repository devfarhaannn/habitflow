'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { habitCategoryChartBackendDTO } from '@/types/types'
import { TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

type CategoryChartProps = {
    chartData: habitCategoryChartBackendDTO
}

// const data = [
//     { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
//     { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
//     { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
//     { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
//     { browser: "other", visitors: 90, fill: "var(--color-other)" },
// ]

// const data1 = [
//     {
//         "category": "Health",
//         "completions": 251
//     },
//     {
//         "category": "Learning",
//         "completions": 60
//     },
//     {
//         "category": "Productivity",
//         "completions": 156
//     }
// ]

const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)"
]

const categoryChartConfig = {
    completions: {
        label: "Completions"
    }
} satisfies ChartConfig

export function CategoryChart({ chartData }: CategoryChartProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Categories Distribution</CardTitle>
                <CardDescription>Total habit completions by category</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={categoryChartConfig}
                    className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey='category' />} />
                        <Pie data={chartData} dataKey="completions" label nameKey="completions" >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Showing habit completion distribution
                </div>
            </CardFooter>
        </Card>
    )
}

