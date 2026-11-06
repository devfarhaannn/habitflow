import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

type Params = {
    params: Promise<{ userId: string }>;
};
function isValidDate(value: unknown) {
    return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

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

        let backup;

        try {
            backup = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON backup file" },
                { status: 400 }
            );
        }

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

        const allRecords = [
            ...categories,
            ...habits,
            ...completions,
            ...dailyStats,
            ...reminders,
        ];

        // Basic record validation
        if (
            allRecords.some(
                (record) =>
                    !record ||
                    typeof record !== "object" ||
                    Array.isArray(record) ||
                    typeof record.id !== "string" ||
                    (record.userId && record.userId !== userId)
            )
        ) {
            return NextResponse.json(
                { error: "Backup contains invalid records" },
                { status: 400 }
            );
        }

        // Validate required fields
        if (
            categories.some(
                (item: any) =>
                    typeof item.title !== "string" ||
                    !item.title.trim()
            ) ||
            habits.some(
                (item: any) =>
                    typeof item.title !== "string" ||
                    !item.title.trim() ||
                    typeof item.categoryId !== "string" ||
                    !item.categoryId ||
                    !isValidDate(item.startDate) ||
                    (item.endDate !== null && item.endDate !== undefined && !isValidDate(item.endDate)) ||
                    (item.archivedAt !== null && item.archivedAt !== undefined && !isValidDate(item.archivedAt))
            ) ||
            completions.some(
                (item: any) =>
                    typeof item.habitId !== "string" ||
                    !item.habitId ||
                    !isValidDate(item.date) ||
                    !isValidDate(item.completedAt)
            ) ||
            dailyStats.some(
                (item: any) =>
                    typeof item.habitId !== "string" ||
                    !item.habitId ||
                    !Number.isInteger(item.completionCount) ||
                    !Number.isInteger(item.targetCount) ||
                    !isValidDate(item.date) ||
                    item.completionCount < 0 ||
                    item.targetCount < 1
            ) ||
            reminders.some(
                (item: any) =>
                    typeof item.habitId !== "string" ||
                    !item.habitId ||
                    !Array.isArray(item.daysOfWeek) ||
                    item.daysOfWeek.some(
                        (day: number) =>
                            !Number.isInteger(day) || day < 0 || day > 6
                    ) ||
                    new Set(item.daysOfWeek).size !== item.daysOfWeek.length ||
                    typeof item.enabled !== "boolean" ||
                    !item.time ||
                    !isValidDate(item.time)
            )
        ) {
            return NextResponse.json(
                { error: "Backup contains invalid field values" },
                { status: 400 }
            );
        }

        // Prevent duplicate IDs inside the backup.
        for (const collection of [
            categories,
            habits,
            completions,
            dailyStats,
            reminders,
        ]) {
            const ids = collection.map((item: any) => item.id);

            if (new Set(ids).size !== ids.length) {
                return NextResponse.json(
                    { error: "Backup contains duplicate record IDs" },
                    { status: 400 }
                );
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const categoryIds = categories.map((item: any) => item.id);
            const habitIds = habits.map((item: any) => item.id);
            const completionIds = completions.map((item: any) => item.id);
            const reminderIds = reminders.map((item: any) => item.id);
            const statIds = dailyStats.map((item: any) => item.id);

            // Check existing record ownership.
            const [
                existingCategories,
                existingHabits,
                existingCompletions,
                existingReminders,
                existingStats,
            ] = await Promise.all([
                tx.habitCategory.findMany({
                    where: { id: { in: categoryIds } },
                    select: { id: true, userId: true },
                }),
                tx.habit.findMany({
                    where: { id: { in: habitIds } },
                    select: { id: true, userId: true },
                }),
                tx.habitCompletion.findMany({
                    where: { id: { in: completionIds } },
                    select: { id: true, userId: true },
                }),
                tx.habitReminder.findMany({
                    where: { id: { in: reminderIds } },
                    select: { id: true, userId: true },
                }),
                tx.habitDailyStat.findMany({
                    where: {
                        OR: [
                            { id: { in: statIds } },
                            { habitId: { in: habitIds } },
                        ],
                    },
                    select: {
                        id: true,
                        habitId: true,
                        userId: true,
                    },
                }),
            ]);

            const existingRecords = [
                ...existingCategories,
                ...existingHabits,
                ...existingCompletions,
                ...existingReminders,
                ...existingStats,
            ];

            if (
                existingRecords.some(
                    (record) => record.userId !== userId
                )
            ) {
                throw new Error("BACKUP_OWNERSHIP_CONFLICT");
            }

            // Get all categories already owned by this user.
            const userCategories = await tx.habitCategory.findMany({
                where: { userId },
                select: { id: true },
            });

            const validCategoryIds = new Set([
                ...userCategories.map((item) => item.id),
                ...categoryIds,
            ]);

            if (
                habits.some(
                    (habit: any) => !validCategoryIds.has(habit.categoryId)
                )
            ) {
                throw new Error("INVALID_CATEGORY_REFERENCE");
            }

            // Get all existing habits owned by this user.
            const userHabits = await tx.habit.findMany({
                where: { userId },
                select: { id: true },
            });

            const validHabitIds = new Set([
                ...userHabits.map((item) => item.id),
                ...habitIds,
            ]);

            // Validate completion, statistics and reminder references.
            if (
                completions.some(
                    (item: any) => !validHabitIds.has(item.habitId)
                ) ||
                dailyStats.some(
                    (item: any) => !validHabitIds.has(item.habitId)
                ) ||
                reminders.some(
                    (item: any) => !validHabitIds.has(item.habitId)
                )
            ) {
                throw new Error("INVALID_HABIT_REFERENCE");
            }

            // Import categories.
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

            // Import habits.
            for (const habit of habits) {
                const {
                    id,
                    order,
                    title,
                    description,
                    color,
                    icon,
                    goalType,
                    targetPerDay,
                    streakGoal,
                    categoryId,
                    status,
                    archivedAt,
                    startDate,
                    endDate,
                    reminderEnabled,
                    currentStreak,
                    longestStreak,
                    totalCompletions,
                    createdAt,
                    updatedAt,
                } = habit;

                const fields = {
                    order,
                    title,
                    description,
                    color,
                    icon,
                    goalType,
                    targetPerDay,
                    streakGoal,
                    categoryId,
                    status,
                    archivedAt: archivedAt ? new Date(archivedAt) : null,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    reminderEnabled,
                    currentStreak,
                    longestStreak,
                    totalCompletions,
                };

                await tx.habit.upsert({
                    where: { id },
                    create: {
                        id,
                        userId,
                        ...fields,
                        ...(createdAt
                            ? { createdAt: new Date(createdAt) }
                            : {}),
                        ...(updatedAt
                            ? { updatedAt: new Date(updatedAt) }
                            : {}),
                    },
                    update: fields,
                });
            }

            // Import completions.
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

            // Import daily statistics.
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

            // Import reminders.
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

            return {
                categories: categories.length,
                habits: habits.length,
                completions: completions.length,
                dailyStats: dailyStats.length,
                reminders: reminders.length,
            };
        });

        return NextResponse.json({
            message: "Backup imported successfully",
            imported: result,
        });
    } catch (error) {
        console.error("Backup import error:", error);

        if (error instanceof Error) {
            if (error.message === "BACKUP_OWNERSHIP_CONFLICT") {
                return NextResponse.json(
                    { error: "Backup contains conflicting records." },
                    { status: 403 }
                );
            }

            if (
                error.message === "INVALID_CATEGORY_REFERENCE" ||
                error.message === "INVALID_HABIT_REFERENCE"
            ) {
                return NextResponse.json(
                    { error: "Backup contains invalid relationships." },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to import backup. Check the backup file and try again." },
            { status: 500 }
        );
    }
}