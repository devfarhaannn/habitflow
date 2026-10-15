import {
    subDays,
    differenceInCalendarDays,
    subMonths
} from "date-fns"
import prisma from "../prisma"
import { AnalyticsBackendDTO } from "@/types/types"
import { getDateRanges } from "../dates"
import { formatInTimeZone } from "date-fns-tz"

function normalizeTimezone(tz: string) {
    if (tz === "Asia/Calcutta") return "Asia/Kolkata"
    return tz
}

export async function getAnalyticsData(
    userId: string, timezone: string
): Promise<AnalyticsBackendDTO> {

    const {
        todayStart,
        tomorrowStart,
        currentMonthStart,
        nextMonthStart,
        prevMonthStart,
        fourteenDaysStart,
        threeMonthsAgoStart,
    } = getDateRanges(timezone)

    // --------------------------------------------------
    // PARALLEL QUERIES
    // --------------------------------------------------
    const [
        habitsMeta,
        todayStats,
        currentMonthStats,
        prevMonthStats,
        largestStreak,
        chartRaw,
        consistencyStat,
        categoryStat,
        monthlyGroupedStats
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
        prisma.habit.aggregate({
            where: { userId },
            _max: { longestStreak: true }
        }),
        prisma.habitDailyStat.groupBy({
            by: ["date"],
            where: {
                userId,
                date: {
                    gte: threeMonthsAgoStart,
                    lt: tomorrowStart
                }
            },
            _sum: {
                completionCount: true
            },
            orderBy: {
                date: "asc"
            }
        }),
        prisma.habitDailyStat.findMany({
            where: {
                userId,
                date: {
                    gte: fourteenDaysStart,
                    lte: tomorrowStart
                }
            },
            select: {
                date: true,
                completionCount: true,
                targetCount: true,
                habitId: true
            }
        }),
        prisma.habitCategory.findMany({
            where: { userId },
            include: {
                habits: {
                    include: {
                        habitDailyStats: true
                    }
                }
            }
        }),
        prisma.habitDailyStat.groupBy({
            by: ["habitId"],
            where: {
                userId,
                date: { gte: currentMonthStart, lt: nextMonthStart }
            },
            _sum: { completionCount: true }
        }),
    ])

    const activeHabits = habitsMeta.length

    // --------------------------------------------------
    // 1️⃣ COMPLETED TODAY (Corrected)
    // --------------------------------------------------
    const completedToday = todayStats.filter(
        s => s.completionCount > 0
    ).length

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
    // CHART RAW
    // --------------------------------------------------
    const rawChartMap = new Map<string, number>()
    chartRaw.forEach(row => {
        const key = formatInTimeZone(row.date, timezone, "yyyy-MM-dd")
        rawChartMap.set(key, row._sum.completionCount ?? 0)
    })
    const rawChartData = []
    for (let i = 89; i >= 0; i--) {
        const date = subDays(todayStart, i)
        const key = formatInTimeZone(date, timezone, "yyyy-MM-dd")
        rawChartData.push({
            date: key,
            completions: rawChartMap.get(key) ?? 0
        })
    }

    // --------------------------------------------------
    // CONSISTENCY CHART
    // --------------------------------------------------
    const categoryMap = new Map()

    for (const stat of consistencyStat) {
        const key = stat.date.toISOString().slice(0, 10)

        if (!categoryMap.has(key)) {
            categoryMap.set(key, {
                date: key,
                completedHabits: 0,
                totalHabits: 0
            })
        }

        const row = categoryMap.get(key)

        if (stat.completionCount >= stat.targetCount) {
            row.completedHabits++
        }

        row.totalHabits++
    }

    const consistencyChartData = Array.from(categoryMap.values()).map(d => ({
        date: d.date,
        consistency: d.completedHabits / d.totalHabits
    }))

    // --------------------------------------------------
    // CATEGORY CHART
    // --------------------------------------------------
    const categoryChartData = categoryStat.map(cat => {
        const completions = cat.habits.reduce((sum, habit) => {
            return (
                sum +
                habit.habitDailyStats.reduce(
                    (s, stat) => s + stat.completionCount,
                    0
                )
            )
        }, 0)

        return {
            category: cat.title,
            completions
        }
    })

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

        habitCompletionChart: rawChartData,
        consistencyChart: consistencyChartData,
        categoryChart: categoryChartData,
        monthlyTarget
    }
}