
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { fromZonedTime } from "date-fns-tz";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string }>;

const ALLOWED_GOALS = ["DAILY", "WEEKLY", "MONTHLY"] as const;

export async function POST(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        // 1. Get route parameters
        const { userId } = await params;

        // 2. Authenticate user
        const session = await getServerSession(NEXT_AUTH);

        if (!session?.user?.id) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 3. Verify user ownership
        if (userId !== session.user.id) {
            return Response.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // 4. Parse request body
        // 4. Parse and validate request body
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

        const {
            title,
            description,
            icon,
            color,
            goal,
            target,
            categoryId,
            startDate
        } = body;

        // 5. Validate title
        if (
            typeof title !== "string" ||
            title.trim().length < 2 ||
            title.trim().length > 100
        ) {
            return Response.json(
                { error: "Title must be between 2 and 100 characters" },
                { status: 400 }
            );
        }

        // 6. Validate target
        if (
            typeof target !== "number" ||
            !Number.isInteger(target) ||
            target < 1
        ) {
            return Response.json(
                { error: "Target must be a positive integer" },
                { status: 400 }
            );
        }

        // 7. Validate goal type
        if (
            typeof goal !== "string" ||
            !ALLOWED_GOALS.includes(
                goal as typeof ALLOWED_GOALS[number]
            )
        ) {
            return Response.json(
                { error: "Invalid habit frequency" },
                { status: 400 }
            );
        }

        // 8. Validate category
        if (
            typeof categoryId !== "string" ||
            !categoryId.trim()
        ) {
            return Response.json(
                { error: "Category is required" },
                { status: 400 }
            );
        }

        // 9. Validate other fields
        if (typeof description !== "string") {
            return Response.json(
                { error: "Invalid description" },
                { status: 400 }
            );
        }

        if (
            typeof icon !== "string" ||
            typeof color !== "string"
        ) {
            return Response.json(
                { error: "Invalid icon or color" },
                { status: 400 }
            );
        }

        // 10. Validate start date
        if (
            typeof startDate !== "string" ||
            Number.isNaN(Date.parse(startDate))
        ) {
            return Response.json(
                { error: "Invalid start date" },
                { status: 400 }
            );
        }

        // 11. Verify category belongs to this user
        const category = await prisma.habitCategory.findFirst({
            where: {
                id: categoryId,
                userId
            },
            select: {
                id: true
            }
        });

        if (!category) {
            return Response.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        // 12. Validate timezone
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

        // 13. Convert start date to user's timezone
        const parsedStartDate = new Date(startDate);

        const localDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(parsedStartDate);

        const startDateUTC = fromZonedTime(
            `${localDate}T00:00:00`,
            timezone
        );

        // 14. Create habit
        const habit = await prisma.habit.create({
            data: {
                userId,
                title: title.trim(),
                description: description.trim(),
                icon,
                color,
                goalType: goal as typeof ALLOWED_GOALS[number],
                targetPerDay: target,
                categoryId,
                startDate: startDateUTC
            }
        });

        return Response.json(
            {
                success: true,
                habit
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create habit error:", error);

        return Response.json(
            { error: "Failed to create habit" },
            { status: 500 }
        );
    }
}
