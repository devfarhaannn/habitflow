import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function DELETE() {
    try {
        const session = await getServerSession(NEXT_AUTH);

        if (!session?.user?.id) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        await prisma.$transaction(async (tx) => {
            // Delete habit completions first because their User
            // relation does not currently have onDelete: Cascade.
            await tx.habitCompletion.deleteMany({
                where: { userId },
            });

            // Delete the user and all related records.
            await tx.user.delete({
                where: { id: userId },
            });
        });

        return Response.json({
            message: "Account deleted successfully.",
        });

    } catch (error) {
        console.error("Account deletion error:", error);

        return Response.json(
            { message: "Unable to delete account." },
            { status: 500 }
        );
    }
}