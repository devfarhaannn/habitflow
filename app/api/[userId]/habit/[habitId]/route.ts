import { NEXT_AUTH } from "@/lib/authOptions";
import { getDateRanges } from "@/lib/dates";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string, habitId: string }>;


// Get a specific habit's title
export async function GET(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId, habitId } = await params;
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

        const habit = await prisma.habit.findFirst({
            where: {
                id: habitId,
                userId,
            },
            select: {
                title: true,
            },
        });

        if (!habit) {
            return Response.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        return Response.json({ title: habit.title });

    } catch (error) {
        console.error("Get habit title error:", error);

        return Response.json(
            { error: "Failed to fetch habit" },
            { status: 500 }
        );
    }
}

// Update a habit details and habit daily stat if target count changes
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
    const { userId, habitId } = await params;
    const session = await getServerSession(NEXT_AUTH);

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (userId !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json();
    const { id, ...updateData } = body

    if (habitId != id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { todayStart, tomorrowStart } = getDateRanges(session?.user.timezone)

    await prisma.habit.update({
        where: {
            id: habitId,
            userId: userId
        },
        data: updateData
    })

    if (updateData.targetPerDay !== undefined) {

        await prisma.habitDailyStat.updateMany({
            where: {
                habitId: habitId,
                userId: userId,
                date: {
                    gte: todayStart,
                    lt: tomorrowStart
                }
            },
            data: {
                targetCount: updateData.targetPerDay
            }
        })

    }

    return Response.json({ success: true });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId, habitId } = await params;
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

        const habit = await prisma.habit.findFirst({
            where: {
                id: habitId,
                userId,
            },
        });

        if (!habit) {
            return Response.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        await prisma.habit.delete({
            where: {
                id: habitId,
                userId,
            },
        });

        return Response.json({
            success: true,
            message: "Habit deleted successfully",
        });

    } catch (error) {
        console.error("Delete habit error:", error);

        return Response.json(
            {
                error: error instanceof Error
                    ? error.message
                    : "Unknown database error",
            },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId, habitId } = await params;
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

        const habit = await prisma.habit.findFirst({
            where: {
                id: habitId,
                userId,
            },
            select: {
                id: true,
                isFavorite: true,
            },
        });

        if (!habit) {
            return Response.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        const updatedHabit = await prisma.habit.update({
            where: {
                id: habitId,
                userId,
            },
            data: {
                isFavorite: !habit.isFavorite,
            },
            select: {
                isFavorite: true,
            },
        });

        return Response.json({
            success: true,
            isFavorite: updatedHabit.isFavorite,
            message: updatedHabit.isFavorite
                ? "Habit added to favorites"
                : "Habit removed from favorites",
        });

    } catch (error) {
        console.error("Toggle favorite error:", error);

        return Response.json(
            { error: "Failed to update favorite status" },
            { status: 500 }
        );
    }
}
