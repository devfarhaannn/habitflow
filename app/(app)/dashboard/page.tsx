import { HabitInsightsCard } from "@/components/dashboard/habit-insight-card"
import { HabitMetricCards } from "@/components/dashboard/habit-metric-card"
import { HabitOverviewCards } from "@/components/dashboard/habit-overview-card"
import { HabitPerformanceSection } from "@/components/dashboard/habit-performance-section"
import { TopHabitsCard } from "@/components/dashboard/habit-top-card"
import { NEXT_AUTH } from "@/lib/authOptions"
import { getDashboardData, updateTimezone } from "@/lib/server/dashboard"
import { getServerSession } from "next-auth"


export default async function DashboardPage() {
    const session = await getServerSession(NEXT_AUTH);
    if (!session) {
        return
    }
    const userId = session.user.id;
    const timezone = session.user.timezone;

    if (session?.user?.timezone === "UTC") {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        await updateTimezone(userId, timezone);
    }

    const data = await getDashboardData(userId, timezone);

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <HabitOverviewCards data={data.habitOverviewData} />

            <div className='grid grid-cols-2 gap-6 lg:grid-cols-3 px-4 lg:px-6'>
                {/* Statistics Cards */}
                <HabitMetricCards metrics={data.habitMetricData} />

                <div className='grid gap-6 max-xl:col-span-full lg:max-xl:grid-cols-2'>
                    {/* Habit Insights Card */}
                    <HabitInsightsCard insights={data.habitInsightsData} />

                    {/* Top Performing Habits Card */}
                    <TopHabitsCard habits={data.topHabitsData} />
                </div>

                <HabitPerformanceSection habitPerformanceData={data.habitPerformanceData} />
            </div>

            {/* <DataTable data={habitTableData} /> */}
        </div>
    )
}
