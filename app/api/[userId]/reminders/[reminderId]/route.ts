import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{
    userId: string;
    reminderId: string;
}>;

// PATCH: Update reminder or enable/disable it
export async function PATCH(
    req: NextRequest,
    { params }: { params: Params }
) {
    const { userId, reminderId } = await params;
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

    try {
        const body = await req.json();

        const existingReminder = await prisma.habitReminder.findFirst({
            where: {
                id: reminderId,
                userId,
            },
        });

        if (!existingReminder) {
            return Response.json(
                { error: "Reminder not found" },
                { status: 404 }
            );
        }

        const updateData: {
            time?: Date;
            daysOfWeek?: number[];
            enabled?: boolean;
        } = {};

        if (body.time !== undefined) {
            if (
                typeof body.time !== "string" ||
                !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)
            ) {
                return Response.json(
                    { error: "Invalid time format. Use HH:mm" },
                    { status: 400 }
                );
            }

            updateData.time = new Date(
                `1970-01-01T${body.time}:00.000Z`
            );
        }

        if (body.daysOfWeek !== undefined) {
            const validDays =
                Array.isArray(body.daysOfWeek) &&
                body.daysOfWeek.length > 0 &&
                body.daysOfWeek.every(
                    (day: unknown) =>
                        typeof day === "number" &&
                        Number.isInteger(day) &&
                        day >= 0 &&
                        day <= 6
                );

            if (
                !validDays ||
                new Set(body.daysOfWeek).size !== body.daysOfWeek.length
            ) {
                return Response.json(
                    { error: "Invalid reminder days" },
                    { status: 400 }
                );
            }

            updateData.daysOfWeek = body.daysOfWeek;
        }

        if (body.enabled !== undefined) {
            if (typeof body.enabled !== "boolean") {
                return Response.json(
                    { error: "Enabled must be true or false" },
                    { status: 400 }
                );
            }

            updateData.enabled = body.enabled;
        }

        if (Object.keys(updateData).length === 0) {
            return Response.json(
                { error: "No valid fields provided" },
                { status: 400 }
            );
        }

        const reminder = await prisma.habitReminder.update({
            where: {
                id: reminderId,
            },
            data: updateData,
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

        return Response.json(reminder);
    } catch (error) {
        console.error("Error updating reminder:", error);

        return Response.json(
            { error: "Failed to update reminder" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a reminder
export async function DELETE(
    req: NextRequest,
    { params }: { params: Params }
) {
    const { userId, reminderId } = await params;
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

    try {
        const existingReminder = await prisma.habitReminder.findFirst({
            where: {
                id: reminderId,
                userId,
            },
        });

        if (!existingReminder) {
            return Response.json(
                { error: "Reminder not found" },
                { status: 404 }
            );
        }

        await prisma.habitReminder.delete({
            where: {
                id: reminderId,
            },
        });

        return Response.json({
            success: true,
            message: "Reminder deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting reminder:", error);

        return Response.json(
            { error: "Failed to delete reminder" },
            { status: 500 }
        );
    }
}