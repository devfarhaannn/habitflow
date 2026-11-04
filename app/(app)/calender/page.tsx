
import { getServerSession } from "next-auth";
import { formatInTimeZone } from "date-fns-tz";

import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { HabitCalendar } from "@/components/calendar/habit-calendar";

export default async function CalenderPage() {
    const session = await getServerSession(NEXT_AUTH);

    if (!session?.user?.id) {
        return null;
    }

    const timezone = session.user.timezone || "UTC";
    const userId = session.user.id;

    const [habits, dailyStats] = await Promise.all([
        prisma.habit.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                title: true,
                color: true,
                goalType: true,
                targetPerDay: true,
                startDate: true,
                endDate: true,
            },
            orderBy: {
                order: "asc",
            },
        }),

        prisma.habitDailyStat.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                habitId: true,
                date: true,
                completionCount: true,
                targetCount: true,
            },
            orderBy: {
                date: "asc",
            },
        }),
    ]);

    const formattedHabits = habits.map((habit) => ({
        ...habit,
        startDate: habit.startDate.toISOString(),
        endDate: habit.endDate?.toISOString() ?? null,
    }));

    const formattedStats = dailyStats.map((stat) => ({
        id: stat.id,
        habitId: stat.habitId,
        dateKey: formatInTimeZone(
            stat.date,
            timezone,
            "yyyy-MM-dd"
        ),
        completionCount: stat.completionCount,
        targetCount: stat.targetCount,
    }));

    return (
        <HabitCalendar
            habits={formattedHabits}
            stats={formattedStats}
            timezone={timezone}
        />
    );
}
