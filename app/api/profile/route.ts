
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(NEXT_AUTH);

        if (!session?.user?.id) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const name = body.name;
        const timezone = body.timezone;

        // Validate name only when it is provided.
        if (name !== undefined) {
            if (
                typeof name !== "string" ||
                !name.trim() ||
                name.trim().length > 100
            ) {
                return Response.json(
                    { message: "Please provide a valid name (1–100 characters)." },
                    { status: 400 }
                );
            }
        }

        if (typeof timezone !== "string") {
            return Response.json(
                { message: "Please provide a valid timezone." },
                { status: 400 }
            );
        }

        try {
            new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
            });
        } catch {
            return Response.json(
                { message: "Invalid timezone." },
                { status: 400 }
            );
        }

        const normalizedTimezone =
            timezone === "Asia/Calcutta"
                ? "Asia/Kolkata"
                : timezone;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                timezone: normalizedTimezone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                timezone: true,
            },
        });

        return Response.json({
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Profile update error:", error);

        return Response.json(
            { message: "Unable to update profile." },
            { status: 500 }
        );
    }
}
