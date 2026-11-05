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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId, habitId } = await params;
        const session = await getServerSession(NEXT_AUTH);

        // 1. Authentication
        if (!session?.user?.id) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Authorization
        if (userId !== session.user.id) {
            return Response.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // 3. Parse request body
        let body: Record<string, unknown>;

        try {
            body = await req.json();
        } catch {
            return Response.json(
                { error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const {
            id,
            title,
            description,
            status,
            categoryId,
            targetPerDay,
            goalType,
            icon,
            color,
            endDate
        } = body;

        // 4. Verify habit ID
        if (id !== undefined && id !== habitId) {
            return Response.json(
                { error: "Habit ID mismatch" },
                { status: 400 }
            );
        }

        // 5. Check whether the habit belongs to this user
        const existingHabit = await prisma.habit.findFirst({
            where: {
                id: habitId,
                userId
            },
            select: {
                id: true,
                startDate: true
            }
        });

        if (!existingHabit) {
            return Response.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        // 6. Validate editable fields
        const updateData: {
            title?: string;
            description?: string;
            status?: "ACTIVE" | "INACTIVE" | "COMPLETED" | "ARCHIVED";
            categoryId?: string;
            targetPerDay?: number;
            goalType?: "DAILY" | "WEEKLY" | "MONTHLY";
            icon?: string;
            color?: string;
            endDate?: Date | null;
        } = {};

        if (title !== undefined) {
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

            updateData.title = title.trim();
        }

        if (description !== undefined) {
            if (typeof description !== "string") {
                return Response.json(
                    { error: "Invalid description" },
                    { status: 400 }
                );
            }

            updateData.description = description.trim();
        }

        if (status !== undefined) {
            const allowedStatuses = [
                "ACTIVE",
                "INACTIVE",
                "COMPLETED",
                "ARCHIVED"
            ];

            if (
                typeof status !== "string" ||
                !allowedStatuses.includes(status)
            ) {
                return Response.json(
                    { error: "Invalid habit status" },
                    { status: 400 }
                );
            }

            updateData.status = status as typeof updateData.status;
        }

        if (categoryId !== undefined) {
            if (
                typeof categoryId !== "string" ||
                !categoryId.trim()
            ) {
                return Response.json(
                    { error: "Invalid category" },
                    { status: 400 }
                );
            }

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

            updateData.categoryId = categoryId;
        }

        if (targetPerDay !== undefined) {
            if (
                typeof targetPerDay !== "number" ||
                !Number.isInteger(targetPerDay) ||
                targetPerDay < 1
            ) {
                return Response.json(
                    { error: "Target must be a positive integer" },
                    { status: 400 }
                );
            }

            updateData.targetPerDay = targetPerDay;
        }

        if (goalType !== undefined) {
            const allowedGoals = ["DAILY", "WEEKLY", "MONTHLY"];

            if (
                typeof goalType !== "string" ||
                !allowedGoals.includes(goalType)
            ) {
                return Response.json(
                    { error: "Invalid habit frequency" },
                    { status: 400 }
                );
            }

            updateData.goalType = goalType as typeof updateData.goalType;
        }

        if (icon !== undefined) {
            if (typeof icon !== "string" || !icon.trim()) {
                return Response.json(
                    { error: "Invalid icon" },
                    { status: 400 }
                );
            }

            updateData.icon = icon;
        }

        if (color !== undefined) {
            if (typeof color !== "string" || !color.trim()) {
                return Response.json(
                    { error: "Invalid color" },
                    { status: 400 }
                );
            }

            updateData.color = color;
        }

        if (endDate !== undefined) {
            if (endDate === null) {
                updateData.endDate = null;
            } else if (
                typeof endDate === "string" &&
                !Number.isNaN(Date.parse(endDate))
            ) {
                updateData.endDate = new Date(endDate);
            } else {
                return Response.json(
                    { error: "Invalid end date" },
                    { status: 400 }
                );
            }
        }

        // 7. Check whether there is anything to update
        if (Object.keys(updateData).length === 0) {
            return Response.json(
                { error: "No valid changes provided" },
                { status: 400 }
            );
        }

        // 8. Update habit and daily stat together
        const timezone = session.user.timezone || "UTC";

        const { todayStart, tomorrowStart } = getDateRanges(timezone);

        const updatedHabit = await prisma.$transaction(async (tx) => {
            const habit = await tx.habit.update({
                where: {
                    id: habitId,
                    userId
                },
                data: updateData
            });

            if (updateData.targetPerDay !== undefined) {
                await tx.habitDailyStat.updateMany({
                    where: {
                        habitId,
                        userId,
                        date: {
                            gte: todayStart,
                            lt: tomorrowStart
                        }
                    },
                    data: {
                        targetCount: updateData.targetPerDay
                    }
                });
            }

            return habit;
        });

        return Response.json({
            success: true,
            message: "Habit updated successfully",
            habit: updatedHabit
        });

    } catch (error) {
        console.error("Update habit error:", error);

        return Response.json(
            { error: "Failed to update habit" },
            { status: 500 }
        );
    }
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
            { error: "Failed to delete habit" },
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
