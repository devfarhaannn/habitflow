import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { ReminderDashboard } from "@/components/reminders/reminder-dashboard";

export default async function ReminderPage() {
    const session = await getServerSession(NEXT_AUTH);

    if (!session?.user?.id) {
        return null;
    }

    const userId = session.user.id;

    const [habits, reminders] = await Promise.all([
        prisma.habit.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                title: true,
                color: true,
                icon: true,
            },
            orderBy: {
                order: "asc",
            },
        }),

        prisma.habitReminder.findMany({
            where: {
                userId,
            },
            include: {
                habit: {
                    select: {
                        id: true,
                        title: true,
                        color: true,
                        icon: true,
                    },
                },
            },
            orderBy: {
                time: "asc",
            },
        }),
    ]);

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ReminderDashboard
                userId={userId}
                habits={habits}
                initialReminders={reminders}
            />
        </div>
    );
}