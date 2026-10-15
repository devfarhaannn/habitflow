import { NEXT_AUTH } from "@/lib/authOptions";
import { getDateRanges } from "@/lib/dates";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string, habitId: string }>;


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