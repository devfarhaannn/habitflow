import prisma from "@/lib/prisma";

export type BackupCategory = {
    id: string;
    title: string;
    userId?: string;
};

export type BackupHabit = {
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
    isFavorite?: boolean;
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

export type BackupCompletion = {
    id: string;
    userId?: string;
    habitId: string;
    date: string;
    completedAt: string;
};

export type BackupDailyStat = {
    id: string;
    userId?: string;
    habitId: string;
    date: string;
    completionCount: number;
    targetCount: number;
};

export type BackupReminder = {
    id: string;
    userId?: string;
    habitId: string;
    time: string;
    daysOfWeek: number[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
};

export type BackupData = {
    categories: BackupCategory[];
    habits: BackupHabit[];
    completions: BackupCompletion[];
    dailyStats: BackupDailyStat[];
    reminders: BackupReminder[];
};

const BATCH_SIZE = 100;

function chunks<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < items.length; i += size) {
        result.push(items.slice(i, i + size));
    }

    return result;
}

// Prevent duplicate IDs inside a batch.
// PostgreSQL cannot update the same conflicting row twice
// in a single INSERT ... ON CONFLICT statement.
function hasDuplicateIds(items: { id: string }[]): boolean {
    return new Set(items.map((item) => item.id)).size !== items.length;
}

export async function importBackup(
    userId: string,
    data: BackupData
) {
    const {
        categories,
        habits,
        completions,
        dailyStats,
        reminders,
    } = data;

    console.log("BACKUP IMPORT COUNTS:", {
        categories: categories.length,
        habits: habits.length,
        completions: completions.length,
        dailyStats: dailyStats.length,
        reminders: reminders.length,
    });

    // Validate duplicate IDs.
    if (
        hasDuplicateIds(categories) ||
        hasDuplicateIds(habits) ||
        hasDuplicateIds(completions) ||
        hasDuplicateIds(dailyStats) ||
        hasDuplicateIds(reminders)
    ) {
        throw new Error("DUPLICATE_BACKUP_RECORDS");
    }

    // Daily statistics also have a composite unique constraint:
    // (habitId, date).
    const dailyStatKeys = dailyStats.map(
        (item) => `${item.habitId}:${new Date(item.date).getTime()}`
    );

    if (new Set(dailyStatKeys).size !== dailyStatKeys.length) {
        throw new Error("DUPLICATE_DAILY_STATS");
    }

    // Prevent importing records belonging to another user.
    const allRecords = [
        ...categories,
        ...habits,
        ...completions,
        ...dailyStats,
        ...reminders,
    ];

    if (
        allRecords.some(
            (record) =>
                record.userId !== undefined &&
                record.userId !== userId
        )
    ) {
        throw new Error("INVALID_BACKUP_USER");
    }

    return prisma.$transaction(
        async (tx) => {
            const categoryIds = categories.map((item) => item.id);
            const habitIds = habits.map((item) => item.id);
            const completionIds = completions.map((item) => item.id);
            const reminderIds = reminders.map((item) => item.id);
            const statIds = dailyStats.map((item) => item.id);

            const referencedHabitIds = [
                ...new Set([
                    ...habitIds,
                    ...completions.map((item) => item.habitId),
                    ...dailyStats.map((item) => item.habitId),
                    ...reminders.map((item) => item.habitId),
                ]),
            ];

            // 1. Check ownership of existing records.
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
                            { habitId: { in: referencedHabitIds } },
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

            // 2. Validate category references.
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

            // 3. Validate habit references.
            const userHabits = await tx.habit.findMany({
                where: { userId },
                select: { id: true },
            });

            const validHabitIds = new Set([
                ...userHabits.map((item) => item.id),
                ...habitIds,
            ]);

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

            // 4. Import categories in batches.
            for (const batch of chunks(categories, BATCH_SIZE)) {
                await tx.$executeRaw`
                    INSERT INTO "HabitCategory" (
                        "id", "title", "userId"
                    )
                    SELECT
                        x."id", x."title", ${userId}
                    FROM jsonb_to_recordset(
                        ${JSON.stringify(batch)}::jsonb
                    ) AS x(
                        "id" text,
                        "title" text
                    )
                    ON CONFLICT ("id") DO UPDATE
                    SET "title" = EXCLUDED."title"
                `;
            }

            // 5. Import habits in batches.
            for (const batch of chunks(habits, BATCH_SIZE)) {
                const rows = batch.map((habit) => ({
                    ...habit,
                    isFavorite: habit.isFavorite ?? false,
                }));

                await tx.$executeRaw`
                    INSERT INTO "habits" (
                        "id", "order", "userId", "title",
                        "description", "color", "icon", "goalType",
                        "targetPerDay", "streakGoal", "categoryId",
                        "status", "isFavorite", "archivedAt",
                        "startDate", "endDate", "reminderEnabled",
                        "currentStreak", "longestStreak",
                        "totalCompletions", "createdAt", "updatedAt"
                    )
                    SELECT
                        x."id", x."order", ${userId}, x."title",
                        x."description", x."color", x."icon",
                        x."goalType"::"HabitFrequency",
                        x."targetPerDay", x."streakGoal",
                        x."categoryId",
                        x."status"::"HabitStatus",
                        x."isFavorite", x."archivedAt",
                        x."startDate", x."endDate",
                        x."reminderEnabled", x."currentStreak",
                        x."longestStreak", x."totalCompletions",
                        x."createdAt", x."updatedAt"
                    FROM jsonb_to_recordset(
                        ${JSON.stringify(rows)}::jsonb
                    ) AS x(
                        "id" text,
                        "order" integer,
                        "title" text,
                        "description" text,
                        "color" text,
                        "icon" text,
                        "goalType" text,
                        "targetPerDay" integer,
                        "streakGoal" integer,
                        "categoryId" text,
                        "status" text,
                        "isFavorite" boolean,
                        "archivedAt" timestamptz,
                        "startDate" timestamptz,
                        "endDate" timestamptz,
                        "reminderEnabled" boolean,
                        "currentStreak" integer,
                        "longestStreak" integer,
                        "totalCompletions" integer,
                        "createdAt" timestamptz,
                        "updatedAt" timestamptz
                    )
                    ON CONFLICT ("id") DO UPDATE SET
                        "order" = EXCLUDED."order",
                        "title" = EXCLUDED."title",
                        "description" = EXCLUDED."description",
                        "color" = EXCLUDED."color",
                        "icon" = EXCLUDED."icon",
                        "goalType" = EXCLUDED."goalType",
                        "targetPerDay" = EXCLUDED."targetPerDay",
                        "streakGoal" = EXCLUDED."streakGoal",
                        "categoryId" = EXCLUDED."categoryId",
                        "status" = EXCLUDED."status",
                        "isFavorite" = EXCLUDED."isFavorite",
                        "archivedAt" = EXCLUDED."archivedAt",
                        "startDate" = EXCLUDED."startDate",
                        "endDate" = EXCLUDED."endDate",
                        "reminderEnabled" = EXCLUDED."reminderEnabled",
                        "currentStreak" = EXCLUDED."currentStreak",
                        "longestStreak" = EXCLUDED."longestStreak",
                        "totalCompletions" = EXCLUDED."totalCompletions",
                        "updatedAt" = EXCLUDED."updatedAt"
                `;
            }

            // 6. Import completions in batches.
            for (const batch of chunks(completions, BATCH_SIZE)) {
                await tx.$executeRaw`
                    INSERT INTO "habit_completions" (
                        "id", "habitId", "userId",
                        "date", "completedAt"
                    )
                    SELECT
                        x."id", x."habitId", ${userId},
                        x."date", x."completedAt"
                    FROM jsonb_to_recordset(
                        ${JSON.stringify(batch)}::jsonb
                    ) AS x(
                        "id" text,
                        "habitId" text,
                        "date" timestamptz,
                        "completedAt" timestamptz
                    )
                    ON CONFLICT ("id") DO UPDATE SET
                        "date" = EXCLUDED."date",
                        "completedAt" = EXCLUDED."completedAt"
                `;
            }

            // 7. Import daily statistics in batches.
            for (const batch of chunks(dailyStats, BATCH_SIZE)) {
                await tx.$executeRaw`
                    INSERT INTO "habit_daily_stats" (
                        "id", "habitId", "userId", "date",
                        "completionCount", "targetCount"
                    )
                    SELECT
                        x."id", x."habitId", ${userId}, x."date",
                        x."completionCount", x."targetCount"
                    FROM jsonb_to_recordset(
                        ${JSON.stringify(batch)}::jsonb
                    ) AS x(
                        "id" text,
                        "habitId" text,
                        "date" timestamptz,
                        "completionCount" integer,
                        "targetCount" integer
                    )
                    ON CONFLICT ("habitId", "date") DO UPDATE SET
                        "completionCount" = EXCLUDED."completionCount",
                        "targetCount" = EXCLUDED."targetCount"
                `;
            }

            // 8. Import reminders in batches.
            for (const batch of chunks(reminders, BATCH_SIZE)) {
                await tx.$executeRaw`
                    INSERT INTO "habit_reminders" (
                        "id", "userId", "habitId", "time",
                        "daysOfWeek", "enabled",
                        "createdAt", "updatedAt"
                    )
                    SELECT
                        x."id", ${userId}, x."habitId", x."time",
                        ARRAY(
                            SELECT jsonb_array_elements_text(
                                x."daysOfWeek"
                            )::integer
                        ),
                        x."enabled", x."createdAt", x."updatedAt"
                    FROM jsonb_to_recordset(
                        ${JSON.stringify(batch)}::jsonb
                    ) AS x(
                        "id" text,
                        "habitId" text,
                        "time" timestamptz,
                        "daysOfWeek" jsonb,
                        "enabled" boolean,
                        "createdAt" timestamptz,
                        "updatedAt" timestamptz
                    )
                    ON CONFLICT ("id") DO UPDATE SET
                        "time" = EXCLUDED."time",
                        "daysOfWeek" = EXCLUDED."daysOfWeek",
                        "enabled" = EXCLUDED."enabled",
                        "updatedAt" = EXCLUDED."updatedAt"
                `;
            }

            return {
                categories: categories.length,
                habits: habits.length,
                completions: completions.length,
                dailyStats: dailyStats.length,
                reminders: reminders.length,
            };
        },
        {
            maxWait: 10000,
            timeout: 60000,
        }
    );
}