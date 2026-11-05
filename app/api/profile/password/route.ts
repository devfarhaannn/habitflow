import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

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
        const { currentPassword, newPassword } = body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string"
        ) {
            return Response.json(
                { message: "Please provide both passwords." },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return Response.json(
                { message: "New password must be at least 8 characters." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                passwordHash: true,
            },
        });

        if (!user?.passwordHash) {
            return Response.json(
                { message: "Your password is managed by Google." },
                { status: 400 }
            );
        }

        const isValid = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );

        if (!isValid) {
            return Response.json(
                { message: "Current password is incorrect." },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash },
        });

        return Response.json({
            message: "Password changed successfully.",
        });
    } catch (error) {
        console.error("Change password error:", error);

        return Response.json(
            { message: "Unable to change password." },
            { status: 500 }
        );
    }
}