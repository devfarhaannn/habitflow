
import { seedDatabase } from "@/lib/seedData"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { userId, timezone } = await req.json();

    try {
        await seedDatabase(userId, timezone)

        return NextResponse.json({
            success: true
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            { success: false },
            { status: 500 }
        )
    }

}