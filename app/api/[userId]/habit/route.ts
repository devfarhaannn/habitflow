import { NEXT_AUTH } from "@/lib/authOptions";
import { getDateRanges } from "@/lib/dates";
import prisma from "@/lib/prisma";
import { startOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string }>;

// create a new habit
export async function POST(req: NextRequest, { params }: { params: Params }) {
    const { userId } = await params;
    const session = await getServerSession(NEXT_AUTH);
    const body = await req.json();

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (userId !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const startDateUTC = fromZonedTime(
        startOfDay(new Date(body.startDate)),
        session?.user.timezone || "UTC"
    )

    try {
        const habit = await prisma.habit.create({
            data: {
                userId: userId,
                title: body.title,
                description: body.description,
                icon: body.icon,
                color: body.color,
                goalType: body.goal,
                targetPerDay: body.target,
                categoryId: body.categoryId,
                startDate: startDateUTC,
            }
        })

        return Response.json({ success: "done" });
    } catch (error) {
        return Response.json(
            { error: "Error whiel fetching request" },
            { status: 400 }
        );
    }


}