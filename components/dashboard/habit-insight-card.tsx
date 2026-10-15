'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import { EllipsisVerticalIcon, OptionIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { HabitInsightBackendDTO } from '@/types/types'

const HABIT_INSIGHTS_MENU_ITEMS = ['Share', 'Update', 'Refresh']

type HabitInsightsCardProps = {
  insights: HabitInsightBackendDTO
}

const habitInsightsChartConfig = {
  completed: {
    label: "Completed Habits",
    color: "hsl(var(--chart-bar))",
  },
  percentage: {
    label: "Completion %",
    color: "hsl(var(--chart-line))",
  },
} satisfies ChartConfig

export function HabitInsightsCard({ insights }: HabitInsightsCardProps) {

  return (
    <Card className='justify-between *:data-[slot=card-content]:space-y-5 gap-4' >

      <CardHeader className='flex justify-between'>
        <div className='flex flex-col gap-1'>
          <span className='text-lg font-semibold pb-2'>Habits Overview</span>
          <span className='text-muted-foreground text-sm'>Total Habits Created: {insights.totalHabitsCreated}</span>
          <span className='text-muted-foreground text-sm'>Categories Used: {insights.categoriesUsed}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='text-muted-foreground size-6 rounded'>
              <EllipsisVerticalIcon />
              <span className='sr-only'>Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              {HABIT_INSIGHTS_MENU_ITEMS.map((item, index) => (
                <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className='space-y-2'>
        <Separator />
        <div className='flex items-center justify-between gap-1 mb-0'>
          <span className='text-sm text-muted-foreground'>Total Completions :</span>
          <span className='text-2xl font-semibold'>{insights.totalCompletions}</span>
        </div>

        <div className='flex items-center justify-between gap-1'>
          <span className='text-sm text-muted-foreground'>Average Completion Rate : </span>
          <span className='font-semibold'>{insights.averageCompletionRate}%</span>
        </div>

        <div className="grid gap-6">
          <ChartContainer config={habitInsightsChartConfig} className="min-h-40 w-full">
            <BarChart accessibilityLayer data={insights.chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <Bar
                yAxisId="left"
                dataKey="completed"
                radius={[6, 6, 0, 0]}
                fill="var(--color-completed)" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>

    </Card>
  )
}
