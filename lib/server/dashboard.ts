import {
    subDays,
    differenceInCalendarDays,
    subMonths
} from "date-fns"
import prisma from "../prisma"
import { DashboardBackendDTO } from "@/types/types"
import { getDateRanges } from "../dates"
import { formatInTimeZone } from "date-fns-tz"

function normalizeTimezone(tz: string) {
    if (tz === "Asia/Calcutta") return "Asia/Kolkata"
    return tz
}

export async function getDashboardData(
    userId: string, timezone: string
): Promise<DashboardBackendDTO> {

    const safeTimezone = normalizeTimezone(timezone);

    const {
        todayStart,
        tomorrowStart,
        sevenDaysStart,
        fourteenDaysStart,
        currentMonthStart,
        nextMonthStart,
        prevMonthStart,
        fiveMonthsAgoStart
    } = getDateRanges(timezone)

    // --------------------------------------------------
    // PARALLEL QUERIES
    // --------------------------------------------------
    const [
        habitsMeta,
        todayStats,
        currentMonthStats,
        prevMonthStats,
        sevenDayStats,
        monthlyGroupedStats,
        daily14DaysStats,
        totalHabitsCreated,
        categoriesUsed,
        totalCompletions,
        largestStreak,
        monthlyChartRaw
    ] = await Promise.all([

        prisma.habit.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                color: true,
                currentStreak: true,
                longestStreak: true
            }
        }),

        prisma.habitDailyStat.findMany({
            where: {
                userId,
                date: {
                    gte: todayStart,
                    lt: tomorrowStart
                }
            }
        }),

        prisma.habitDailyStat.aggregate({
            where: {
                userId,
                date: {
                    gte: currentMonthStart,
                    lt: nextMonthStart
                }
            },
            _sum: { completionCount: true }
        }),

        prisma.habitDailyStat.aggregate({
            where: {
                userId,
                date: { gte: prevMonthStart, lt: currentMonthStart }
            },
            _sum: { completionCount: true }
        }),

        prisma.habitDailyStat.aggregate({
            where: {
                userId,
                date: {
                    gte: sevenDaysStart,
                    lt: tomorrowStart
                }
            },
            _sum: { completionCount: true }
        }),

        prisma.habitDailyStat.groupBy({
            by: ["habitId"],
            where: {
                userId,
                date: { gte: currentMonthStart, lt: nextMonthStart }
            },
            _sum: { completionCount: true }
        }),

        prisma.habitDailyStat.findMany({
            where: {
                userId,
                date: {
                    gte: fourteenDaysStart,
                    lt: tomorrowStart
                }
            }
        }),

        prisma.habit.count({ where: { userId } }),

        prisma.habitCategory.count({ where: { userId } }),

        prisma.habitCompletion.count({ where: { userId } }),

        prisma.habit.aggregate({
            where: { userId },
            _max: { longestStreak: true }
        }),

        prisma.$queryRaw<
            { month: Date; completed: number }[]
        >`
      SELECT 
        DATE_TRUNC('month', "date" AT TIME ZONE ${safeTimezone}) as month,
        SUM("completionCount") as completed
      FROM "habit_daily_stats"
      WHERE "userId" = ${userId}
      AND "date" >= ${fiveMonthsAgoStart}
      AND "date" < ${nextMonthStart}
      GROUP BY month
      ORDER BY month ASC
    `
    ])

    const activeHabits = habitsMeta.length

    // --------------------------------------------------
    // 1️⃣ COMPLETED TODAY (Corrected)
    // --------------------------------------------------
    const completedToday = todayStats.filter(
        s => s.completionCount > 0
    ).length

    const skippedToday = activeHabits - completedToday

    // --------------------------------------------------
    // 2️⃣ SUCCESS RATE (Stable & Correct)
    // --------------------------------------------------

    const daysPassedThisMonth =
        differenceInCalendarDays(todayStart, currentMonthStart) + 1

    const totalExpectedThisMonth = activeHabits * daysPassedThisMonth

    const totalCompletedThisMonth =
        currentMonthStats._sum.completionCount ?? 0

    const successRate =
        totalExpectedThisMonth > 0
            ? Math.round(
                (totalCompletedThisMonth / totalExpectedThisMonth) * 100
            )
            : 0

    const prevCompleted =
        prevMonthStats._sum.completionCount ?? 0

    const daysInPrevMonth =
        differenceInCalendarDays(currentMonthStart, prevMonthStart)

    const prevExpected = activeHabits * daysInPrevMonth

    const prevSuccessRate =
        prevExpected > 0
            ? Math.round((prevCompleted / prevExpected) * 100)
            : 0

    const successRateDiff = successRate - prevSuccessRate

    // --------------------------------------------------
    // 3️⃣ MONTHLY TARGET (Never Empty)
    // --------------------------------------------------

    const monthlyTarget = habitsMeta.map(habit => {
        const stat = monthlyGroupedStats.find(
            s => s.habitId === habit.id
        )

        return {
            habitId: habit.id,
            title: habit.title,
            color: habit.color,
            completedCount: stat?._sum.completionCount ?? 0,
            toComplete: daysPassedThisMonth
        }
    })

    const missedHabits = monthlyTarget.filter(
        h => h.completedCount < h.toComplete
    ).length

    // --------------------------------------------------
    // 4️⃣ 7-DAY CONSISTENCY
    // --------------------------------------------------

    const sevenDayCompleted =
        sevenDayStats._sum.completionCount ?? 0

    const sevenDayExpected = activeHabits * 7

    const weeklyPerformancePercentage =
        sevenDayExpected > 0
            ? Math.round(
                (sevenDayCompleted / sevenDayExpected) * 100
            )
            : 0

    // --------------------------------------------------
    // 5️⃣ 14-DAY CHART (Complete Fill)
    // --------------------------------------------------

    const dailyMap = new Map<string, number>()

    daily14DaysStats.forEach(d => {
        const key = formatInTimeZone(
            d.date,
            timezone,
            "yyyy-MM-dd"
        )

        dailyMap.set(
            key,
            (dailyMap.get(key) ?? 0) + d.completionCount
        )
    })

    const dailyData = []

    for (let i = 13; i >= 0; i--) {
        const date = subDays(todayStart, i)
        const key = formatInTimeZone(
            date,
            timezone,
            "yyyy-MM-dd"
        )

        dailyData.push({
            date: key,
            value: dailyMap.get(key) ?? 0
        })
    }

    // --------------------------------------------------
    // 6️⃣ TOP HABITS
    // --------------------------------------------------

    const topHabitsData = [...habitsMeta]
        .sort((a, b) => b.currentStreak - a.currentStreak)
        .slice(0, 2)
        .map(h => {
            const stat = monthlyGroupedStats.find(
                s => s.habitId === h.id
            )

            const progress =
                daysPassedThisMonth > 0
                    ? Math.round(
                        ((stat?._sum.completionCount ?? 0) /
                            daysPassedThisMonth) *
                        100
                    )
                    : 0

            return {
                icon: "Dumbbell",
                title: h.title,
                streak: h.currentStreak,
                progressPercentage: progress
            }
        })

    // --------------------------------------------------
    // 7️⃣ MONTHLY CHART (Rolling 6 Months)
    // --------------------------------------------------

    const monthMap = new Map<string, number>()

    monthlyChartRaw.forEach(row => {
        const key = formatInTimeZone(row.month, timezone, "yyyy-MM")
        monthMap.set(key, Number(row.completed))
    })

    const chartData = []

    for (let i = 4; i >= 0; i--) {
        const monthDate = subMonths(currentMonthStart, i)

        const key = formatInTimeZone(monthDate, timezone, "yyyy-MM")

        chartData.push({
            month: formatInTimeZone(monthDate, timezone, "MMMM"),
            completed: monthMap.get(key) ?? 0
        })
    }

    // --------------------------------------------------
    // FINAL DTO
    // --------------------------------------------------

    return {
        habitOverviewData: {
            streak: {
                value: `${largestStreak._max.longestStreak ?? 0} Days`,
                percentage: 0,
                isPositive: true
            },
            compeletion: {
                value: `${completedToday} / ${activeHabits}`,
                percentage:
                    activeHabits > 0
                        ? Math.round(
                            (completedToday / activeHabits) * 100
                        )
                        : 0,
                isPositive: completedToday >= activeHabits
            },
            activeHabits: {
                value: `${activeHabits}`,
                percentage: 0,
                isPositive: true
            },
            successRate: {
                value: `${successRate}%`,
                percentage: Math.abs(successRateDiff),
                isPositive: successRateDiff >= 0
            }
        },

        habitMetricData: {
            largestStreak:
                largestStreak._max.longestStreak ?? 0,
            missedHabit: missedHabits,
            skippedToday
        },

        habitInsightsData: {
            totalHabitsCreated,
            categoriesUsed,
            totalCompletions,
            averageCompletionRate: successRate,
            chartData
        },

        topHabitsData,

        habitPerformanceData: {
            summary: {
                goalAchieved: successRate,
                monthlyCompletion: totalCompletedThisMonth,
                totalStreak: habitsMeta.reduce(
                    (acc, h) => acc + h.currentStreak,
                    0
                ),
                totalHabitLog: totalCompletions
            },

            monthlyTarget,

            consistencyBar: {
                sevenDayStreak: {
                    completed: sevenDayCompleted,
                    total: sevenDayExpected
                },
                weeklyPerformance: {
                    completed: weeklyPerformancePercentage,
                    total: 100
                }
            },

            consistencyMetrics: {
                percentage: weeklyPerformancePercentage,
                dailyData
            }
        }
    }
}

export const updateTimezone = async (userId: string, timezone: string) => {
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            timezone
        }

    })
}