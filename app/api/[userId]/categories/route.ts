
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ userId: string }>;

export async function GET(
    _: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { userId } = await params;
        const session = await getServerSession(NEXT_AUTH);

        // Check authentication
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check authorization
        if (userId !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // Fetch categories
        let categories = await prisma.habitCategory.findMany({
            where: { userId },
            select: {
                title: true,
                id: true,
            },
        });

        // Create default categories if none exist
        if (categories.length === 0) {
            await prisma.habitCategory.createMany({
                data: [
                    { title: "Health", userId },
                    { title: "Fitness", userId },
                    { title: "Productivity", userId },
                ],
            });

            categories = await prisma.habitCategory.findMany({
                where: { userId },
                select: {
                    title: true,
                    id: true,
                },
            });
        }

        return NextResponse.json(categories);

    } catch (error) {
        console.error("Error fetching categories:", error);

        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
