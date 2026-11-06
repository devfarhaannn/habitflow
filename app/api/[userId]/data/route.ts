import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

type Params = {
    params: Promise<{ userId: string }>;
};

type BackupCategory = {
    id: string;
    title: string;
    userId?: string;
};

type BackupHabit = {
    id: string;
    userId?: string;
    order: number;
    title: string;
    description: string | null;
    color: string;
    icon: string;
    goalType: "DAILY" | "WEEKLY" | "MONTHLY";
    targetPerDay: number;
    streakGoal: number | null;
    categoryId: string;
    status: "ACTIVE" | "INACTIVE" | "COMPLETED" | "ARCHIVED";
    archivedAt: string | null;
    startDate: string;
    endDate: string | null;
    reminderEnabled: boolean;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    createdAt: string;
    updatedAt: string;
};

type BackupCompletion = {
    id: string;
    userId?: string;
    habitId: string;
    date: string;
    completedAt: string;
};

type BackupDailyStat = {
    id: string;
    userId?: string;
    habitId: string;
    date: string;
    completionCount: number;
    targetCount: number;
};

type BackupReminder = {
    id: string;
    userId?: string;
    habitId: string;
    time: string;
    daysOfWeek: number[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
};

type BackupData = {
    categories: BackupCategory[];
    habits: BackupHabit[];
    completions: BackupCompletion[];
    dailyStats: BackupDailyStat[];
    reminders: BackupReminder[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function hasValidUserId(record: Record<string, unknown>) {
    return record.userId === undefined ||
        typeof record.userId === "string";
}

function isCategoryBackup(value: unknown): value is BackupCategory {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        !!value.title.trim() &&
        hasValidUserId(value)
    );
}

function isHabitBackup(value: unknown): value is BackupHabit {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        !!value.title.trim() &&
        hasValidUserId(value) &&
        Number.isInteger(value.order) &&
        (typeof value.description === "string" || value.description === null) &&
        typeof value.color === "string" &&
        typeof value.icon === "string" &&
        ["DAILY", "WEEKLY", "MONTHLY"].includes(String(value.goalType)) &&
        Number.isInteger(value.targetPerDay) &&
        Number(value.targetPerDay) >= 1 &&
        (value.streakGoal === null || Number.isInteger(value.streakGoal)) &&
        typeof value.categoryId === "string" &&
        ["ACTIVE", "INACTIVE", "COMPLETED", "ARCHIVED"].includes(String(value.status)) &&
        (value.archivedAt === null || isValidDate(value.archivedAt)) &&
        isValidDate(value.startDate) &&
        (value.endDate === null || isValidDate(value.endDate)) &&
        typeof value.reminderEnabled === "boolean" &&
        Number.isInteger(value.currentStreak) &&
        Number.isInteger(value.longestStreak) &&
        Number.isInteger(value.totalCompletions) &&
        isValidDate(value.createdAt) &&
        isValidDate(value.updatedAt)
    );
}

function isCompletionBackup(value: unknown): value is BackupCompletion {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.habitId === "string" &&
        !!value.habitId &&
        hasValidUserId(value) &&
        isValidDate(value.date) &&
        isValidDate(value.completedAt)
    );
}

function isDailyStatBackup(value: unknown): value is BackupDailyStat {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.habitId === "string" &&
        !!value.habitId &&
        hasValidUserId(value) &&
        Number.isInteger(value.completionCount) &&
        Number(value.completionCount) >= 0 &&
        Number.isInteger(value.targetCount) &&
        Number(value.targetCount) >= 1 &&
        isValidDate(value.date)
    );
}

function isReminderBackup(value: unknown): value is BackupReminder {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.habitId === "string" &&
        !!value.habitId &&
        hasValidUserId(value) &&
        Array.isArray(value.daysOfWeek) &&
        value.daysOfWeek.every(
            (day) =>
                Number.isInteger(day) &&
                day >= 0 &&
                day <= 6
        ) &&
        new Set(value.daysOfWeek).size === value.daysOfWeek.length &&
        typeof value.enabled === "boolean" &&
        isValidDate(value.time) &&
        isValidDate(value.createdAt) &&
        isValidDate(value.updatedAt)
    );
}

function isBackupData(value: unknown): value is BackupData {
    return (
        isRecord(value) &&
        Array.isArray(value.categories) &&
        value.categories.every(isCategoryBackup) &&
        Array.isArray(value.habits) &&
        value.habits.every(isHabitBackup) &&
        Array.isArray(value.completions) &&
        value.completions.every(isCompletionBackup) &&
        Array.isArray(value.dailyStats) &&
        value.dailyStats.every(isDailyStatBackup) &&
        Array.isArray(value.reminders) &&
        value.reminders.every(isReminderBackup)
    );
}
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

        let backup: unknown;

        try {
            backup = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON backup file" },
                { status: 400 }
            );
        }

        if (
            !isRecord(backup) ||
            backup.app !== "HabitFlow" ||
            backup.version !== 1 ||
            !isBackupData(backup.data)
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

        // Prevent importing records belonging to another user.
        if (
            allRecords.some(
                (record) =>
                    record.userId !== undefined &&
                    record.userId !== userId
            )
        ) {
            return NextResponse.json(
                { error: "Backup contains invalid records" },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const categoryIds = categories.map((item) => item.id);
            const habitIds = habits.map((item) => item.id);
            const completionIds = completions.map((item) => item.id);
            const reminderIds = reminders.map((item) => item.id);
            const statIds = dailyStats.map((item) => item.id);
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
                    (habit) => !validCategoryIds.has(habit.categoryId)
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
                    (item) => !validHabitIds.has(item.habitId)
                ) ||
                dailyStats.some(
                    (item) => !validHabitIds.has(item.habitId)
                ) ||
                reminders.some(
                    (item) => !validHabitIds.has(item.habitId)
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