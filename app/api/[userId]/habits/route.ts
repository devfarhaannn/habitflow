
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string }>;

export async function PATCH(
    req: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId } = await params;
        const session = await getServerSession(NEXT_AUTH);

        // Authentication
        if (!session?.user?.id) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Authorization
        if (userId !== session.user.id) {
            return Response.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // Parse request body
        let body: unknown;

        try {
            body = await req.json();
        } catch {
            return Response.json(
                { error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        // Validate order changes
        if (
            typeof body !== "object" ||
            body === null ||
            Array.isArray(body) ||
            !("orderChange" in body) ||
            !Array.isArray(body.orderChange) ||
            body.orderChange.length === 0
        ) {
            return Response.json(
                { error: "Invalid order data" },
                { status: 400 }
            );
        }

        const changes = body.orderChange;

        const validChanges = changes.every(
            (change: unknown) =>
                typeof change === "object" &&
                change !== null &&
                !Array.isArray(change) &&
                "id" in change &&
                typeof change.id === "string" &&
                change.id.trim().length > 0 &&
                "order" in change &&
                typeof change.order === "number" &&
                Number.isInteger(change.order) &&
                change.order >= 0
        );

        if (!validChanges) {
            return Response.json(
                { error: "Invalid habit order values" },
                { status: 400 }
            );
        }

        // Check duplicate IDs
        const habitIds = changes.map(
            (change: { id: string; order: number }) => change.id
        );

        if (new Set(habitIds).size !== habitIds.length) {
            return Response.json(
                { error: "Duplicate habit IDs" },
                { status: 400 }
            );
        }

        // Update all habit orders in one transaction

        await prisma.$transaction(
            async (tx) => {
                const habits = await tx.habit.findMany({
                    where: {
                        id: { in: habitIds },
                        userId,
                    },
                    select: { id: true },
                });

                if (habits.length !== habitIds.length) {
                    throw new Error("Habit not found or unauthorized");
                }

                for (const change of changes) {
                    await tx.habit.update({
                        where: {
                            id: change.id,
                            userId,
                        },
                        data: {
                            order: change.order,
                        },
                    });
                }
            },
            {
                maxWait: 10000,
                timeout: 20000,
            }
        );


        return Response.json({
            success: true,
            message: "Habit order updated successfully",
        });

    } catch (error) {
        console.error("Habit reorder error:", error);

        if (
            error instanceof Error &&
            error.message === "Habit not found or unauthorized"
        ) {
            return Response.json(
                { error: "One or more habits were not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { error: "Failed to update habit order" },
            { status: 500 }
        );
    }
}
