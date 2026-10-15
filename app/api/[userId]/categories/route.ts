import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
    const { userId } = await params;
    const session = await getServerSession(NEXT_AUTH);

    if (!userId) {
        return Response.json(
            { error: "UserId is required" },
            { status: 401 }
        );
    }

    if (userId != session?.user.id) {
        return Response.json(
            { error: "UserId not authorized" },
            { status: 401 }
        );
    }

    try {
        const categories = await prisma.habitCategory.findMany({
            where: {
                userId: userId
            }, select: {
                title: true,
                id: true,
            }
        })

        return Response.json(categories);
    } catch (error) {
        return Response.json(
            { error: "Error whiel fetching request" },
            { status: 400 }
        );
    }




}