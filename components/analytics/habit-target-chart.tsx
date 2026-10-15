"use client";
import { monthlyTargetBanckedDTO } from "@/types/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Label, Pie, PieChart } from "recharts"

type TargetPageProps = {
    monthlyTarget: monthlyTargetBanckedDTO
}

const completionChartConfig = {
    value: {
        label: "Completions"
    }
} satisfies ChartConfig

export function TargetChartToday({ monthlyTarget }: TargetPageProps) {

    const completionChartData = monthlyTarget.map(
        (habit, index) => ({
            name: habit.title,
            value: habit.completedCount,
            fill: habit.color
        })
    )
    const totalCompletions = completionChartData.reduce((acc, item) => acc + item.value, 0);


    return (
        <>
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Month Completions</CardTitle>
                    <CardDescription>Total habit completions by category</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-0">
                    <ChartContainer
                        config={completionChartConfig}
                        className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                    >
                        <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={completionChartData}
                                dataKey='value'
                                nameKey='name'
                                innerRadius={65}
                                outerRadius={100}
                                paddingAngle={2}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) - 12}
                                                        className='fill-card-foreground text-lg font-medium'
                                                    >
                                                        {totalCompletions}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 19}
                                                        className='fill-muted-foreground text-sm'
                                                    >
                                                        Total Habits
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>

                    </ChartContainer>
                </CardContent>

                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                        Showing habits completed this month
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}