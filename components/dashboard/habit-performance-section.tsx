'use client'

import { ChartNoAxesCombinedIcon, CirclePercentIcon, User } from 'lucide-react'
import { Bar, BarChart, Label, Pie, PieChart } from 'recharts'
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAuth } from '@/hooks/useAuth'
import { Separator } from '@/components/ui/separator'
import { progressCardData } from '@/public/data/dashboard-data'
import { HabitPerformanceBackendDTO } from '@/types/types'

interface HabitPerformanceSectionProps {
  habitPerformanceData: HabitPerformanceBackendDTO
}

const completionChartConfig = {
  value: {
    label: "Completions"
  }
} satisfies ChartConfig

const barChartConfig = {
  value: {
    label: 'Daily Completions'
  }
} satisfies ChartConfig

const normalizeTo30Days = (backendData: { date: string; value: number }[]) => {
  const today = new Date()

  const dataMap = new Map(
    backendData.map(item => [item.date, item.value])
  )

  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (29 - i))

    const isoDate = date.toISOString().split("T")[0]

    return {
      date: isoDate,
      value: dataMap.get(isoDate) ?? 0
    }
  })
}

export function HabitPerformanceSection({ habitPerformanceData }: HabitPerformanceSectionProps) {
  const { user } = useAuth();
  const planPercentage = habitPerformanceData.consistencyMetrics.percentage;
  const normalizedData = normalizeTo30Days(habitPerformanceData.consistencyMetrics.dailyData ?? [])

  const completionChartData = habitPerformanceData.monthlyTarget.map(
    (habit, index) => ({
      name: habit.title,
      value: habit.completedCount,
      fill: habit.color
    })
  )

  const totalCompletions = completionChartData.reduce((acc, item) => acc + item.value, 0);
  const totalTarget = habitPerformanceData.monthlyTarget.reduce((sum, habit) => sum + habit.toComplete, 0);
  const planCompletionPercentage = totalTarget === 0 ? 0 : Math.round((totalCompletions / totalTarget) * 100);

  return (
    <Card className="col-span-full xl:col-span-2 *:data-[slot=card-content]:space-y-6">
      <CardContent className='space-y-4'>
        <div className='grid gap-6 lg:grid-cols-5'>

          <div className='flex flex-col gap-7 lg:col-span-3'>
            <span className='text-lg font-semibold'>Your Progress Summary</span>
            <div className='flex items-center gap-3'>
              {user?.avatar ?
                <img
                  src='https://cdn.shadcnstudio.com/ss-assets/logo/logo-square.png'
                  className='size-10.5 rounded-lg'
                  alt='logo'
                /> :
                <div className='bg-primary/10 rounded-xl h-10 w-10 flex items-center justify-center'>
                  <User />
                </div>

              }

              <div className='flex flex-col gap-0.5'>
                <span className='text-xl font-medium'>{user?.name}</span>
                <span className='text-muted-foreground text-sm'>{user?.email}</span>
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              {progressCardData.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className='flex items-center gap-3 rounded-md border px-4 py-2'>
                    <Avatar className='size-8.5 rounded-sm'>
                      <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-sm'>
                        <Icon />
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-muted-foreground text-xs font-medium'>{metric.title}</span>
                      <span className='text-lg font-medium'>{habitPerformanceData.summary[metric.key]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Card className='gap-4 py-4 shadow-none lg:col-span-2'>
            <CardHeader className='gap-1'>
              <CardTitle className='text-lg font-semibold'>Monthly Target</CardTitle>
            </CardHeader>

            <CardContent className='px-0'>
              <ChartContainer config={completionChartConfig} className='h-38.5 w-full'>
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={completionChartData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={58}
                    outerRadius={75}
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

            <CardFooter className='justify-between'>
              <span className='text-xl'>Plan completed</span>
              <span className='text-2xl font-medium'>{planCompletionPercentage}%</span>
            </CardFooter>
          </Card>

        </div>

        <Card className='shadow-none'>
          <CardContent className='grid gap-4 px-4 lg:grid-cols-5'>

            <div className='flex flex-col gap-4 text-lg md:col-span-3'>
              <span className='font-medium'>Consistency Trends</span>
              <span className='text-muted-foreground text-wrap'>
                Analyze your habit consistency over time.
              </span>
              <Separator />

              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <ChartNoAxesCombinedIcon className='size-6' />
                  <span className='text-sm font-medium'>7 Days Streak</span>
                  <VerticalCompletion
                    completed={habitPerformanceData.consistencyBar.sevenDayStreak.completed}
                    total={habitPerformanceData.consistencyBar.sevenDayStreak.total}
                  />
                </div>
                <div className='flex items-center gap-2'>
                  <CirclePercentIcon className='size-6' />
                  <span className='text-sm font-medium'>Weekly Performance</span>
                  <VerticalCompletion
                    completed={habitPerformanceData.consistencyBar.weeklyPerformance.completed}
                    total={habitPerformanceData.consistencyBar.weeklyPerformance.total}
                  />
                </div>
              </div>

              <ChartContainer config={barChartConfig} className='h-7.75 w-full'>
                <BarChart
                  accessibilityLayer
                  data={normalizedData}
                  margin={{
                    left: 0,
                    right: 0
                  }}
                  maxBarSize={16}
                >
                  <Bar
                    dataKey='value'
                    fill='var(--primary)'
                    background={{ fill: 'color-mix(in oklab, var(--primary) 10%, transparent)', radius: 12 }}
                    radius={12}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            <div className='flex flex-col justify-center gap-6 lg:col-span-2'>
              <span className='text-lg font-semibold'>Consistency Rate</span>
              <span className='max-lg:5xl text-6xl'>{planPercentage}%</span>
              <span className='text-muted-foreground text-sm'>Consistency Percentage over a month</span>
            </div>

          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

interface VerticalCompletionProps {
  completed: number
  total: number
}

export function VerticalCompletion({
  completed,
  total,
}: VerticalCompletionProps) {
  const percentage = (completed / total) * 100

  return (
    <div className="flex items-center gap-3 ml-10">
      {/* Vertical Bar */}
      <div className="h-3 w-20">
        <Progress
          value={percentage}
          className="h-full w-full"
        />
      </div>

      {/* Text */}
      <div className="text-xs font-medium">
        {completed} / {total}
      </div>
    </div>
  )
}
