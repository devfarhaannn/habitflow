
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check PostgreSQL database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "operational",
        services: {
          application: "operational",
          database: "operational",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        services: {
          application: "operational",
          database: "unavailable",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
