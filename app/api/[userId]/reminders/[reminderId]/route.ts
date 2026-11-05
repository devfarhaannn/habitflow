
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{
    userId: string;
    reminderId: string;
}>;

// PATCH: Update reminder
export async function PATCH(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId, reminderId } = await params;
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

        // 4. Verify reminder ownership
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

        // 5. Prepare update data
        const updateData: {
            time?: Date;
            daysOfWeek?: number[];
            enabled?: boolean;
        } = {};

        // 6. Validate time
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

        // 7. Validate weekdays
        if (body.daysOfWeek !== undefined) {
            const days = body.daysOfWeek;

            if (
                !Array.isArray(days) ||
                days.length === 0 ||
                !days.every(
                    (day: unknown) =>
                        typeof day === "number" &&
                        Number.isInteger(day) &&
                        day >= 0 &&
                        day <= 6
                ) ||
                new Set(days).size !== days.length
            ) {
                return Response.json(
                    { error: "Invalid reminder days" },
                    { status: 400 }
                );
            }

            updateData.daysOfWeek = days as number[];
        }

        // 8. Validate enabled status
        if (body.enabled !== undefined) {
            if (typeof body.enabled !== "boolean") {
                return Response.json(
                    { error: "Enabled must be true or false" },
                    { status: 400 }
                );
            }

            updateData.enabled = body.enabled;
        }

        // 9. Check whether anything needs updating
        if (Object.keys(updateData).length === 0) {
            return Response.json(
                { error: "No valid fields provided" },
                { status: 400 }
            );
        }

        // 10. Update reminder
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

        return Response.json({
            success: true,
            reminder,
        });

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
    _: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId, reminderId } = await params;
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

        // 3. Verify reminder ownership
        const existingReminder = await prisma.habitReminder.findFirst({
            where: {
                id: reminderId,
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!existingReminder) {
            return Response.json(
                { error: "Reminder not found" },
                { status: 404 }
            );
        }

        // 4. Delete reminder
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
