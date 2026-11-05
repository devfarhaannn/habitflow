
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string }>;

// GET: Fetch all reminders
export async function GET(
    _: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId } = await params;
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

        const reminders = await prisma.habitReminder.findMany({
            where: { userId },
            include: {
                habit: {
                    select: {
                        id: true,
                        title: true,
                        color: true,
                        icon: true,
                    },
                },
            },
            orderBy: {
                time: "asc",
            },
        });

        return Response.json(reminders);

    } catch (error) {
        console.error("Error fetching reminders:", error);

        return Response.json(
            { error: "Failed to fetch reminders" },
            { status: 500 }
        );
    }
}

// POST: Create a new reminder
export async function POST(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId } = await params;
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

        // Parse request body
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

        const { habitId, time, daysOfWeek } = body;

        // Validate required fields
        if (
            typeof habitId !== "string" ||
            !habitId.trim() ||
            typeof time !== "string" ||
            !Array.isArray(daysOfWeek)
        ) {
            return Response.json(
                { error: "Invalid reminder data" },
                { status: 400 }
            );
        }

        // Validate time format
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
            return Response.json(
                { error: "Invalid time format. Use HH:mm" },
                { status: 400 }
            );
        }

        // Validate weekdays: Sunday = 0, Saturday = 6
        const validDays =
            daysOfWeek.length > 0 &&
            daysOfWeek.every(
                (day: unknown) =>
                    typeof day === "number" &&
                    Number.isInteger(day) &&
                    day >= 0 &&
                    day <= 6
            );

        if (
            !validDays ||
            new Set(daysOfWeek).size !== daysOfWeek.length
        ) {
            return Response.json(
                { error: "Select valid reminder days" },
                { status: 400 }
            );
        }

        // Verify habit ownership
        const habit = await prisma.habit.findFirst({
            where: {
                id: habitId,
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!habit) {
            return Response.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        // Store time as UTC time-of-day
        const reminderTime = new Date(
            `1970-01-01T${time}:00.000Z`
        );

        const reminder = await prisma.habitReminder.create({
            data: {
                userId,
                habitId,
                time: reminderTime,
                daysOfWeek,
                enabled: true,
            },
            include: {
                habit: {
                    select: {
                        id: true,
                        title: true,
                        color: true,
                        icon: true,
                    },
                },
            },
        });

        return Response.json(reminder, { status: 201 });

    } catch (error) {
        console.error("Error creating reminder:", error);

        return Response.json(
            { error: "Failed to create reminder" },
            { status: 500 }
        );
    }
}
