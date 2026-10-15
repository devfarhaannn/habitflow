import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string }>;

// Change the order of the habits
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
    const { userId } = await params;

    const session = await getServerSession(NEXT_AUTH);

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (userId !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const body: {
        orderChange: {
            id: string;
            order: number;
        }[];
    } = await req.json();

    await prisma.$transaction(
        body.orderChange.map((change) =>
            prisma.habit.update({
                where: {
                    id: change.id,
                    userId,
                },
                data: {
                    order: change.order,
                },
            })
        )
    );

    return Response.json({ success: "true" });
}