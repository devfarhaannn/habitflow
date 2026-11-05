
import { NEXT_AUTH } from "@/lib/authOptions";
import { getDateRanges } from "@/lib/dates";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { formatInTimeZone } from "date-fns-tz";

type Params = Promise<{
    userId: string;
    habitId: string;
}>;

function getPreviousDateKey(dateKey: string) {
    const date = new Date(`${dateKey}T12:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId, habitId } = await params;

        // 1. Authenticate the user
        const session = await getServerSession(NEXT_AUTH);

        if (!session?.user?.id) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (userId !== session.user.id) {
            return Response.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // 2. Validate request body

        let body: Record<string, unknown>;

        try {
            const parsedBody: unknown = await req.json();

            if (
                typeof parsedBody !== "object" ||
                parsedBody === null ||
                Array.isArray(parsedBody)
            ) {
                return Response.json(
                    { error: "Invalid request body" },
                    { status: 400 }
                );
            }

            body = parsedBody as Record<string, unknown>;

        } catch {
            return Response.json(
                { error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const newValue = body?.newValue;

        if (
            typeof newValue !== "number" ||
            !Number.isInteger(newValue) ||
            newValue < 0
        ) {
            return Response.json(
                { error: "newValue must be a non-negative integer" },
                { status: 400 }
            );
        }

        // 3. Get the user's timezone and today's boundaries
        const timezone = session.user.timezone || "UTC";

        try {
            new Intl.DateTimeFormat("en-US", {
                timeZone: timezone
            });
        } catch {
            return Response.json(
                { error: "Invalid user timezone" },
                { status: 400 }
            );
        }

        const { todayStart, tomorrowStart } =
            getDateRanges(timezone);

        const now = new Date();

        // 4. Update everything inside one transaction
        const result = await prisma.$transaction(async (tx) => {

            // Verify that this habit belongs to the authenticated user
            const habit = await tx.habit.findFirst({
                where: {
                    id: habitId,
                    userId
                },
                select: {
                    id: true,
                    targetPerDay: true
                }
            });

            if (!habit) {
                return { notFound: true as const };
            }

            const target = habit.targetPerDay;

            if (
                target < 1 ||
                newValue > target
            ) {
                return { invalidValue: true as const };
            }

            // 5. Get today's actual completion records
            const todayRecords = await tx.habitCompletion.findMany({
                where: {
                    habitId,
                    userId,
                    date: {
                        gte: todayStart,
                        lt: tomorrowStart
                    }
                },
                select: {
                    id: true
                },
                orderBy: {
                    completedAt: "desc"
                }
            });

            const currentCount = todayRecords.length;

            // 6. Create or delete records to match newValue
            if (newValue > currentCount) {
                const difference = newValue - currentCount;

                await tx.habitCompletion.createMany({
                    data: Array.from(
                        { length: difference },
                        () => ({
                            habitId,
                            userId,
                            date: now,
                            completedAt: now
                        })
                    )
                });
            } else if (newValue < currentCount) {
                const difference = currentCount - newValue;

                const recordsToDelete = todayRecords
                    .slice(0, difference)
                    .map((record) => record.id);

                await tx.habitCompletion.deleteMany({
                    where: {
                        id: {
                            in: recordsToDelete
                        }
                    }
                });
            }

            // 7. Update today's daily statistics
            await tx.habitDailyStat.upsert({
                where: {
                    habitId_date: {
                        habitId,
                        date: todayStart
                    }
                },
                update: {
                    completionCount: newValue,
                    targetCount: target
                },
                create: {
                    habitId,
                    userId,
                    date: todayStart,
                    completionCount: newValue,
                    targetCount: target
                }
            });

            // 8. Recalculate total completion records
            const totalCompletions = await tx.habitCompletion.count({
                where: {
                    habitId,
                    userId
                }
            });

            // 9. Read all daily statistics for streak calculation
            const dailyStats = await tx.habitDailyStat.findMany({
                where: {
                    habitId,
                    userId
                },
                select: {
                    date: true,
                    completionCount: true,
                    targetCount: true
                },
                orderBy: {
                    date: "asc"
                }
            });

            const completedDays = new Set<string>();

            for (const stat of dailyStats) {
                if (stat.completionCount >= stat.targetCount) {
                    const dateKey = formatInTimeZone(
                        stat.date,
                        timezone,
                        "yyyy-MM-dd"
                    );

                    completedDays.add(dateKey);
                }
            }

            // 10. Calculate longest streak
            let longestStreak = 0;
            let runningStreak = 0;
            let previousCompletedDay: string | null = null;

            for (const stat of dailyStats) {
                const dateKey = formatInTimeZone(
                    stat.date,
                    timezone,
                    "yyyy-MM-dd"
                );

                const isComplete =
                    stat.completionCount >= stat.targetCount;

                if (!isComplete) {
                    runningStreak = 0;
                    previousCompletedDay = null;
                    continue;
                }

                if (
                    previousCompletedDay &&
                    getPreviousDateKey(dateKey) === previousCompletedDay
                ) {
                    runningStreak++;
                } else {
                    runningStreak = 1;
                }

                longestStreak = Math.max(
                    longestStreak,
                    runningStreak
                );

                previousCompletedDay = dateKey;
            }

            // 11. Calculate current streak
            const todayKey = formatInTimeZone(
                todayStart,
                timezone,
                "yyyy-MM-dd"
            );

            // If today is not complete yet, preserve the streak
            // ending yesterday until the current day is missed.
            let currentDateKey = completedDays.has(todayKey)
                ? todayKey
                : getPreviousDateKey(todayKey);

            let currentStreak = 0;

            while (completedDays.has(currentDateKey)) {
                currentStreak++;

                currentDateKey =
                    getPreviousDateKey(currentDateKey);
            }

            // 12. Save the corrected values
            await tx.habit.update({
                where: {
                    id: habitId
                },
                data: {
                    totalCompletions,
                    currentStreak,
                    longestStreak
                }
            });

            return {
                success: true as const,
                completionCount: newValue,
                targetCount: target,
                totalCompletions,
                currentStreak,
                longestStreak
            };
        });

        if ("notFound" in result) {
            return Response.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        if ("invalidValue" in result) {
            return Response.json(
                { error: "Completion count cannot exceed the habit target" },
                { status: 400 }
            );
        }

        return Response.json(result);

    } catch (error) {
        console.error("Habit completion update failed:", error);

        return Response.json(
            { error: "Failed to update habit completion" },
            { status: 500 }
        );
    }
}
