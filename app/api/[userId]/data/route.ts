import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

import { importBackup } from "@/lib/services/backup.service";

import type {
    BackupCategory,
    BackupHabit,
    BackupCompletion,
    BackupDailyStat,
    BackupReminder,
    BackupData,
} from "@/lib/services/backup.service";

type Params = {
    params: Promise<{ userId: string }>;
};

// Validate JSON object.
function isRecord(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function hasValidUserId(record: Record<string, unknown>) {
    return (
        record.userId === undefined ||
        typeof record.userId === "string"
    );
}

function isValidDate(value: unknown) {
    return (
        typeof value === "string" &&
        !Number.isNaN(Date.parse(value))
    );
}

// Validate category.
function isCategoryBackup(value: unknown): value is BackupCategory {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        !!value.title.trim() &&
        hasValidUserId(value)
    );
}

// Validate habit.
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
        ["ACTIVE", "INACTIVE", "COMPLETED", "ARCHIVED"].includes(
            String(value.status)
        ) &&
        (value.isFavorite === undefined ||
            typeof value.isFavorite === "boolean") &&
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

// Validate completion.
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

// Validate daily statistics.
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

// Validate reminder.
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

// Validate complete backup data.
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

// ==========================================
// GET: Export user backup
// ==========================================

export async function GET(_: NextRequest, { params }: Params) {
    try {
        const { userId } = await params;
        const session = await getServerSession(NEXT_AUTH);

        if (!session?.user?.id || session.user.id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const [
            categories,
            habits,
            completions,
            dailyStats,
            reminders,
        ] = await Promise.all([
            prisma.habitCategory.findMany({
                where: { userId },
            }),

            prisma.habit.findMany({
                where: { userId },
            }),

            prisma.habitCompletion.findMany({
                where: { userId },
            }),

            prisma.habitDailyStat.findMany({
                where: { userId },
            }),

            prisma.habitReminder.findMany({
                where: { userId },
            }),
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

// ==========================================
// POST: Import user backup
// ==========================================

export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { userId } = await params;
        const session = await getServerSession(NEXT_AUTH);

        // Authentication.
        if (!session?.user?.id || session.user.id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse backup JSON.
        let backup: unknown;

        try {
            backup = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON backup file" },
                { status: 400 }
            );
        }

        // Validate backup format.
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

        // Call the backup service.
        const result = await importBackup(
            userId,
            backup.data
        );

        return NextResponse.json({
            message: "Backup imported successfully",
            imported: result,
        });

    } catch (error) {
        console.error("Backup import error:", error);

        if (error instanceof Error) {
            if (
                error.message === "INVALID_BACKUP_USER"
            ) {
                return NextResponse.json(
                    { error: "Backup contains invalid records" },
                    { status: 400 }
                );
            }

            if (
                error.message === "DUPLICATE_BACKUP_RECORDS" ||
                error.message === "DUPLICATE_DAILY_STATS"
            ) {
                return NextResponse.json(
                    { error: "Backup contains duplicate records." },
                    { status: 400 }
                );
            }

            if (
                error.message === "BACKUP_OWNERSHIP_CONFLICT"
            ) {
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
            {
                error: "Failed to import backup. Check the backup file and try again.",
            },
            { status: 500 }
        );
    }
}