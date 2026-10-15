import { CategoryChart } from "@/components/analytics/category-chart";
import { ChartAreaInteractive } from "@/components/analytics/chart-area-interactive"
import { HabitConsistencyChart } from "@/components/analytics/habit-consistency-chart";
import { TargetChartToday } from "@/components/analytics/habit-target-chart";
import { HabitOverviewCards } from "@/components/dashboard/habit-overview-card"
import { NEXT_AUTH } from "@/lib/authOptions"
import { getAnalyticsData } from "@/lib/server/analytics";
import { getDashboardData } from "@/lib/server/dashboard";
import { getServerSession } from "next-auth"

export default async function AnalyticsPage() {
    const session = await getServerSession(NEXT_AUTH);
    if (!session?.user.id) {
        return
    }
    const data = await getAnalyticsData(session?.user.id, session.user.timezone);
    const dashboardData = await getDashboardData(session?.user.id, session.user.timezone);

    console.log(data);

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <HabitOverviewCards data={data.habitOverviewData} />

            {/* Completion Chart */}
            <div className="px-4 lg:px-6">
                <ChartAreaInteractive chartData={data.habitCompletionChart} />
            </div>

            <div className='grid grid-cols-2 gap-6 lg:grid-cols-3 px-4 lg:px-6'>

                {/* Consistency Chart - bar chart */}
                <div className='grid gap-6 max-xl:col-span-full lg:max-xl:grid-cols-2'>
                    <HabitConsistencyChart chartData={data.consistencyChart} />
                </div>

                {/* Category Chart - pie chart */}
                <div className='grid gap-6 max-xl:col-span-full lg:max-xl:grid-cols-2'>
                    <CategoryChart chartData={data.categoryChart} />
                </div>

                {/* Habit Insights Card */}
                <div className='grid gap-6 max-xl:col-span-full lg:max-xl:grid-cols-2'>
                    <TargetChartToday monthlyTarget={data.monthlyTarget} />
                </div>
            </div>
        </div>
    )
}
