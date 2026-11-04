import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

type Params = {
    params: Promise<{ userId: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
    try {
        const { userId } = await params;
        const session = await getServerSession(NEXT_AUTH);

        if (!session?.user?.id || session.user.id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [categories, habits, completions, dailyStats, reminders] =
            await Promise.all([
                prisma.habitCategory.findMany({ where: { userId } }),
                prisma.habit.findMany({ where: { userId } }),
                prisma.habitCompletion.findMany({ where: { userId } }),
                prisma.habitDailyStat.findMany({ where: { userId } }),
                prisma.habitReminder.findMany({ where: { userId } }),
            ]);

        return NextResponse.json({
            app: "HabitFlow",
            version: 1,
            exportedAt: new Date().toISOString(),
            data: {
                categories,
                habits,
                completions,
                dailyStats,
                reminders,
            },
        });
    } catch (error) {
        console.error("Backup export error:", error);
        return NextResponse.json(
            { error: "Failed to export data" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { userId } = await params;
        const session = await getServerSession(NEXT_AUTH);

        if (!session?.user?.id || session.user.id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backup = await request.json();

        if (
            backup?.app !== "HabitFlow" ||
            backup?.version !== 1 ||
            !backup?.data ||
            !Array.isArray(backup.data.categories) ||
            !Array.isArray(backup.data.habits) ||
            !Array.isArray(backup.data.completions) ||
            !Array.isArray(backup.data.dailyStats) ||
            !Array.isArray(backup.data.reminders)
        ) {
            return NextResponse.json(
                { error: "Invalid HabitFlow backup file" },
                { status: 400 }
            );
        }

        const {
            categories,
            habits,
            completions,
            dailyStats,
            reminders,
        } = backup.data;

        // Prevent importing records belonging to another user.
        const allRecords = [
            ...categories,
            ...habits,
            ...completions,
            ...dailyStats,
            ...reminders,
        ];

        if (allRecords.some((record) => !record || typeof record !== "object" ||
            (record.userId && record.userId !== userId))) {
            return NextResponse.json(
                { error: "Backup contains invalid user data" },
                { status: 400 }
            );
        }

        // Ensure every imported habit references a category in this backup
        // or an existing category belonging to the logged-in user.
        const categoryIds = new Set(
            categories.map((category: { id: string }) => category.id)
        );

        const existingCategories = await prisma.habitCategory.findMany({
            where: { userId },
            select: { id: true },
        });

        existingCategories.forEach((category) => categoryIds.add(category.id));

        if (habits.some((habit: { categoryId: string }) =>
            !categoryIds.has(habit.categoryId)
        )) {
            return NextResponse.json(
                { error: "A habit references a missing category" },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            for (const category of categories) {
                await tx.habitCategory.upsert({
                    where: { id: category.id },
                    create: {
                        id: category.id,
                        title: category.title,
                        userId,
                    },
                    update: {
                        title: category.title,
                    },
                });
            }

            for (const habit of habits) {
                const {
                    id, order, title, description, color, icon,
                    goalType, targetPerDay, streakGoal, categoryId,
                    status, archivedAt, startDate, endDate,
                    reminderEnabled, currentStreak, longestStreak,
                    totalCompletions, createdAt, updatedAt,
                } = habit;

                const fields = {
                    order, title, description, color, icon,
                    goalType, targetPerDay, streakGoal, categoryId,
                    status, archivedAt: archivedAt ? new Date(archivedAt) : null,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    reminderEnabled, currentStreak, longestStreak,
                    totalCompletions,
                };

                await tx.habit.upsert({
                    where: { id },
                    create: {
                        id,
                        userId,
                        ...fields,
                        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
                        ...(updatedAt ? { updatedAt: new Date(updatedAt) } : {}),
                    },
                    update: fields,
                });
            }

            for (const completion of completions) {
                await tx.habitCompletion.upsert({
                    where: { id: completion.id },
                    create: {
                        id: completion.id,
                        habitId: completion.habitId,
                        userId,
                        date: new Date(completion.date),
                        completedAt: new Date(completion.completedAt),
                    },
                    update: {
                        date: new Date(completion.date),
                        completedAt: new Date(completion.completedAt),
                    },
                });
            }

            for (const stat of dailyStats) {
                await tx.habitDailyStat.upsert({
                    where: {
                        habitId_date: {
                            habitId: stat.habitId,
                            date: new Date(stat.date),
                        },
                    },
                    create: {
                        id: stat.id,
                        habitId: stat.habitId,
                        userId,
                        date: new Date(stat.date),
                        completionCount: stat.completionCount,
                        targetCount: stat.targetCount,
                    },
                    update: {
                        completionCount: stat.completionCount,
                        targetCount: stat.targetCount,
                    },
                });
            }

            for (const reminder of reminders) {
                await tx.habitReminder.upsert({
                    where: { id: reminder.id },
                    create: {
                        id: reminder.id,
                        userId,
                        habitId: reminder.habitId,
                        time: new Date(reminder.time),
                        daysOfWeek: reminder.daysOfWeek,
                        enabled: reminder.enabled,
                        ...(reminder.createdAt
                            ? { createdAt: new Date(reminder.createdAt) }
                            : {}),
                        ...(reminder.updatedAt
                            ? { updatedAt: new Date(reminder.updatedAt) }
                            : {}),
                    },
                    update: {
                        time: new Date(reminder.time),
                        daysOfWeek: reminder.daysOfWeek,
                        enabled: reminder.enabled,
                    },
                });
            }
        });

        return NextResponse.json({
            message: "Backup imported successfully",
            imported: {
                categories: categories.length,
                habits: habits.length,
                completions: completions.length,
                dailyStats: dailyStats.length,
                reminders: reminders.length,
            },
        });
    } catch (error) {
        console.error("Backup import error:", error);
        return NextResponse.json(
            { error: "Failed to import backup. Check the backup file and try again." },
            { status: 500 }
        );
    }
}