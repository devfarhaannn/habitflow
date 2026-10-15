import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
    const { userId } = await params;
    const session = await getServerSession(NEXT_AUTH);

    if (!userId || !session?.user?.id) {
        return Response.json(
            { error: "UserId is required or user is not authorized" },
            { status: 401 }
        );
    }

    if (userId !== session.user.id) {
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

        if (categories.length === 0) {
            await prisma.habitCategory.createMany({
                data: [
                    { title: "Health", userId: userId },
                    { title: "Fitness", userId: userId },
                    { title: "Productivity", userId: userId },
                ]
            });
            
            const newCategories = await prisma.habitCategory.findMany({
                where: {
                    userId: userId
                }, select: {
                    title: true,
                    id: true,
                }
            });
            return Response.json(newCategories);
        }

        return Response.json(categories);
    } catch (error) {
         console.error("Error fetching categories:", error);
        return Response.json(
            { error: "Error while fetching request" },
            { status: 400 }
        );
    }




}