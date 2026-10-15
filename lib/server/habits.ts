import { startOfDay, subDays, subMonths } from "date-fns";
import prisma from "../prisma";
import { habitBackendDTO } from "@/types/types";
import { getDateRanges } from "../dates";

export async function getHabitsData(userId: string, timezone: string): Promise<habitBackendDTO> {
    const {
        todayStart,
        tomorrowStart,
        sevenDaysStart,
        prevMonthStart
    } = getDateRanges(timezone)

    const [habits, dailyStats, todayCompletions] = await Promise.all([
        prisma.habit.findMany({
            where: {
                userId: userId,
            },
            orderBy: { order: "asc" },
            select: {
                id: true,
                title: true,
                description: true,
                order: true,
                color: true,
                icon: true,
                goalType: true,
                targetPerDay: true,
                currentStreak: true,
                longestStreak: true,
                totalCompletions: true,
                status: true,
                startDate: true,
                endDate: true,
                reminderEnabled: true,
                categoryId: true,
                category: {
                    select: {
                        id: true,
                        title: true
                    }
                }

            }
        }),
        prisma.habitDailyStat.findMany({
            where: {
                userId: userId,
                date: {
                    gte: prevMonthStart,
                    lt: tomorrowStart
                }
            }, select: {
                habitId: true,
                date: true,
                completionCount: true,
                targetCount: true
            }
        }),
        prisma.habitDailyStat.findMany({
            where: {
                userId: userId,
                date: {
                    gte: todayStart,
                    lt: tomorrowStart
                }
            }, select: {
                habitId: true,
                completionCount: true,
            }
        })
    ]);

    const statsByHabit = new Map<string, typeof dailyStats>();

    dailyStats.forEach(stat => {
        if (!statsByHabit.has(stat.habitId)) {
            statsByHabit.set(stat.habitId, []);
        }
        statsByHabit.get(stat.habitId)!.push(stat);
    });

    const habitDailyCompletions = todayCompletions.reduce((acc, stat) => {
        if (!acc[stat.habitId]) {
            acc[stat.habitId] = [];
        }
        acc[stat.habitId].push(stat);
        return acc;
    }, {} as Record<string, typeof todayCompletions>);

    const result = habits.map(habit => {
        const allStats = statsByHabit.get(habit.id) || [];

        const currentWeekStats = allStats.filter(stat =>
            stat.date >= sevenDaysStart && stat.date < tomorrowStart
        )

        const todaysCompletion = habitDailyCompletions[habit.id]?.[0]?.completionCount ?? 0;

        return {
            ...habit,
            todaysCompletion: todaysCompletion,
            currentWeek: currentWeekStats,
            heatmap: allStats
        };
    });

    return result;
}

