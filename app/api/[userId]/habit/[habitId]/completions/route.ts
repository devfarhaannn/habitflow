import { NEXT_AUTH } from "@/lib/authOptions";
import { getDateRanges } from "@/lib/dates";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string, habitId: string }>;


export async function PATCH(req: NextRequest, { params }: { params: Params }) {
    const { userId, habitId } = await params;
    const session = await getServerSession(NEXT_AUTH);

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (userId !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const body: { newValue: number, oldValue: number, target: number } = await req.json();
    const timezone = session?.user.timezone;
    const diff = body.newValue - body.oldValue;
    const { todayStart } = getDateRanges(timezone)

    await prisma.$transaction(async (tx) => {

        if (diff > 0) {
            await tx.habitCompletion.createMany({
                data: Array.from({ length: diff }).map(() => ({
                    habitId,
                    userId,
                }))
            });
        }

        const stat = await tx.habitDailyStat.upsert({
            where: {
                habitId_date: {
                    habitId: habitId,
                    date: todayStart,
                }
            },
            update: {
                completionCount: body.newValue,
            }, create: {
                habitId: habitId,
                userId: userId,
                date: new Date(todayStart),
                completionCount: body.newValue,
                targetCount: body.target
            }
        })

        if (diff !== 0) {
            await tx.habit.update({
                where: { id: habitId, userId: userId },
                data: {
                    totalCompletions: {
                        increment: diff
                    }
                }
            });
        }

        if (
            stat.completionCount >= stat.targetCount &&
            body.oldValue < stat.targetCount
        ) {

            const habit = await tx.habit.findUnique({
                where: { id: habitId }
            })

            const yesterday = new Date(todayStart)
            yesterday.setUTCDate(yesterday.getUTCDate() - 1)

            const yesterdayStat = await tx.habitDailyStat.findUnique({
                where: {
                    habitId_date: {
                        habitId,
                        date: yesterday
                    }
                }
            })

            let newStreak = 1

            if (
                yesterdayStat &&
                yesterdayStat.completionCount >= yesterdayStat.targetCount
            ) {
                newStreak = habit!.currentStreak + 1
            }

            await tx.habit.update({
                where: { id: habitId },
                data: {
                    currentStreak: newStreak,
                    longestStreak: Math.max(habit!.longestStreak, newStreak)
                }
            })
        }

    })


    return Response.json({ success: "true" });
}